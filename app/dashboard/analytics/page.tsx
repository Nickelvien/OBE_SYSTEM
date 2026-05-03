'use client'
// app/(dashboard)/analytics/page.tsx
import { useState, useEffect } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { BookOpen, Users, BarChart3, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

interface Summary {
  programs: number; activeStudents: number; closMeeting: number; openCqiPlans: number
  attainmentTrend: { attainmentPercentage: number; periodId: string; computedAt: string }[]
}

function StatCard({ id, label, value, icon: Icon, color }: { id: string; label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div id={id} className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/summary').then((r) => r.json()).then(setSummary).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardShell><div className="py-20 text-center text-slate-500">Loading analytics…</div></DashboardShell>

  const trendData = (summary?.attainmentTrend ?? []).slice(0, 20).map((t, i) => ({
    name: `#${i + 1}`,
    value: Number(t.attainmentPercentage),
  }))

  return (
    <DashboardShell>
      <PageHeader title="Analytics" description="System-wide OBE performance overview." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard id="stat-programs"  label="Total Programs"      value={summary?.programs       ?? 0} icon={BookOpen}     color="bg-primary/10 border-primary/20 text-primary" />
        <StatCard id="stat-students"  label="Active Students"     value={summary?.activeStudents  ?? 0} icon={Users}        color="bg-green-500/10 border-green-500/20 text-green-400" />
        <StatCard id="stat-clos"      label="CLOs Meeting Target" value={summary?.closMeeting     ?? 0} icon={BarChart3}    color="bg-amber-500/10 border-amber-500/20 text-amber-400" />
        <StatCard id="stat-cqi"       label="Open CQI Plans"      value={summary?.openCqiPlans   ?? 0} icon={AlertTriangle} color="bg-red-500/10 border-red-500/20 text-red-400" />
      </div>

      {trendData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-white font-semibold mb-4">PLO Attainment Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: number) => [`${v.toFixed(1)}%`]} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-white font-semibold mb-4">Attainment Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: number) => [`${v.toFixed(1)}%`]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {trendData.slice(0, 10).map((e, i) => (
                    <Cell key={i} fill={e.value >= 75 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {trendData.length === 0 && (
        <div className="rounded-xl bg-slate-800/40 border border-slate-700 p-10 text-center text-slate-500">
          No attainment data yet. Compute attainment for a program to see analytics.
        </div>
      )}
    </DashboardShell>
  )
}
