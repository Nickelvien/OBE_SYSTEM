// app/dashboard/page.tsx — Modern dashboard with live data
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  BookOpen, Users, BarChart3, AlertTriangle,
  Activity, FileText, GraduationCap,
  TrendingUp, Clock, Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Dashboard — OBE Cycle Management System | ACES Panabo',
}

const roleWelcome: Record<string, string> = {
  super_admin: 'System overview and full access controls.',
  campus_admin: 'Manage programs, users, and academic periods.',
  dean: 'Review department program outcomes and reports.',
  program_head: 'Run OBE cycles, review attainment, manage CQI.',
  faculty: 'Enter scores and view CLO attainment for your courses.',
  student: 'View your learning outcomes and portfolio.',
  accreditor: 'Read-only access to program evidence and attainment data.',
}

interface StatCardConfig {
  id: string; label: string; icon: React.ElementType
  color: string; iconBg: string; iconColor: string
}

const statCards: StatCardConfig[] = [
  { id: 'stat-programs', label: 'Total Programs', icon: BookOpen, color: 'border-primary/20', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { id: 'stat-users', label: 'Total Users', icon: Users, color: 'border-cyan-500/20', iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-400' },
  { id: 'stat-attainment', label: 'CLOs Meeting Target', icon: Target, color: 'border-amber-500/20', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  { id: 'stat-cqi', label: 'Open CQI Plans', icon: AlertTriangle, color: 'border-red-500/20', iconBg: 'bg-red-500/10', iconColor: 'text-red-400' },
]

function StatCard({ config, value }: { config: StatCardConfig; value: number }) {
  const Icon = config.icon
  return (
    <Card id={config.id} className={cn('stat-glow group hover:bg-white/[0.06] transition-all duration-300', config.color)}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110', config.iconBg)}>
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>
        <div>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">{config.label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickLink { href: string; label: string; description: string; icon: React.ElementType; roles: string[]; color: string }
const quickLinks: QuickLink[] = [
  { href: '/dashboard/programs', label: 'Programs', description: 'OBE cycles & curriculum', icon: BookOpen, roles: ['super_admin','campus_admin','dean','program_head','accreditor'], color: 'text-primary' },
  { href: '/dashboard/faculty/assignments', label: 'My Courses', description: 'Score entry & assessments', icon: Activity, roles: ['faculty'], color: 'text-cyan-400' },
  { href: '/dashboard/cqi', label: 'CQI Plans', description: 'Open action plans', icon: AlertTriangle, roles: ['super_admin','campus_admin','dean','program_head'], color: 'text-amber-400' },
  { href: '/dashboard/reports', label: 'Reports', description: 'CHED / TESDA reports', icon: FileText, roles: ['super_admin','campus_admin','dean','program_head','accreditor'], color: 'text-rose-400' },
  { href: '/dashboard/analytics', label: 'Analytics', description: 'System-wide attainment view', icon: BarChart3, roles: ['super_admin','campus_admin','dean'], color: 'text-blue-400' },
  { href: '/dashboard/admin/users', label: 'User Management', description: 'Add / edit / manage users', icon: Users, roles: ['super_admin','campus_admin'], color: 'text-purple-400' },
  { href: '/dashboard/student', label: 'My Results', description: 'CLO attainment portfolio', icon: GraduationCap, roles: ['student'], color: 'text-green-400' },
  { href: '/dashboard/accreditor', label: 'Program Review', description: 'Read-only evidence view', icon: BookOpen, roles: ['accreditor'], color: 'text-rose-400' },
]

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = session.user.role as string
  const welcome = roleWelcome[role] ?? ''
  const name =
    (session.user as { name?: string; firstName?: string }).name ||
    (session.user as { firstName?: string }).firstName ||
    'User'

  const [programCount, userCount, closMeeting, openCqi] = await Promise.all([
    prisma.program.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.attainmentResult.count({ where: { entityType: 'clo', isStale: false, attainmentPercentage: { gte: 75 } } }),
    prisma.cqiActionPlan.count({ where: { status: 'open', deletedAt: null } }),
  ])

  const stats = [programCount, userCount, closMeeting, openCqi]
  const visibleLinks = quickLinks.filter((l) => l.roles.includes(role))

  return (
    <div className="flex flex-col gap-8 stagger">
      {/* Greeting */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {String(name).split(' ')[0]}
          </h1>
          <span className="text-2xl">👋</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm">{welcome}</p>
          <Badge variant="outline" className="text-[10px] capitalize ml-1 gap-1 bg-transparent">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            {role.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((config, i) => (
          <StatCard key={config.id} config={config} value={stats[i]} />
        ))}
      </div>

      {/* Quick links */}
      {visibleLinks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Access</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {visibleLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  id={`quick-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  href={link.href}
                  className="group rounded-2xl bg-card border border-border p-4 flex flex-col gap-3 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.03] group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                    <Icon className={cn('w-4 h-4 transition-colors duration-300 group-hover:text-primary', link.color)} />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold group-hover:text-primary transition-colors">{link.label}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{link.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Role tips */}
      {role === 'faculty' && (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Quick Tip</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  After entering scores, ask your program head to trigger attainment computation to update CLO/PLO results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {role === 'program_head' && openCqi > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/[0.03]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-sm text-amber-300">
                    You have <strong>{openCqi}</strong> open CQI action plan{openCqi !== 1 ? 's' : ''} requiring attention.
                  </span>
                </div>
              </div>
              <Link href="/dashboard/cqi">
                <Button variant="outline" size="sm" className="whitespace-nowrap border-amber-500/30 text-amber-400 hover:text-amber-300 hover:border-amber-500/50">
                  View Plans →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}