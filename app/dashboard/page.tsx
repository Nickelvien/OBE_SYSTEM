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
  TrendingUp, Clock, Target, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  trend?: string; trendUp?: boolean;
}

const statCards: StatCardConfig[] = [
  { id: 'stat-programs', label: 'Active Programs', icon: BookOpen, color: 'border-brand/10', iconBg: 'bg-brand/10', iconColor: 'text-brand', trend: '+12% from last year', trendUp: true },
  { id: 'stat-users', label: 'Total Users', icon: Users, color: 'border-blue-500/10', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400', trend: '+4 new this month', trendUp: true },
  { id: 'stat-attainment', label: 'CLO Targets Met', icon: Target, color: 'border-cyan-500/10', iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-400', trend: '+5.2% vs target', trendUp: true },
  { id: 'stat-cqi', label: 'Open CQI Plans', icon: AlertTriangle, color: 'border-red-500/10', iconBg: 'bg-red-500/10', iconColor: 'text-red-400', trend: '-2 resolved', trendUp: true },
]

function StatCard({ config, value }: { config: StatCardConfig; value: number }) {
  const Icon = config.icon
  return (
    <div 
      id={config.id} 
      className={cn(
        'group bg-app-surface border border-app-border rounded-[24px] p-6 transition-all duration-500 hover:border-brand/30 hover:-translate-y-1 relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-brand/5 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100'
      )}
    >
      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div className="flex items-center justify-between">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-lg', config.iconBg)}>
            <Icon className={cn('w-5 h-5', config.iconColor)} />
          </div>
          {config.trend && (
            <div className={cn("flex items-center gap-1.5 text-[10px] font-bold font-mono tracking-wider px-2.5 py-1 rounded-full uppercase", config.trendUp ? "bg-brand/10 text-brand" : "bg-red-500/10 text-red-400")}>
              {config.trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {config.trend}
            </div>
          )}
        </div>
        <div>
          <p className="text-4xl font-bold text-app-text tracking-tighter font-mono">{value}</p>
          <p className="text-xs font-bold text-app-muted mt-1 uppercase tracking-[0.1em] opacity-60 group-hover:opacity-100 transition-opacity">{config.label}</p>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </div>
  )
}

interface QuickLink { href: string; label: string; description: string; icon: React.ElementType; roles: string[]; color: string }
const quickLinks: QuickLink[] = [
  { href: '/dashboard/programs', label: 'Curriculum & Programs', description: 'OBE cycles & curriculum mapping', icon: BookOpen, roles: ['super_admin','campus_admin','dean','program_head','accreditor'], color: 'text-brand' },
  { href: '/dashboard/faculty/assignments', label: 'Course Assignments', description: 'Score entry & student assessments', icon: Activity, roles: ['faculty'], color: 'text-blue-400' },
  { href: '/dashboard/cqi', label: 'Continuous Quality Improvement', description: 'Manage institutional action plans', icon: AlertTriangle, roles: ['super_admin','campus_admin','dean','program_head'], color: 'text-amber-400' },
  { href: '/dashboard/reports', label: 'Regulatory Reports', description: 'Generate CHED & TESDA data', icon: FileText, roles: ['super_admin','campus_admin','dean','program_head','accreditor'], color: 'text-rose-400' },
  { href: '/dashboard/analytics', label: 'Advanced Analytics', description: 'View real-time attainment metrics', icon: BarChart3, roles: ['super_admin','campus_admin','dean'], color: 'text-cyan-400' },
  { href: '/dashboard/admin/users', label: 'Institutional Accounts', description: 'User roles & access management', icon: Users, roles: ['super_admin','campus_admin'], color: 'text-purple-400' },
  { href: '/dashboard/student', label: 'Learning Portfolio', description: 'View your personal outcome results', icon: GraduationCap, roles: ['student'], color: 'text-emerald-400' },
  { href: '/dashboard/accreditor', label: 'Accreditation Review', description: 'Evidence collection & review', icon: BookOpen, roles: ['accreditor'], color: 'text-rose-400' },
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
    <div className="flex flex-col gap-10 animate-fade-in">
      {/* Greeting Section */}
      <div className="relative group">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-brand rounded-full group-hover:h-16 transition-all duration-500 shadow-[0_0_15px_#10B981]" />
        <div>
          <h1 className="text-4xl font-bold text-app-text tracking-tight mb-2 leading-none">
            Welcome back, <span className="text-brand">{String(name).split(' ')[0]}</span>
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-app-muted text-sm font-medium opacity-80">{welcome}</p>
            <div className="h-1 w-1 rounded-full bg-app-border" />
            <Badge className="bg-brand/5 border-brand/20 text-brand text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              {role.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((config, i) => (
          <StatCard key={config.id} config={config} value={stats[i]} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Quick Links */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-app-border pb-4">
            <div className="w-8 h-8 rounded-xl bg-app-surface border border-app-border flex items-center justify-center">
              <Activity className="w-4 h-4 text-brand" />
            </div>
            <h2 className="text-xs font-bold text-app-text uppercase tracking-[0.2em]">Institutional Command Center</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative bg-app-surface border border-app-border rounded-[24px] p-5 flex items-center gap-5 transition-all duration-300 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-app-bg border border-app-border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:border-brand/40">
                    <Icon className={cn('w-6 h-6 transition-all duration-300 group-hover:text-brand', link.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-app-text font-bold text-sm group-hover:text-brand transition-colors tracking-tight">{link.label}</p>
                    <p className="text-app-muted text-xs mt-1 line-clamp-1 opacity-60 tracking-tight leading-tight">{link.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-muted/30 ml-auto transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Action Center / Side Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-app-border pb-4">
            <div className="w-8 h-8 rounded-xl bg-app-surface border border-app-border flex items-center justify-center">
              <Target className="w-4 h-4 text-brand" />
            </div>
            <h2 className="text-xs font-bold text-app-text uppercase tracking-[0.2em]">Priority Actions</h2>
          </div>

          <div className="space-y-4">
            {role === 'program_head' && openCqi > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-[24px] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl rounded-full" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] font-bold tracking-widest">CRITICAL</Badge>
                  </div>
                  <h3 className="text-app-text font-bold text-base leading-tight mb-2">Pending CQI Plans</h3>
                  <p className="text-app-muted text-xs leading-relaxed mb-6">
                    You have <strong>{openCqi}</strong> outcome attainment cycle{openCqi !== 1 ? 's' : ''} that currently failed to meet institutional targets.
                  </p>
                  <Link href="/dashboard/cqi" className="block">
                    <Button className="w-full bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold text-xs h-10 shadow-lg shadow-red-500/20 uppercase tracking-widest">
                      Start CQI Review
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-app-surface border border-app-border rounded-[24px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-brand" />
                </div>
                <h3 className="text-app-text font-bold text-sm tracking-tight">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 relative pb-4 last:pb-0">
                    {i !== 3 && <div className="absolute left-[15px] top-8 w-px h-full bg-app-border" />}
                    <div className="w-8 h-8 rounded-full bg-app-bg border border-app-border flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-app-text leading-tight tracking-tight">Course Mapping Updated</p>
                      <p className="text-[10px] text-app-muted mt-1 font-mono uppercase tracking-tighter opacity-60">2 hours ago · Admin</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-brand hover:bg-brand/5 rounded-xl text-xs font-bold font-mono tracking-widest uppercase">
                View All Activity
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}