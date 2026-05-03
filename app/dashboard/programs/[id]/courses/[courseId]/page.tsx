'use client'
// app/(dashboard)/programs/[id]/courses/[courseId]/page.tsx — Course detail + CLOs
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell }    from '@/components/layout/dashboard-shell'
import { PageHeader }        from '@/components/layout/page-header'
import { DataTable, Column } from '@/components/ui/data-table'
import { ArrowLeft, Plus, Pencil, Trash2, X, Link2 } from 'lucide-react'

interface CLO { id: string; code: string; description: string; weight: number; ploMappings: { plo: { code: string } }[] }
interface Course { id: string; code: string; name: string; units: number; yearLevel: number; semester: number }

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

export default function CourseDetailPage() {
  const { id, courseId } = useParams<{ id: string; courseId: string }>()
  const [course,   setCourse]   = useState<Course | null>(null)
  const [clos,     setClos]     = useState<CLO[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<CLO | null>(null)
  const [form,     setForm]     = useState({ code: '', description: '', weight: 0.25 })
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [courseRes, closRes] = await Promise.all([
      fetch(`/api/programs/${id}/courses/${courseId}`).then((r) => r.json()),
      fetch(`/api/programs/${id}/courses/${courseId}/clos`).then((r) => r.json()),
    ])
    setCourse(courseRes)
    setClos(closRes)
    setLoading(false)
  }, [id, courseId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    const url    = modal === 'create' ? `/api/programs/${id}/courses/${courseId}/clos` : `/api/programs/${id}/courses/${courseId}/clos/${selected?.id}`
    const method = modal === 'create' ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, weight: Number(form.weight) }) })
    if (res.ok) { setModal(null); load() }
    setSaving(false)
  }

  const handleDelete = async (cloId: string) => {
    if (!confirm('Delete this CLO? All linked PLO mappings and scores will be affected.')) return
    await fetch(`/api/programs/${id}/courses/${courseId}/clos/${cloId}`, { method: 'DELETE' })
    load()
  }

  const columns: Column<CLO>[] = [
    { key: 'code',        header: 'Code',        sortable: true, cell: (r) => <span className="font-mono font-bold text-amber-300">{r.code}</span> },
    { key: 'description', header: 'Description', cell: (r) => <span className="text-slate-300 text-sm">{r.description}</span> },
    { key: 'weight',      header: 'Weight',      cell: (r) => <span className="text-primary font-mono">{(Number(r.weight) * 100).toFixed(0)}%</span> },
    { key: 'ploMappings', header: 'Linked PLOs', cell: (r) => <span className="text-xs text-slate-400">{r.ploMappings.length > 0 ? r.ploMappings.map((m) => m.plo.code).join(', ') : <span className="text-slate-600">None</span>}</span> },
  ]

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
        <Link href={`/dashboard/programs/${id}`} className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Program</Link>
        <span>/</span>
        <Link href={`/dashboard/programs/${id}/courses`} className="hover:text-white">Courses</Link>
        <span>/</span><span className="text-slate-300">{course?.code ?? '...'}</span>
      </div>

      <PageHeader
        title={course ? `${course.code} — ${course.name}` : 'Loading…'}
        description={course ? `Year ${course.yearLevel} · Semester ${course.semester} · ${course.units} unit(s)` : ''}
        actions={
          <button id="btn-add-clo" onClick={() => { setForm({ code: '', description: '', weight: 0.25 }); setModal('create') }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Add CLO
          </button>
        }
      />

      <div className="rounded-xl bg-card border border-border p-4 text-sm text-slate-400 flex items-center gap-2">
        <Link2 className="w-4 h-4 flex-shrink-0 text-primary" />
        <span>After adding CLOs, go to <strong className="text-white">PLOs → CLO Mappings</strong> to link them to Program Learning Outcomes with weights.</span>
      </div>

      {loading ? <div className="py-20 text-center text-slate-500">Loading CLOs…</div> : (
        <DataTable id="clos-table" data={clos} columns={columns}
          emptyMessage="No CLOs yet. Click Add CLO to create the first Course Learning Outcome."
          actions={(row) => (
            <div className="flex items-center gap-2 justify-end">
              <button id={`btn-edit-clo-${row.id}`} onClick={() => { setSelected(row); setForm({ code: row.code, description: row.description, weight: Number(row.weight) }); setModal('edit') }} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
              <button id={`btn-delete-clo-${row.id}`} onClick={() => handleDelete(row.id)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        />
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'Add CLO' : 'Edit CLO'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">CLO Code</label>
                <input id="input-clo-code" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="e.g. CLO1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Weight (0–1)</label>
                <input id="input-clo-weight" type="number" step="0.01" min={0} max={1} className={inputCls} value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: parseFloat(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Description</label>
              <textarea id="input-clo-desc" rows={3} className={inputCls} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Students shall be able to…" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Cancel</button>
              <button id="btn-save-clo" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium disabled:opacity-60">{saving ? 'Saving…' : 'Save CLO'}</button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}
