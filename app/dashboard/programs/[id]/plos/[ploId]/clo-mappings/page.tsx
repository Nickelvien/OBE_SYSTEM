'use client'
// app/(dashboard)/programs/[id]/plos/[ploId]/clo-mappings/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface CLO { id: string; code: string; description: string; course: { code: string; name: string } }
interface PLO { id: string; code: string; description: string }
interface Mapping { id: string; cloId: string; weight: number; clo: { id: string; code: string; description: string; weight: number; course: { code: string; name: string } } }

const inputCls = "px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"

export default function PloClomappingsPage() {
  const { id, ploId } = useParams<{ id: string; ploId: string }>()
  const [plo,      setPlo]      = useState<PLO | null>(null)
  const [mappings, setMappings] = useState<Mapping[]>([])
  const [allClos,  setAllClos]  = useState<CLO[]>([])
  const [loading,  setLoading]  = useState(true)
  const [addCloId, setAddCloId] = useState('')
  const [addWeight,setAddWeight]= useState(1)
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [ploRes, mappingsRes, coursesRes] = await Promise.all([
      fetch(`/api/programs/${id}/plos`).then((r) => r.json()).then((plos: PLO[]) => plos.find((p) => p.id === ploId) ?? null),
      fetch(`/api/programs/${id}/plos/${ploId}/clo-mappings`).then((r) => r.json()),
      fetch(`/api/programs/${id}/courses`).then((r) => r.json()),
    ])
    setPlo(ploRes)
    setMappings(mappingsRes)
    // Flatten CLOs from all courses
    const clos: CLO[] = []
    for (const course of coursesRes) {
      const courseClOs = await fetch(`/api/programs/${id}/courses/${course.id}/clos`).then((r) => r.json())
      clos.push(...courseClOs.map((c: CLO) => ({ ...c, course: { code: course.code, name: course.name } })))
    }
    setAllClos(clos)
    setLoading(false)
  }, [id, ploId])

  useEffect(() => { load() }, [load])

  const mappedCloIds = new Set(mappings.map((m) => m.cloId))
  const unmappedClos = allClos.filter((c) => !mappedCloIds.has(c.id))

  const handleAdd = async () => {
    if (!addCloId) return
    setSaving(true)
    await fetch(`/api/programs/${id}/plos/${ploId}/clo-mappings`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cloId: addCloId, weight: addWeight }),
    })
    setAddCloId('')
    await load()
    setSaving(false)
  }

  const handleDelete = async (cloId: string) => {
    await fetch(`/api/programs/${id}/plos/${ploId}/clo-mappings`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cloId }),
    })
    load()
  }

  const handleWeightChange = async (cloId: string, weight: number) => {
    await fetch(`/api/programs/${id}/plos/${ploId}/clo-mappings`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cloId, weight }),
    })
    load()
  }

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
        <Link href={`/dashboard/programs/${id}`} className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Program</Link>
        <span>/</span>
        <Link href={`/dashboard/programs/${id}/plos`} className="hover:text-white">PLOs</Link>
        <span>/</span><span className="text-slate-300">CLO Mappings</span>
      </div>
      <PageHeader
        title={plo ? `${plo.code} — CLO Mappings` : 'CLO Mappings'}
        description={plo?.description ?? 'Link Course Learning Outcomes to this PLO with weights.'}
      />

      {/* Add mapping */}
      <div className="rounded-xl bg-card border border-border p-5">
        <h3 className="text-white font-semibold mb-3 text-sm">Add CLO Mapping</h3>
        <div className="flex gap-3 flex-wrap">
          <select id="select-clo" className={`${inputCls} flex-1 min-w-48`} value={addCloId} onChange={(e) => setAddCloId(e.target.value)}>
            <option value="">— Select a CLO —</option>
            {unmappedClos.map((c) => (
              <option key={c.id} value={c.id}>{c.course.code} · {c.code}: {c.description.slice(0, 60)}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 whitespace-nowrap">Weight (0–1):</label>
            <input id="input-mapping-weight" type="number" step="0.01" min={0} max={1} className={`${inputCls} w-20`} value={addWeight} onChange={(e) => setAddWeight(parseFloat(e.target.value))} />
          </div>
          <button id="btn-add-mapping" onClick={handleAdd} disabled={!addCloId || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium disabled:opacity-60">
            <Plus className="w-4 h-4" /> {saving ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>

      {/* Current mappings */}
      {loading ? (
        <div className="py-10 text-center text-slate-500">Loading mappings…</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-card/80 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">CLO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <tr key={m.id} className="border-b border-border/60 hover:bg-slate-800/20">
                  <td className="px-4 py-3"><span className="font-mono text-xs text-green-300">{m.clo.course.code}</span></td>
                  <td className="px-4 py-3"><span className="font-mono text-amber-300 font-semibold">{m.clo.code}</span></td>
                  <td className="px-4 py-3 text-slate-300 text-sm max-w-xs truncate">{m.clo.description}</td>
                  <td className="px-4 py-3">
                    <input
                      id={`weight-${m.cloId}`}
                      type="number" step="0.01" min={0} max={1}
                      defaultValue={Number(m.weight)}
                      onBlur={(e) => handleWeightChange(m.cloId, parseFloat(e.target.value))}
                      className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button id={`btn-remove-${m.cloId}`} onClick={() => handleDelete(m.cloId)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {mappings.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-slate-500">No CLOs mapped to this PLO yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}
