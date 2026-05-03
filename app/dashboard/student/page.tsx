'use client'
// app/(dashboard)/student/page.tsx — Student outcomes portfolio
import { useState, useEffect } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BookOpen, CheckCircle, XCircle } from 'lucide-react'

interface StudentResult {
  courseCode: string; courseName: string
  clos: { code: string; description: string; attainmentPercentage: number | null; passingThreshold: number }[]
}

export default function StudentPortfolioPage() {
  const [results,  setResults]  = useState<StudentResult[]>([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/student/outcomes').then((r) => r.json()).then(setResults).finally(() => setLoading(false))
  }, [])

  const allClos = results.flatMap((r) => r.clos)
  const meeting  = allClos.filter((c) => c.attainmentPercentage != null && c.attainmentPercentage >= c.passingThreshold).length
  const total    = allClos.filter((c) => c.attainmentPercentage != null).length
  const pct      = total > 0 ? Math.round((meeting / total) * 100) : 0

  const chartData = results.flatMap((r) =>
    r.clos.filter((c) => c.attainmentPercentage != null).map((c) => ({
      name: `${r.courseCode}·${c.code}`,
      value: Number(c.attainmentPercentage),
      threshold: c.passingThreshold,
    }))
  ).slice(0, 20)

  return (
    <DashboardShell>
      <PageHeader title="My Learning Outcomes" description="Your CLO attainment portfolio across all enrolled courses." />

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'CLOs Meeting Target', value: meeting, color: 'text-green-400' },
          { label: 'Total CLOs Assessed',  value: total,   color: 'text-primary'  },
          { label: 'Overall Rate',          value: `${pct}%`, color: pct >= 75 ? 'text-green-400' : 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-5 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attainment chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="text-white font-semibold mb-4">CLO Attainment Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: number) => [`${v.toFixed(1)}%`]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.value >= e.threshold ? '#22c55e' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? <div className="py-20 text-center text-slate-500">Loading your outcomes…</div> : (
        <div className="flex flex-col gap-3">
          {results.map((course) => (
            <div key={course.courseCode} className="rounded-xl bg-card border border-border overflow-hidden">
              <button
                id={`toggle-course-${course.courseCode}`}
                onClick={() => setExpanded(expanded === course.courseCode ? null : course.courseCode)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{course.courseName}</p>
                  <p className="text-slate-500 text-xs font-mono">{course.courseCode}</p>
                </div>
                <span className="text-slate-500 text-xs">{course.clos.length} CLOs</span>
              </button>
              {expanded === course.courseCode && (
                <div className="border-t border-border px-5 py-3 flex flex-col gap-2">
                  {course.clos.map((clo) => {
                    const passing = clo.attainmentPercentage != null && clo.attainmentPercentage >= clo.passingThreshold
                    return (
                      <div key={clo.code} className="flex items-center gap-3 text-sm">
                        {clo.attainmentPercentage != null
                          ? passing ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          : <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                        }
                        <span className="font-mono text-xs text-slate-400 flex-shrink-0 w-12">{clo.code}</span>
                        <span className="text-slate-300 flex-1 truncate">{clo.description}</span>
                        {clo.attainmentPercentage != null ? (
                          <span className={`font-bold text-sm flex-shrink-0 ${passing ? 'text-green-400' : 'text-red-400'}`}>
                            {Number(clo.attainmentPercentage).toFixed(1)}%
                          </span>
                        ) : <span className="text-slate-500 text-xs">—</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          {results.length === 0 && (
            <div className="py-20 text-center text-slate-500">No course outcomes available yet. Check back after your faculty enters scores.</div>
          )}
        </div>
      )}
    </DashboardShell>
  )
}
