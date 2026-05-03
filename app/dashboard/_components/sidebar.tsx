// app/dashboard/_components/sidebar.tsx
'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, BarChart3,
  FileText, Shield, GraduationCap, Activity, CheckSquare,
  Settings, Sliders, Eye, LogOut, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

export interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: string[]
  group?: string
}

export const navItems: NavItem[] = [
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

export const groupOrder = ['Main', 'OBE', 'Faculty', 'Student', 'Accreditor', 'Admin']

const roleBadgeVariant: Record<string, string> = {
  super_admin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  campus_admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  dean: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  program_head: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  faculty: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  student: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  accreditor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
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
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className={cn(
        'hidden md:flex flex-shrink-0 flex-col h-full border-r border-app-border bg-app-surface transition-all duration-300 ease-out relative z-30'
      )}
    >
      {/* Brand header */}
      <div className={cn('flex items-center gap-3 py-6 border-b border-app-border flex-shrink-0', collapsed ? 'px-4 justify-center' : 'px-6')}>
        <Link href="/dashboard" className="relative group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-2xl bg-app-bg border border-brand/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:border-brand transition-all p-1.5"
          >
            <Image src="/ac.png" alt="Institutional Logo" width={32} height={32} className="object-contain" priority />
          </motion.div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-brand border-[3px] border-app-surface" />
        </Link>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden"
          >
            <p className="text-base font-bold text-app-text leading-tight whitespace-nowrap tracking-tight">OBE System</p>
            <p className="text-[10px] text-brand font-mono font-bold tracking-[0.2em] uppercase leading-tight mt-0.5">ACES Panabo</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-hide px-3">
        {groups.map((group, groupIdx) => {
          const items = visible.filter((i) => i.group === group)
          return (
            <motion.div 
              key={group}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + groupIdx * 0.05 }}
              className="space-y-1"
            >
              {group !== 'Main' && !collapsed && (
                <p className="text-[10px] font-bold text-app-muted uppercase tracking-[0.2em] px-4 mb-3 opacity-60 font-mono">
                  {group}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))

                  const link = (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative',
                        collapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-4 py-3',
                        isActive
                          ? 'bg-brand/10 text-brand border border-brand/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                          : 'text-app-muted hover:text-app-text hover:bg-white/[0.03]'
                      )}
                    >
                      {isActive && !collapsed && (
                        <motion.div 
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 w-1 h-6 bg-brand rounded-r-full"
                        />
                      )}
                      <Icon className={cn(
                        'w-[18px] h-[18px] flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
                        isActive && 'text-brand'
                      )} />
                      {!collapsed && <span className="tracking-tight">{item.label}</span>}
                    </Link>
                  )

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href} delayDuration={100}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right" className="bg-app-surface border-app-border text-app-text ml-2">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }
                  return link
                })}
              </div>
            </motion.div>
          )
        })}
      </nav>

      <Separator className="bg-app-border" />

      {/* User area */}
      <div className={cn('flex-shrink-0 py-6', collapsed ? 'px-3' : 'px-6')}>
        <div className={cn('flex items-center', collapsed ? 'flex-col gap-4' : 'justify-between')}>
          <div className={cn('flex items-center gap-3', collapsed ? 'flex-col' : '')}>
            <Avatar className="w-10 h-10 ring-2 ring-brand/20">
              <AvatarFallback className="bg-app-bg text-brand text-xs font-bold font-mono">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-app-text truncate leading-tight tracking-tight">{userName}</p>
                <div className={cn("inline-block mt-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider", roleBadgeVariant[role])}>
                  {role === 'super_admin' ? 'Admin' : role.replace(/_/g, ' ')}
                </div>
              </div>
            )}
          </div>

          <div className={cn('flex items-center gap-1', collapsed ? 'flex-col' : '')}>
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-app-muted hover:text-brand hover:bg-brand/10 transition-all"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}