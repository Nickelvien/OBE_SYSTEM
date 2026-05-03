'use client'
// app/(dashboard)/programs/[id]/attainment/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

interface AttainmentResult { id: string; entityType: string; entityId: string; attainmentPercentage: number | null; isProvisional: boolean; isStale: boolean; computedAt: string | null }
interface PLO { id: string; code: string; description: string }
interface Period { id: string; name: string; isActive: boolean }
interface Program { gradingSystem: { passingThreshold: number; cowThreshold: number } }

export default function AttainmentPage() {
  const { id }        = useParams<{ id: string }>()
  const [results,     setResults]     = useState<AttainmentResult[]>([])
  const [plos,        setPlos]        = useState<PLO[]>([])
  const [periods,     setPeriods]     = useState<Period[]>([])
  const [program,     setProgram]     = useState<Program | null>(null)
  const [periodId,    setPeriodId]    = useState('')
  const [loading,     setLoading]     = useState(true)
  const [computing,   setComputing]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [prRes, plosRes, perRes] = await Promise.all([
      fetch(`/api/programs/${id}`).then((r) => r.json()),
      fetch(`/api/programs/${id}/plos`).then((r) => r.json()),
      fetch('/api/admin/periods').then((r) => r.json()),
    ])
    setProgram(prRes); setPlos(plosRes); setPeriods(perRes)
    const active = perRes.find((p: Period) => p.isActive)
    if (active && !periodId) setPeriodId(active.id)
    setLoading(false)
  }, [id, periodId])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [id])

  useEffect(() => {
    if (!periodId) return
    fetch(`/api/attainment?programId=${id}&periodId=${periodId}`)
      .then((r) => r.json()).then(setResults)
  }, [id, periodId])

  const handleCompute = async () => {
    setComputing(true)
    await fetch('/api/attainment/compute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ programId: id, periodId }) })
    setTimeout(() => { setComputing(false); load() }, 2000)
  }

  const ploResults = plos.map((plo) => {
    const result = results.find((r) => r.entityType === 'plo' && r.entityId === plo.id)
    return { ...plo, result }
  })

  const threshold = program?.gradingSystem?.cowThreshold ?? 0
  const chartData = ploResults.map((p) => ({
    name: p.code, value: p.result?.attainmentPercentage ?? 0,
    stale: p.result?.isStale, provisional: p.result?.isProvisional,
  }))

  const hasStale = results.some((r) => r.isStale)
  const hasResults = results.length > 0

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
        <Link href={`/dashboard/programs/${id}`} className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Program</Link>
        <span>/</span><span className="text-slate-300">Attainment</span>
      </div>
      <PageHeader
        title="OBE Attainment Dashboard"
        description="View CLO/PLO/PEO attainment results for each academic period."
        actions={
          <div className="flex items-center gap-3">
            <select id="period-select" value={periodId} onChange={(e) => setPeriodId(e.target.value)}
              className="px-3 py-2 rounded-lg bg-card border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">— Select Period —</option>
              {periods.map((p) => <option key={p.id} value={p.id}>{p.name}{p.isActive ? ' (Active)' : ''}</option>)}
            </select>
            <button id="btn-compute" onClick={handleCompute} disabled={!periodId || computing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium disabled:opacity-50 transition-colors">
              <RefreshCw className={`w-4 h-4 ${computing ? 'animate-spin' : ''}`} />
              {computing ? 'Computing…' : 'Compute Attainment'}
            </button>
          </div>
        }
      />

      {hasStale && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 flex items-center gap-2 text-amber-300 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Results are <strong>stale</strong> — scores have been updated since last computation. Click &ldquo;Compute Attainment&rdquo; to refresh.
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="text-white font-semibold mb-4">PLO Attainment vs. Threshold</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(v: number) => [`${v.toFixed(1)}%`, 'Attainment']}
              />
              <ReferenceLine y={threshold} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Threshold ${threshold}%`, fill: '#f59e0b', fontSize: 11 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={Number(entry.value) >= threshold ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* PLO Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/80 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">PLO</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Attainment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-10 text-center text-slate-500">Loading…</td></tr>
            ) : ploResults.map((plo) => {
              const pct     = plo.result?.attainmentPercentage
              const stale   = plo.result?.isStale
              const prov    = plo.result?.isProvisional
              const passing = pct != null && pct >= threshold
              return (
                <tr key={plo.id} className="border-b border-border/60 hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-mono font-bold text-primary/80">{plo.code}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm max-w-xs truncate">{plo.description}</td>
                  <td className="px-4 py-3">
                    {pct != null ? (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-slate-800 max-w-[120px]">
                          <div className={`h-2 rounded-full ${passing ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className={`font-bold text-sm ${passing ? 'text-green-400' : 'text-red-400'}`}>{pct.toFixed(1)}%</span>
                      </div>
                    ) : <span className="text-slate-500">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {stale   && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300"><Clock className="w-3 h-3" /> Stale</span>}
                      {prov    && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-500/20 text-slate-300">Provisional</span>}
                      {!stale && !prov && pct != null && (
                        passing
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300"><CheckCircle className="w-3 h-3" /> Meeting</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-300"><AlertTriangle className="w-3 h-3" /> Below</span>
                      )}
                      {pct == null && !hasResults && <span className="text-xs text-slate-500">Not computed</span>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
