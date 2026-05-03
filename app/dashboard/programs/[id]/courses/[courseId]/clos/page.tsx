'use client'
// app/(dashboard)/programs/[id]/courses/[courseId]/clos/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { DataTable, Column } from '@/components/ui/data-table'
import { Plus, Pencil, Trash2, X, ArrowLeft } from 'lucide-react'

interface CLO { id: string; code: string; description: string; weight: number; ploMappings: { plo: { code: string } }[] }

const inputCls = "w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-white font-semibold">{title}</h3>
          <button id="modal-close" onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function CLOsPage() {
  const { id, courseId } = useParams<{ id: string; courseId: string }>()
  const [clos,    setClos]    = useState<CLO[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<'create' | 'edit' | null>(null)
  const [selected,setSelected]= useState<CLO | null>(null)
  const [form,    setForm]    = useState({ code: '', description: '', weight: 1 })
  const [saving,  setSaving]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/programs/${id}/courses/${courseId}/clos`)
    if (res.ok) setClos(await res.json())
    setLoading(false)
  }, [id, courseId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    const url    = modal === 'create' ? `/api/programs/${id}/courses/${courseId}/clos` : `/api/programs/${id}/courses/${courseId}/clos/${selected?.id}`
    const method = modal === 'create' ? 'POST' : 'PATCH'
    const body   = { ...form, weight: parseFloat(String(form.weight)) }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { setModal(null); load() }
    setSaving(false)
  }

  const columns: Column<CLO>[] = [
    { key: 'code',        header: 'Code',        sortable: true, width: 'w-24', cell: (r) => <span className="font-mono font-semibold text-amber-300">{r.code}</span> },
    { key: 'description', header: 'Description',  cell: (r) => <span className="text-slate-300 text-sm">{r.description}</span> },
    { key: 'weight',      header: 'Weight',       cell: (r) => <span className="text-slate-400 text-sm">{(Number(r.weight) * 100).toFixed(0)}%</span> },
    { key: 'ploMappings', header: 'PLO Links',    cell: (r) => <span className="text-xs text-slate-400">{r.ploMappings.map((m) => m.plo.code).join(', ') || '—'}</span> },
  ]

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
        <Link href={`/dashboard/programs/${id}`} className="hover:text-white"><ArrowLeft className="w-4 h-4 inline" /> Program</Link>
        <span>/</span>
        <Link href={`/dashboard/programs/${id}/courses`} className="hover:text-white">Courses</Link>
        <span>/</span>
        <span className="text-slate-300">CLOs</span>
      </div>
      <PageHeader
        title="Course Learning Outcomes (CLOs)"
        description="Define specific measurable outcomes for this course."
        actions={
          <button id="btn-create-clo" onClick={() => { setForm({ code: '', description: '', weight: 1 }); setModal('create') }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Add CLO
          </button>
        }
      />
      <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3 text-amber-300 text-xs">
        ⚡ Every CLO change auto-creates a curriculum snapshot.
      </div>
      {loading ? <div className="py-20 text-center text-slate-500">Loading…</div> : (
        <DataTable id="clos-table" data={clos} columns={columns}
          actions={(row) => (
            <div className="flex items-center gap-2 justify-end">
              <button id={`btn-edit-clo-${row.id}`} onClick={() => { setSelected(row); setForm({ code: row.code, description: row.description, weight: Number(row.weight) }); setModal('edit') }} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
              <button id={`btn-delete-clo-${row.id}`} onClick={async () => { if (!confirm('Delete CLO?')) return; await fetch(`/api/programs/${id}/courses/${courseId}/clos/${row.id}`, { method: 'DELETE' }); load() }} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        />
      )}
      {modal && (
        <Modal title={modal === 'create' ? 'Add CLO' : 'Edit CLO'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Code</label>
                <input id="input-clo-code" className={inputCls} placeholder="e.g. CLO1" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Weight (0–1)</label>
                <input id="input-clo-weight" type="number" step="0.01" min={0} max={1} className={inputCls} value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: parseFloat(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Description</label>
              <textarea id="input-clo-desc" rows={3} className={inputCls} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button id="btn-cancel" onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Cancel</button>
              <button id="btn-save-clo" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}
