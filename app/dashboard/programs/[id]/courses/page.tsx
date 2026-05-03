'use client'
// app/(dashboard)/programs/[id]/courses/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { DataTable, Column } from '@/components/ui/data-table'
import { Plus, Pencil, Trash2, X, ArrowLeft, ChevronRight } from 'lucide-react'

interface Course { id: string; code: string; name: string; units: number; yearLevel: number; semester: number; clos: unknown[] }

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

export default function CoursesPage() {
  const { id }     = useParams<{ id: string }>()
  const [courses,  setCourses]  = useState<Course[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Course | null>(null)
  const [form,     setForm]     = useState({ code: '', name: '', units: 3, yearLevel: 1, semester: 1 })
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/programs/${id}/courses`)
    if (res.ok) setCourses(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    const url    = modal === 'create' ? `/api/programs/${id}/courses` : `/api/programs/${id}/courses/${selected?.id}`
    const method = modal === 'create' ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setModal(null); load() }
    setSaving(false)
  }

  const columns: Column<Course>[] = [
    { key: 'code',      header: 'Code',       sortable: true, cell: (r) => <span className="font-mono font-semibold text-green-300">{r.code}</span> },
    { key: 'name',      header: 'Course Name', sortable: true, cell: (r) => <span className="text-white font-medium">{r.name}</span> },
    { key: 'units',     header: 'Units',      cell: (r) => <span className="text-slate-400">{r.units}</span> },
    { key: 'yearLevel', header: 'Year',       cell: (r) => <span className="text-slate-400">Y{r.yearLevel} S{r.semester}</span> },
    { key: 'clos',      header: 'CLOs',       cell: (r) => <span className="text-slate-400">{(r.clos as unknown[]).length}</span> },
  ]

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-2">
        <Link href={`/dashboard/programs/${id}`} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"><ArrowLeft className="w-4 h-4" /> Program</Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-400 text-sm">Courses</span>
      </div>
      <PageHeader
        title="Course Catalog"
        description="Manage courses and their learning outcomes."
        actions={
          <button id="btn-create-course" onClick={() => { setForm({ code: '', name: '', units: 3, yearLevel: 1, semester: 1 }); setModal('create') }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Course
          </button>
        }
      />
      {loading ? <div className="py-20 text-center text-slate-500">Loading…</div> : (
        <DataTable id="courses-table" data={courses} columns={columns}
          actions={(row) => (
            <div className="flex items-center gap-2 justify-end">
              <Link id={`btn-clos-${row.id}`} href={`/dashboard/programs/${id}/courses/${row.id}/clos`} className="px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 border border-primary/30">CLOs</Link>
              <button id={`btn-edit-course-${row.id}`} onClick={() => { setSelected(row); setForm({ code: row.code, name: row.name, units: row.units, yearLevel: row.yearLevel, semester: row.semester }); setModal('edit') }} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
              <button id={`btn-delete-course-${row.id}`} onClick={async () => { if (!confirm('Delete course?')) return; await fetch(`/api/programs/${id}/courses/${row.id}`, { method: 'DELETE' }); load() }} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        />
      )}
      {modal && (
        <Modal title={modal === 'create' ? 'Add Course' : 'Edit Course'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Code</label>
                <input id="input-course-code" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Units</label>
                <input id="input-course-units" type="number" min={0} className={inputCls} value={form.units} onChange={(e) => setForm((f) => ({ ...f, units: +e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Course Name</label>
              <input id="input-course-name" className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Year Level</label>
                <select id="input-course-year" className={inputCls} value={form.yearLevel} onChange={(e) => setForm((f) => ({ ...f, yearLevel: +e.target.value }))}>
                  {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Semester</label>
                <select id="input-course-sem" className={inputCls} value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: +e.target.value }))}>
                  <option value={1}>1st Semester</option>
                  <option value={2}>2nd Semester</option>
                  <option value={3}>Summer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button id="btn-cancel" onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Cancel</button>
              <button id="btn-save-course" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}
