'use client'
// app/(dashboard)/programs/[id]/snapshots/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { ArrowLeft, Layers, ChevronDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface Snapshot {
  id: string; effectiveFrom: string; effectiveTo: string | null; createdBy: string; createdAt: string
  snapshotData: { peos: unknown[]; plos: unknown[]; courses: unknown[] }
}

export default function SnapshotsPage() {
  const { id }       = useParams<{ id: string }>()
  const [snapshots,  setSnapshots]  = useState<Snapshot[]>([])
  const [loading,    setLoading]    = useState(true)
  const [expanded,   setExpanded]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/programs/${id}/snapshots`)
    if (res.ok) setSnapshots(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
        <Link href={`/dashboard/programs/${id}`} className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Program</Link>
        <span>/</span><span className="text-slate-300">Snapshots</span>
      </div>
      <PageHeader
        title="Curriculum Snapshots"
        description="Immutable history of every curriculum change. A snapshot is created before every PLO, CLO, or mapping mutation."
      />

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading snapshots…</div>
      ) : snapshots.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No snapshots yet. Edit a PLO or CLO to create the first snapshot.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {snapshots.map((snap, i) => (
            <div key={snap.id} className="rounded-xl bg-card border border-border overflow-hidden">
              <button
                id={`btn-expand-snap-${snap.id}`}
                onClick={() => setExpanded(expanded === snap.id ? null : snap.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">
                    Snapshot #{snapshots.length - i}
                    {i === 0 && <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary/80">Latest</span>}
                  </p>
                  <p className="text-slate-400 text-xs">
                    From {format(new Date(snap.effectiveFrom), 'MMM d, yyyy HH:mm')}
                    {snap.effectiveTo ? ` → ${format(new Date(snap.effectiveTo), 'MMM d, yyyy HH:mm')}` : ' (current)'}
                  </p>
                </div>
                <div className="text-xs text-slate-500 flex gap-3">
                  <span>{(snap.snapshotData?.peos ?? []).length} PEOs</span>
                  <span>{(snap.snapshotData?.plos ?? []).length} PLOs</span>
                  <span>{(snap.snapshotData?.courses ?? []).length} Courses</span>
                </div>
                {expanded === snap.id ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {expanded === snap.id && (
                <div className="border-t border-border px-5 py-4">
                  <pre className="text-xs text-slate-400 overflow-x-auto max-h-64 rounded-lg bg-background p-4 border border-border">
                    {JSON.stringify(snap.snapshotData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
