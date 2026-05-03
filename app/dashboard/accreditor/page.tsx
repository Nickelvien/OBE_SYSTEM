'use client'
// app/(dashboard)/accreditor/page.tsx — Read-only accreditor dashboard
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { BookOpen, BarChart3, ChevronRight, Eye } from 'lucide-react'

interface Program { id: string; name: string; code: string; mode: string; _count?: { plos: number; courses: number } }

export default function AccreditorPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch('/api/programs').then((r) => r.json()).then(setPrograms).finally(() => setLoading(false))
  }, [])

  return (
    <DashboardShell>
      <div className="rounded-xl bg-slate-800/60 border border-slate-700 px-5 py-4 flex items-center gap-3 mb-2">
        <Eye className="w-5 h-5 text-primary flex-shrink-0" />
        <div>
          <p className="text-white text-sm font-semibold">Read-Only Access</p>
          <p className="text-slate-400 text-xs">You are viewing as an Accreditor. No create, edit, or delete actions are available.</p>
        </div>
      </div>

      <PageHeader title="Program Review" description="Review program OBE attainment, curriculum maps, and evidence." />

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading programs…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {programs.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card border border-border p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.mode === 'CHED' ? 'bg-primary/20 text-primary/80' : 'bg-amber-500/20 text-amber-300'}`}>{p.mode}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{p.name}</h3>
                <p className="text-slate-500 text-sm font-mono mt-0.5">{p.code}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-border">
                <span>{p._count?.plos ?? 0} PLOs</span>
                <span>{p._count?.courses ?? 0} Courses</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link id={`btn-view-attainment-${p.id}`} href={`/dashboard/programs/${p.id}/attainment`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-slate-700 transition-colors">
                  <BarChart3 className="w-4 h-4 text-primary" /> View Attainment <ChevronRight className="w-4 h-4 ml-auto" />
                </Link>
                <Link id={`btn-view-map-${p.id}`} href={`/dashboard/programs/${p.id}/curriculum-map`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-slate-700 transition-colors">
                  <BookOpen className="w-4 h-4 text-green-400" /> View Curriculum Map <ChevronRight className="w-4 h-4 ml-auto" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
