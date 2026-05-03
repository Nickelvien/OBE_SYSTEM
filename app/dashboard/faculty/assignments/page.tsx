'use client'
// app/(dashboard)/faculty/assignments/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { BookOpen, ClipboardList, ChevronRight } from 'lucide-react'

interface Assignment {
  id: string; section: string
  course: { id: string; code: string; name: string; units: number }
  period: { id: string; name: string }
}

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/faculty/assignments').then((r) => r.json()).then(setAssignments).finally(() => setLoading(false))
  }, [])

  return (
    <DashboardShell>
      <PageHeader title="My Courses" description="Courses assigned to you this period." />
      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading assignments…</div>
      ) : assignments.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No courses assigned. Contact your program head.</div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-xl bg-card border border-border p-5 flex items-center gap-5">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">{a.course.name}</p>
                <p className="text-slate-500 text-sm">{a.course.code} · Section {a.section} · {a.period.name}</p>
              </div>
              <div className="flex gap-2">
                <Link id={`btn-assessments-${a.id}`} href={`/dashboard/faculty/courses/${a.id}/assessments`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-slate-700 transition-colors">
                  <ClipboardList className="w-3.5 h-3.5" /> Assessments
                </Link>
                <Link id={`btn-scores-${a.id}`} href={`/dashboard/faculty/courses/${a.id}/scores`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm transition-colors">
                  Enter Scores <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
