'use client'
// app/(dashboard)/cqi/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { DataTable, Column } from '@/components/ui/data-table'
import { CheckSquare, Pencil, X } from 'lucide-react'
import { format } from 'date-fns'

interface CqiPlan {
  id: string; programId: string; periodId: string; triggeredBy: string; entityId: string
  status: string; description: string; responsible: string | null; targetDate: string | null
  completedAt: string | null; createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  open:        'bg-red-500/20 text-red-300',
  in_progress: 'bg-amber-500/20 text-amber-300',
  completed:   'bg-green-500/20 text-green-300',
}
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

export default function CQIPage() {
  const [plans,    setPlans]    = useState<CqiPlan[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [selected, setSelected] = useState<CqiPlan | null>(null)
  const [form,     setForm]     = useState({ status: 'open', description: '', responsible: '', targetDate: '' })
  const [saving,   setSaving]   = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = statusFilter ? `?status=${statusFilter}` : ''
    const res = await fetch(`/api/cqi${params}`)
    if (res.ok) setPlans(await res.json())
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const openEdit = (p: CqiPlan) => {
    setSelected(p)
    setForm({ status: p.status, description: p.description, responsible: p.responsible ?? '', targetDate: p.targetDate ? p.targetDate.slice(0, 10) : '' })
    setModal(true)
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/cqi/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, targetDate: form.targetDate || null }) })
    setModal(false); load()
    setSaving(false)
  }

  const handleComplete = async (id: string) => {
    await fetch(`/api/cqi/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed', completedAt: new Date().toISOString() }) })
    load()
  }

  const columns: Column<CqiPlan>[] = [
    { key: 'triggeredBy', header: 'Trigger',     cell: (r) => <span className="text-xs font-mono text-slate-400">{r.triggeredBy}</span> },
    { key: 'description', header: 'Description', cell: (r) => <span className="text-slate-300 text-sm line-clamp-2">{r.description}</span> },
    { key: 'responsible', header: 'Responsible', cell: (r) => <span className="text-slate-400 text-sm">{r.responsible ?? '—'}</span> },
    { key: 'targetDate',  header: 'Target',      cell: (r) => r.targetDate ? <span className="text-sm text-slate-300">{format(new Date(r.targetDate), 'MMM d, yyyy')}</span> : <span className="text-slate-500">—</span> },
    { key: 'status',      header: 'Status',      cell: (r) => <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? ''}`}>{r.status.replace('_',' ')}</span> },
  ]

  return (
    <DashboardShell>
      <PageHeader title="CQI Action Plans" description="Continuous Quality Improvement plans auto-triggered when attainment falls below threshold." />

      <div className="flex gap-3">
        <select id="filter-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-slate-700 text-white text-sm focus:outline-none">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? <div className="py-20 text-center text-slate-500">Loading…</div> : (
        <DataTable id="cqi-table" data={plans} columns={columns}
          emptyMessage="No CQI plans. Attainment has not breached thresholds yet."
          actions={(row) => (
            <div className="flex items-center gap-2 justify-end">
              {row.status !== 'completed' && (
                <button id={`btn-complete-${row.id}`} onClick={() => handleComplete(row.id)} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/20 text-green-300 hover:bg-green-500/40">
                  <CheckSquare className="w-3.5 h-3.5" /> Complete
                </button>
              )}
              <button id={`btn-edit-cqi-${row.id}`} onClick={() => openEdit(row)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
            </div>
          )}
        />
      )}

      {modal && selected && (
        <Modal title="Edit CQI Plan" onClose={() => setModal(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Status</label>
              <select id="input-cqi-status" className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Description</label>
              <textarea id="input-cqi-desc" rows={3} className={inputCls} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Responsible Person</label>
              <input id="input-cqi-responsible" className={inputCls} value={form.responsible} onChange={(e) => setForm((f) => ({ ...f, responsible: e.target.value }))} placeholder="Name or role" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Target Date</label>
              <input id="input-cqi-target" type="date" className={inputCls} value={form.targetDate} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Cancel</button>
              <button id="btn-save-cqi" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}
