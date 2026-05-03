'use client'
// app/(dashboard)/faculty/courses/[assignmentId]/assessments/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { DataTable, Column } from '@/components/ui/data-table'
import { Plus, Pencil, Trash2, X, ArrowLeft } from 'lucide-react'

interface Assessment { id: string; name: string; assessmentType: string; maxScore: number; weight: number; cloAlignments: { clo: { code: string } }[] }

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

export default function AssessmentsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState<'create' | 'edit' | null>(null)
  const [selected,    setSelected]    = useState<Assessment | null>(null)
  const [form,        setForm]        = useState({ name: '', assessmentType: 'formative', maxScore: 100, weight: 0.25 })
  const [saving,      setSaving]      = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/faculty/courses/${assignmentId}/assessments`)
    if (res.ok) setAssessments(await res.json())
    setLoading(false)
  }, [assignmentId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    const url    = modal === 'create' ? `/api/faculty/courses/${assignmentId}/assessments` : `/api/faculty/courses/${assignmentId}/assessments/${selected?.id}`
    const method = modal === 'create' ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, maxScore: Number(form.maxScore), weight: Number(form.weight) }) })
    if (res.ok) { setModal(null); load() }
    setSaving(false)
  }

  const columns: Column<Assessment>[] = [
    { key: 'name',           header: 'Assessment',  sortable: true, cell: (r) => <span className="font-medium text-white">{r.name}</span> },
    { key: 'assessmentType', header: 'Type',        cell: (r) => <span className="capitalize text-slate-400 text-sm">{r.assessmentType}</span> },
    { key: 'maxScore',       header: 'Max Score',   cell: (r) => <span className="text-slate-300">{Number(r.maxScore)}</span> },
    { key: 'weight',         header: 'Weight',      cell: (r) => <span className="text-slate-300">{(Number(r.weight) * 100).toFixed(0)}%</span> },
    { key: 'cloAlignments',  header: 'CLO Aligned', cell: (r) => <span className="text-xs text-slate-400">{r.cloAlignments.map((a) => a.clo.code).join(', ') || '—'}</span> },
  ]

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
        <Link href="/dashboard/faculty/assignments" className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> My Courses</Link>
        <span>/</span><span className="text-slate-300">Assessments</span>
      </div>
      <PageHeader
        title="Assessments"
        description="Create assessment tools and align them to Course Learning Outcomes."
        actions={
          <div className="flex gap-2">
            <Link id="btn-goto-scores" href={`/dashboard/faculty/courses/${assignmentId}/scores`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm border border-slate-700">
              Enter Scores
            </Link>
            <button id="btn-create-assessment" onClick={() => { setForm({ name: '', assessmentType: 'formative', maxScore: 100, weight: 0.25 }); setModal('create') }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Assessment
            </button>
          </div>
        }
      />
      {loading ? <div className="py-20 text-center text-slate-500">Loading…</div> : (
        <DataTable id="assessments-table" data={assessments} columns={columns}
          emptyMessage="No assessments yet. Click Add Assessment to create one."
          actions={(row) => (
            <div className="flex items-center gap-2 justify-end">
              <button id={`btn-edit-${row.id}`} onClick={() => { setSelected(row); setForm({ name: row.name, assessmentType: row.assessmentType, maxScore: Number(row.maxScore), weight: Number(row.weight) }); setModal('edit') }} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
              <button id={`btn-delete-${row.id}`} onClick={async () => { if (!confirm('Delete assessment?')) return; await fetch(`/api/faculty/courses/${assignmentId}/assessments/${row.id}`, { method: 'DELETE' }); load() }} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        />
      )}
      {modal && (
        <Modal title={modal === 'create' ? 'Add Assessment' : 'Edit Assessment'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Name</label>
              <input id="input-asm-name" className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Midterm Exam" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Type</label>
                <select id="input-asm-type" className={inputCls} value={form.assessmentType} onChange={(e) => setForm((f) => ({ ...f, assessmentType: e.target.value }))}>
                  {['formative','summative','performance','portfolio'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Max Score</label>
                <input id="input-asm-max" type="number" min={1} className={inputCls} value={form.maxScore} onChange={(e) => setForm((f) => ({ ...f, maxScore: +e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Weight (0–1)</label>
              <input id="input-asm-weight" type="number" step="0.01" min={0} max={1} className={inputCls} value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: +e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Cancel</button>
              <button id="btn-save-asm" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}
