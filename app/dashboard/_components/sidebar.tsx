'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, BarChart3,
  FileText, Shield, GraduationCap, Activity, CheckSquare,
  Settings, Sliders, Eye, LogOut, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: string[]
  group?: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin','campus_admin','dean','program_head','faculty','student','accreditor'], group: 'Main' },
  { href: '/dashboard/programs', label: 'Programs', icon: BookOpen, roles: ['super_admin','campus_admin','dean','program_head'], group: 'OBE' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, roles: ['super_admin','campus_admin','dean'], group: 'OBE' },
  { href: '/dashboard/cqi', label: 'CQI Plans', icon: CheckSquare, roles: ['super_admin','campus_admin','dean','program_head'], group: 'OBE' },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText, roles: ['super_admin','campus_admin','dean','program_head','accreditor'], group: 'OBE' },
  { href: '/dashboard/faculty/assignments', label: 'My Courses', icon: ClipboardList, roles: ['faculty'], group: 'Faculty' },
  { href: '/dashboard/student', label: 'My Results', icon: GraduationCap, roles: ['student'], group: 'Student' },
  { href: '/dashboard/accreditor', label: 'Review Programs', icon: Eye, roles: ['accreditor'], group: 'Accreditor' },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users, roles: ['super_admin','campus_admin'], group: 'Admin' },
  { href: '/dashboard/admin/departments', label: 'Departments', icon: Settings, roles: ['super_admin','campus_admin'], group: 'Admin' },
  { href: '/dashboard/admin/programs', label: 'Programs Config', icon: BookOpen, roles: ['super_admin','campus_admin'], group: 'Admin' },
  { href: '/dashboard/admin/grading-systems', label: 'Grading Systems', icon: Sliders, roles: ['super_admin','campus_admin'], group: 'Admin' },
  { href: '/dashboard/admin/periods', label: 'Periods', icon: Activity, roles: ['super_admin','campus_admin'], group: 'Admin' },
  { href: '/dashboard/admin/audit-logs', label: 'Audit Logs', icon: Shield, roles: ['super_admin'], group: 'Admin' },
  { href: '/dashboard/privacy', label: 'Privacy (DPO)', icon: Shield, roles: ['super_admin'], group: 'Admin' },
]

const groupOrder = ['Main', 'OBE', 'Faculty', 'Student', 'Accreditor', 'Admin']

const roleBadgeVariant: Record<string, 'default' | 'purple' | 'info' | 'success' | 'warning' | 'secondary' | 'rose'> = {
  super_admin: 'purple',
  campus_admin: 'default',
  dean: 'info',
  program_head: 'success',
  faculty: 'warning',
  student: 'secondary',
  accreditor: 'rose',
}

export function Sidebar({ role, userName }: { role: string; userName: string; userEmail?: string }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const visible = navItems.filter((item) => item.roles.includes(role))
  const groups = groupOrder.filter((g) => visible.some((i) => i.group === g))

  const toggle = useCallback(() => setCollapsed((c) => !c), [])

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside
      className={cn(
        'flex-shrink-0 flex flex-col h-full border-r border-border bg-card/95 backdrop-blur-xl transition-all duration-300 ease-out relative z-20',
        collapsed ? 'w-[72px]' : 'w-sidebar'
      )}
    >
      {/* Brand header */}
      <div className={cn('flex items-center gap-3 py-5 border-b border-border flex-shrink-0', collapsed ? 'px-4 justify-center' : 'px-5')}>
        <Link href="/dashboard" className="relative group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-primary-foreground">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-card animate-pulse-ring" />
        </Link>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-tight whitespace-nowrap">OBE System</p>
            <p className="text-[11px] text-primary font-medium leading-tight">ACES Panabo</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide">
        {groups.map((group) => {
          const items = visible.filter((i) => i.group === group)
          return (
            <div key={group} className={cn(collapsed ? 'px-2' : 'px-3')}>
              {group !== 'Main' && !collapsed && (
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-2">{group}</p>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))

                  const link = (
                    <Link
                      key={item.href}
                      id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                        collapsed ? 'justify-center w-11 h-11 mx-auto' : 'px-3 py-2.5',
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                      )}
                    >
                      <Icon className={cn(
                        'w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                        isActive && 'text-primary'
                      )} />
                      {!collapsed && <span>{item.label}</span>}
                      {isActive && !collapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-ring" />
                      )}
                    </Link>
                  )

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href} delayDuration={100}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right" className="ml-2">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }
                  return link
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <Separator />

      {/* User area */}
      <div className={cn('flex-shrink-0 py-4', collapsed ? 'px-3' : 'px-5')}>
        <div className={cn('flex items-center', collapsed ? 'flex-col gap-2' : 'justify-between')}>
          <div className={cn('flex items-center gap-3', collapsed ? 'flex-col' : '')}>
            <Avatar className="w-8 h-8 ring-2 ring-border">
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-emerald-500/30 text-[11px]">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <Badge variant={roleBadgeVariant[role] ?? 'secondary'} className="text-[10px] py-0 h-[18px] capitalize">
                  {role.replace(/_/g, ' ')}
                </Badge>
              </div>
            )}
          </div>

          <div className={cn('flex items-center gap-1', collapsed ? 'flex-col' : '')}>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  onClick={toggle}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
                >
                  {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{collapsed ? 'Expand' : 'Collapse'} sidebar</TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  )
}