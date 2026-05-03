'use client'
// app/(dashboard)/programs/[id]/plos/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { DataTable, Column } from '@/components/ui/data-table'
import { Plus, Pencil, Trash2, X, ArrowLeft } from 'lucide-react'

interface PLO { id: string; code: string; description: string; cloMappings: unknown[]; peoLinks: unknown[] }

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

export default function PLOsPage() {
  const { id }    = useParams<{ id: string }>()
  const [plos,    setPlos]    = useState<PLO[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<'create' | 'edit' | null>(null)
  const [selected,setSelected]= useState<PLO | null>(null)
  const [form,    setForm]    = useState({ code: '', description: '' })
  const [saving,  setSaving]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/programs/${id}/plos`)
    if (res.ok) setPlos(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    const url    = modal === 'create' ? `/api/programs/${id}/plos` : `/api/programs/${id}/plos/${selected?.id}`
    const method = modal === 'create' ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setModal(null); load() }
    setSaving(false)
  }

  const handleDelete = async (ploId: string) => {
    if (!confirm('Delete this PLO? A snapshot will be created.')) return
    await fetch(`/api/programs/${id}/plos/${ploId}`, { method: 'DELETE' })
    load()
  }

  const columns: Column<PLO>[] = [
    { key: 'code',        header: 'Code',        sortable: true, width: 'w-24', cell: (r) => <span className="font-mono font-semibold text-primary/80">{r.code}</span> },
    { key: 'description', header: 'Description',  cell: (r) => <span className="text-slate-300 text-sm">{r.description}</span> },
    { key: 'cloMappings', header: 'CLO Links',    cell: (r) => <span className="text-slate-400 text-sm">{(r.cloMappings as unknown[]).length}</span> },
  ]

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2">
        <Link href={`/dashboard/programs/${id}`} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"><ArrowLeft className="w-4 h-4" /> Program</Link>
      </div>
      <PageHeader
        title="Program Learning Outcomes (PLOs)"
        description="Define measurable outcomes expected of graduates."
        actions={
          <button id="btn-create-plo" onClick={() => { setForm({ code: '', description: '' }); setModal('create') }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Add PLO
          </button>
        }
      />
      <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-primary/80 text-xs">
        ⚡ Every PLO change auto-creates a curriculum snapshot to preserve history.
      </div>
      {loading ? <div className="py-20 text-center text-slate-500">Loading…</div> : (
        <DataTable id="plos-table" data={plos} columns={columns}
          actions={(row) => (
            <div className="flex items-center gap-2 justify-end">
              <button id={`btn-edit-plo-${row.id}`} onClick={() => { setSelected(row); setForm({ code: row.code, description: row.description }); setModal('edit') }} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
              <button id={`btn-delete-plo-${row.id}`} onClick={() => handleDelete(row.id)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        />
      )}
      {modal && (
        <Modal title={modal === 'create' ? 'Add PLO' : 'Edit PLO'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Code</label>
              <input id="input-plo-code" className={inputCls} placeholder="e.g. PLO1" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Description</label>
              <textarea id="input-plo-desc" rows={3} className={inputCls} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button id="btn-cancel" onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Cancel</button>
              <button id="btn-save-plo" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}
