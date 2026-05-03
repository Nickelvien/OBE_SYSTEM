// app/(dashboard)/admin/page.tsx — Admin index / landing
import type { Metadata } from 'next'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { Users, Building2, BookOpen, Sliders, Activity, Shield } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin — OBE System | ACES Panabo' }

const adminSections = [
  { href: '/dashboard/admin/users',           label: 'Users',             description: 'Create, edit, assign roles & manage all system users.',              icon: Users,      color: 'text-primary   bg-primary/10   border-primary/20'  },
  { href: '/dashboard/admin/departments',     label: 'Departments',       description: 'Manage academic departments and dean assignments.',                   icon: Building2,  color: 'text-green-400  bg-green-500/10  border-green-500/20' },
  { href: '/dashboard/admin/programs',        label: 'Programs',          description: 'Configure programs, assign modes (CHED/TESDA), link grading systems.', icon: BookOpen,   color: 'text-amber-400  bg-amber-500/10  border-amber-500/20' },
  { href: '/dashboard/admin/grading-systems', label: 'Grading Systems',   description: 'Set passing, EVI, and COW thresholds for each program grading type.', icon: Sliders,    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { href: '/dashboard/admin/periods',         label: 'Academic Periods',  description: 'Create and lock/unlock academic semesters and periods.',              icon: Activity,   color: 'text-cyan-400   bg-cyan-500/10   border-cyan-500/20'  },
  { href: '/dashboard/admin/audit-logs',      label: 'Audit Logs',        description: 'Immutable system-wide audit trail — view all create/edit/delete actions.', icon: Shield, color: 'text-red-400    bg-red-500/10    border-red-500/20'   },
]

export default function AdminIndexPage() {
  return (
    <DashboardShell>
      <PageHeader title="System Administration" description="Manage all institutional data, users, and system configuration for ACES Panabo OBE System." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminSections.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.href}
              id={`admin-card-${s.label.toLowerCase().replace(/\s/g,'-')}`}
              href={s.href}
              className="group rounded-2xl bg-card border border-border p-6 flex flex-col gap-4 hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold group-hover:text-primary/80 transition-colors">{s.label}</h3>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">{s.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="rounded-xl bg-slate-800/40 border border-slate-700 px-5 py-4 text-xs text-slate-500 flex gap-2">
        <Shield className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
        <span>
          All administrative mutations are immutably logged in <strong className="text-slate-400">Audit Logs</strong>.
          Grading system thresholds are always read from the database — never hardcoded.
        </span>
      </div>
    </DashboardShell>
  )
}
