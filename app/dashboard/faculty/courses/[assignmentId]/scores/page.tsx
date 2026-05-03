'use client'
// app/(dashboard)/faculty/courses/[assignmentId]/scores/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react'

interface Assessment { id: string; name: string; assessmentType: string; maxScore: number }
interface Enrollment { studentId: string }
interface Score { studentId: string; assessmentId: string; rawScore: number | null; isExcused: boolean }

export default function ScoresPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const [assessments,  setAssessments]  = useState<Assessment[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_enrollments,  setEnrollments]  = useState<Enrollment[]>([])
  const [scores,       setScores]       = useState<Record<string, Score>>({})
  const [students,     setStudents]     = useState<{ id: string; name: string }[]>([])
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState<string | null>(null)
  const [saved,        setSaved]        = useState<Set<string>>(new Set())
  const [stale,        setStale]        = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [asmRes, enrRes, scrRes] = await Promise.all([
      fetch(`/api/faculty/courses/${assignmentId}/assessments`).then((r) => r.json()),
      fetch(`/api/faculty/courses/${assignmentId}/enrollments`).then((r) => r.json()),
      fetch(`/api/scores?assignmentId=${assignmentId}`).then((r) => r.json()),
    ])
    setAssessments(asmRes)
    setEnrollments(enrRes.enrollments ?? [])
    setStudents(enrRes.students ?? [])
    const scoreMap: Record<string, Score> = {}
    for (const s of (scrRes.scores ?? scrRes)) { scoreMap[`${s.studentId}-${s.assessmentId}`] = s }
    setScores(scoreMap)
    setLoading(false)
  }, [assignmentId])

  useEffect(() => { load() }, [load])

  const handleScoreChange = async (studentId: string, assessmentId: string, rawScore: string, isExcused: boolean) => {
    const key = `${studentId}-${assessmentId}`
    setSaving(key)
    await fetch('/api/scores', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ studentId, assessmentId, rawScore: rawScore !== '' ? parseFloat(rawScore) : null, isExcused }),
    })
    setSaved((s) => new Set(s).add(key))
    setStale(true)
    setSaving(null)
    await load()
  }

  if (loading) return <DashboardShell><div className="py-20 text-center text-slate-500">Loading score gridâ€¦</div></DashboardShell>

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
        <Link href="/dashboard/faculty/assignments" className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> My Courses</Link>
        <span>/</span><span className="text-slate-300">Score Entry</span>
      </div>
      <PageHeader title="Score Entry Grid" description="Enter student scores for each assessment. Scores auto-save on change." />

      {stale && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 flex items-center gap-2 text-amber-300 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Attainment results are now <strong>Stale</strong>. Ask your program head to trigger recomputation.</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="text-sm w-full min-w-[600px]">
          <thead className="bg-card/80 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider sticky left-0 bg-card/80 min-w-[160px]">Student</th>
              {assessments.map((a) => (
                <th key={a.id} className="px-3 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[100px]">
                  <div>{a.name}</div>
                  <div className="text-slate-500 font-normal normal-case">/ {a.maxScore}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-border/60 hover:bg-slate-800/20">
                <td className="px-4 py-2 font-medium text-white sticky left-0 bg-background/80">{student.name}</td>
                {assessments.map((a) => {
                  const key    = `${student.id}-${a.id}`
                  const score  = scores[key]
                  const busy   = saving === key
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const _wasSaved = saved.has(key)
                  return (
                    <td key={a.id} className="px-3 py-2 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <input
                          id={`score-${student.id}-${a.id}`}
                          type="number"
                          min={0}
                          max={a.maxScore}
                          step="0.5"
                          defaultValue={score?.rawScore ?? ''}
                          disabled={score?.isExcused || busy}
                          onBlur={(e) => handleScoreChange(student.id, a.id, e.target.value, score?.isExcused ?? false)}
                          className="w-16 text-center px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
                        />
                        <input
                          id={`excused-${student.id}-${a.id}`}
                          type="checkbox"
                          title="Excused"
                          checked={score?.isExcused ?? false}
                          onChange={(e) => handleScoreChange(student.id, a.id, String(score?.rawScore ?? ''), e.target.checked)}
                          className="w-4 h-4 accent-amber-500"
                        />
                        {busy && <Save className="w-3 h-3 text-primary animate-pulse" />}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={assessments.length + 1} className="py-10 text-center text-slate-500">No enrolled students.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
