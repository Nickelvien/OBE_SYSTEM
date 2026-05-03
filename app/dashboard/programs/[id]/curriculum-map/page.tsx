'use client'
// app/(dashboard)/programs/[id]/curriculum-map/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { ArrowLeft } from 'lucide-react'

interface PLO    { id: string; code: string; description: string }
interface Course { id: string; code: string; name: string; yearLevel: number; semester: number }
interface MapEntry { courseId: string; ploId: string; idaLevel: 'I' | 'D' | 'A' }

const IDA_COLORS = {
  I: 'bg-primary text-primary-foreground text-white',
  D: 'bg-green-600 text-white',
  A: 'bg-amber-500 text-white',
}
const IDA_CYCLE: Record<string, 'I' | 'D' | 'A' | null> = { '': 'I', I: 'D', D: 'A', A: null }

export default function CurriculumMapPage() {
  const { id }      = useParams<{ id: string }>()
  const [plos,      setPlos]      = useState<PLO[]>([])
  const [courses,   setCourses]   = useState<Course[]>([])
  const [mapData,   setMapData]   = useState<MapEntry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [plosRes, coursesRes, mapRes] = await Promise.all([
      fetch(`/api/programs/${id}/plos`).then((r) => r.json()),
      fetch(`/api/programs/${id}/courses`).then((r) => r.json()),
      fetch(`/api/programs/${id}/curriculum-map`).then((r) => r.json()),
    ])
    setPlos(plosRes); setCourses(coursesRes); setMapData(mapRes)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const getLevel = (courseId: string, ploId: string): 'I' | 'D' | 'A' | null => {
    const e = mapData.find((m) => m.courseId === courseId && m.ploId === ploId)
    return e?.idaLevel ?? null
  }

  const handleClick = async (courseId: string, ploId: string) => {
    const current  = getLevel(courseId, ploId)
    const next     = IDA_CYCLE[current ?? '']
    const cellKey  = `${courseId}-${ploId}`
    setSaving(cellKey)

    if (next === null) {
      await fetch(`/api/programs/${id}/curriculum-map`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, ploId }),
      })
    } else {
      await fetch(`/api/programs/${id}/curriculum-map`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, ploId, idaLevel: next }),
      })
    }
    await load()
    setSaving(null)
  }

  if (loading) return <DashboardShell><div className="py-20 text-center text-slate-500">Loading curriculum map…</div></DashboardShell>

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
        <Link href={`/dashboard/programs/${id}`} className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Program</Link>
        <span>/</span><span className="text-slate-300">Curriculum Map</span>
      </div>
      <PageHeader title="Curriculum Map" description="I/D/A matrix showing how courses address Program Learning Outcomes. Click a cell to cycle I → D → A → (clear)." />

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-xs">
        {(['I','D','A'] as const).map((lvl) => (
          <span key={lvl} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${IDA_COLORS[lvl]}`}>
            {lvl} — {lvl === 'I' ? 'Introduced' : lvl === 'D' ? 'Developed' : 'Applied'}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold bg-slate-800 text-slate-400">— Not mapped</span>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="bg-card/80">
              <th className="text-left px-3 py-2 text-slate-400 font-semibold border-b border-r border-border whitespace-nowrap min-w-[160px]">Course</th>
              {plos.map((plo) => (
                <th key={plo.id} className="px-2 py-2 text-slate-400 font-semibold border-b border-r border-border text-center min-w-[52px]" title={plo.description}>
                  {plo.code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border/60 hover:bg-slate-800/20">
                <td className="px-3 py-2 border-r border-border whitespace-nowrap">
                  <span className="font-mono text-green-300 font-semibold">{course.code}</span>
                  <span className="text-slate-500 ml-2 text-xs">Y{course.yearLevel}S{course.semester}</span>
                </td>
                {plos.map((plo) => {
                  const level   = getLevel(course.id, plo.id)
                  const cellKey = `${course.id}-${plo.id}`
                  const busy    = saving === cellKey
                  return (
                    <td key={plo.id} className="border-r border-border text-center p-1">
                      <button
                        id={`map-cell-${course.id}-${plo.id}`}
                        onClick={() => handleClick(course.id, plo.id)}
                        disabled={busy}
                        className={`w-10 h-8 rounded text-xs font-bold transition-all duration-150 ${
                          level ? IDA_COLORS[level] : 'bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-slate-300'
                        } ${busy ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:scale-105'}`}
                      >
                        {busy ? '…' : (level ?? '')}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {courses.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-sm">
          No courses found. <Link href={`/dashboard/programs/${id}/courses`} className="text-primary hover:underline">Add courses first.</Link>
        </div>
      )}
    </DashboardShell>
  )
}
