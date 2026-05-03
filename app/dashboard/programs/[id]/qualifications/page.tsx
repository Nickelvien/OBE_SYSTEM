'use client'
// app/(dashboard)/programs/[id]/qualifications/page.tsx â€” TESDA Qualifications & Competency Units
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { ArrowLeft, Plus, ChevronDown, ChevronRight, X, Trash2 } from 'lucide-react'

interface PC   { id: string; code: string; description: string }
interface Unit { id: string; code: string; name: string; criteria: PC[] }
interface Qual { id: string; ncLevel: string; name: string; units: Unit[] }

const inputCls = "w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function QualificationsPage() {
  const { id } = useParams<{ id: string }>()
  const [quals,    setQuals]    = useState<Qual[]>([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [modal,    setModal]    = useState<'qual' | 'unit' | 'pc' | null>(null)
  const [ctx,      setCtx]      = useState<{ qualId?: string; unitId?: string }>({})
  const [form,     setForm]     = useState<Record<string, string>>({})
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/programs/${id}/qualifications`)
    if (res.ok) setQuals(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const toggle = (key: string) => setExpanded((e) => ({ ...e, [key]: !e[key] }))

  const openQual = () => { setForm({ ncLevel: '', name: '' }); setCtx({}); setModal('qual') }
  const openUnit = (qualId: string) => { setForm({ code: '', name: '' }); setCtx({ qualId }); setModal('unit') }
  const openPc   = (qualId: string, unitId: string) => { setForm({ code: '', description: '' }); setCtx({ qualId, unitId }); setModal('pc') }

  const handleSave = async () => {
    setSaving(true)
    let url = '', body = {}
    if (modal === 'qual') { url = `/api/programs/${id}/qualifications`; body = form }
    else if (modal === 'unit') { url = `/api/programs/${id}/qualifications/${ctx.qualId}/units`; body = form }
    else if (modal === 'pc')   { url = `/api/programs/${id}/qualifications/${ctx.qualId}/units/${ctx.unitId}/criteria`; body = form }
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { setModal(null); load() }
    setSaving(false)
  }

  const deleteQual = async (qualId: string) => {
    if (!confirm('Delete qualification?')) return
    await fetch(`/api/programs/${id}/qualifications/${qualId}`, { method: 'DELETE' })
    load()
  }

  const NC_LEVELS = ['NC I', 'NC II', 'NC III', 'NC IV', 'COC']

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
        <Link href={`/dashboard/programs/${id}`} className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Program</Link>
        <span>/</span><span className="text-slate-300">TESDA Qualifications</span>
      </div>
      <PageHeader
        title="TESDA Qualifications"
        description="Manage NC-level qualifications, competency units, and performance criteria."
        actions={
          <button id="btn-add-qual" onClick={openQual} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Qualification
          </button>
        }
      />

      {loading ? <div className="py-20 text-center text-slate-500">Loading qualificationsâ€¦</div> : quals.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-500 mb-3">No qualifications defined yet.</p>
          <button onClick={openQual} className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm">Add First Qualification</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {quals.map((qual) => (
            <div key={qual.id} className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-xs font-bold">{qual.ncLevel}</span>
                <span className="text-white font-semibold flex-1">{qual.name}</span>
                <span className="text-slate-500 text-xs">{qual.units.length} units</span>
                <button id={`btn-add-unit-${qual.id}`} onClick={() => openUnit(qual.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"><Plus className="w-3 h-3" /> Unit</button>
                <button id={`btn-del-qual-${qual.id}`} onClick={() => deleteQual(qual.id)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => toggle(qual.id)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400">
                  {expanded[qual.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
              {expanded[qual.id] && (
                <div className="px-5 py-3 flex flex-col gap-3">
                  {qual.units.map((unit) => (
                    <div key={unit.id} className="rounded-lg bg-slate-800/50 border border-slate-700 overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className="font-mono text-xs text-green-300 font-bold">{unit.code}</span>
                        <span className="text-slate-300 text-sm flex-1">{unit.name}</span>
                        <span className="text-slate-500 text-xs">{unit.criteria.length} PC</span>
                        <button id={`btn-add-pc-${unit.id}`} onClick={() => openPc(qual.id, unit.id)} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"><Plus className="w-3 h-3" /> PC</button>
                        <button onClick={() => toggle(unit.id)} className="p-1 rounded hover:bg-slate-700 text-slate-500">
                          {expanded[unit.id] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </div>
                      {expanded[unit.id] && unit.criteria.length > 0 && (
                        <div className="border-t border-slate-700 px-4 py-2 flex flex-col gap-1.5">
                          {unit.criteria.map((pc) => (
                            <div key={pc.id} className="flex items-start gap-2 text-xs">
                              <span className="font-mono text-amber-300 flex-shrink-0 mt-0.5">{pc.code}</span>
                              <span className="text-slate-400">{pc.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {expanded[unit.id] && unit.criteria.length === 0 && (
                        <div className="border-t border-slate-700 px-4 py-3 text-xs text-slate-500 text-center">No performance criteria â€” add PC above</div>
                      )}
                    </div>
                  ))}
                  {qual.units.length === 0 && <p className="text-xs text-slate-500 text-center py-3">No competency units yet</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal === 'qual' && (
        <Modal title="Add Qualification" onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">NC Level</label>
              <select id="input-qual-nc" className={inputCls} value={form.ncLevel} onChange={(e) => setForm((f) => ({ ...f, ncLevel: e.target.value }))}>
                <option value="">â€” Select NC Level â€”</option>
                {NC_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Qualification Name</label>
              <input id="input-qual-name" className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Computer Systems Servicing" />
            </div>
            <div className="flex justify-end gap-2"><button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Cancel</button><button id="btn-save-qual" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Savingâ€¦' : 'Save'}</button></div>
          </div>
        </Modal>
      )}
      {modal === 'unit' && (
        <Modal title="Add Competency Unit" onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Unit Code</label><input id="input-unit-code" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="e.g. CSS231201" /></div>
            <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Unit Name</label><input id="input-unit-name" className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Install and Configure Computer Systems" /></div>
            <div className="flex justify-end gap-2"><button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Cancel</button><button id="btn-save-unit" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Savingâ€¦' : 'Save'}</button></div>
          </div>
        </Modal>
      )}
      {modal === 'pc' && (
        <Modal title="Add Performance Criteria" onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">PC Code</label><input id="input-pc-code" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="e.g. PC1.1" /></div>
            <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Description</label><textarea id="input-pc-desc" rows={3} className={inputCls} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Performance criteria descriptionâ€¦" /></div>
            <div className="flex justify-end gap-2"><button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Cancel</button><button id="btn-save-pc" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Savingâ€¦' : 'Save'}</button></div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}
