'use client'
// app/(dashboard)/programs/[id]/page.tsx — Program Dashboard
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { BookOpen, Target, Map, BarChart3, Award, ChevronRight, Layers } from 'lucide-react'

interface Program {
  id: string; name: string; code: string; mode: string
  department?: { name: string } | null
  gradingSystem?: { name: string; passingThreshold: number }
  _count?: { plos: number; courses: number; peos: number }
}

interface NavCard { href: string; label: string; description: string; icon: React.ElementType; color: string }

export default function ProgramDashboard() {
  const { id }    = useParams<{ id: string }>()
  const [prog, setProg] = useState<Program | null>(null)

  useEffect(() => {
    fetch(`/api/programs/${id}`).then((r) => r.json()).then(setProg)
  }, [id])

  const cards: NavCard[] = [
    { href: `/dashboard/programs/${id}/peos`,          label: 'PEOs',            description: 'Program Educational Objectives', icon: Award,    color: 'text-purple-400 bg-purple-500/10' },
    { href: `/dashboard/programs/${id}/plos`,          label: 'PLOs',            description: 'Program Learning Outcomes',      icon: Target,   color: 'text-primary bg-primary/10' },
    { href: `/dashboard/programs/${id}/courses`,       label: 'Courses',         description: 'Course catalog & CLO mapping',   icon: BookOpen, color: 'text-green-400 bg-green-500/10' },
    { href: `/dashboard/programs/${id}/curriculum-map`,label: 'Curriculum Map',  description: 'I/D/A matrix (Course × PLO)',    icon: Map,      color: 'text-cyan-400 bg-cyan-500/10' },
    { href: `/dashboard/programs/${id}/attainment`,    label: 'Attainment',      description: 'OBE results & threshold analysis', icon: BarChart3, color: 'text-amber-400 bg-amber-500/10' },
    { href: `/dashboard/programs/${id}/snapshots`,     label: 'Snapshots',       description: 'Curriculum change history',      icon: Layers,   color: 'text-slate-400 bg-slate-500/10' },
  ]

  if (prog?.mode === 'TESDA') {
    cards.push({ href: `/dashboard/programs/${id}/qualifications`, label: 'Qualifications', description: 'TESDA NC levels & competency units', icon: Award, color: 'text-orange-400 bg-orange-500/10' })
  }

  return (
    <DashboardShell>
      <PageHeader
        title={prog?.name ?? 'Loading…'}
        description={prog ? `${prog.code} · ${prog.department?.name ?? ''} · ${prog.mode}` : ''}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Link
              key={c.href}
              id={`nav-${c.label.toLowerCase().replace(/\s/g, '-')}`}
              href={c.href}
              className="group rounded-xl bg-card border border-border p-5 hover:border-primary/30 hover:bg-slate-800/50 transition-all duration-200 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${c.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold group-hover:text-primary/80 transition-colors">{c.label}</p>
                <p className="text-slate-500 text-xs mt-0.5 truncate">{c.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary ml-auto flex-shrink-0 transition-colors" />
            </Link>
          )
        })}
      </div>

      {prog && (
        <div className="rounded-xl bg-card border border-border p-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{prog._count?.peos ?? '—'}</p>
            <p className="text-slate-500 text-xs mt-1">PEOs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{prog._count?.plos ?? '—'}</p>
            <p className="text-slate-500 text-xs mt-1">PLOs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{prog._count?.courses ?? '—'}</p>
            <p className="text-slate-500 text-xs mt-1">Courses</p>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
