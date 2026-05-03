'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/data-table'
import { PageHeader } from '@/components/layout/page-header'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useNotify } from '@/components/ui/toaster'

interface GradingSystemRec { id: string; name: string }
interface DepartmentRec { id: string; name: string }
interface Program {
  id: string; name: string; code: string; mode: string
  departmentId: string | null; gradingSystemId: string
  department?: { id: string; name: string } | null
  gradingSystem?: { id: string; name: string }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">{label}</Label>
      {children}
    </div>
  )
}

export default function ProgramsAdminPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [depts, setDepts] = useState<DepartmentRec[]>([])
  const [gradSys, setGradSys] = useState<GradingSystemRec[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Program | null>(null)
  const [form, setForm] = useState({ name: '', code: '', mode: 'CHED', departmentId: '', gradingSystemId: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const notify = useNotify()

  const load = useCallback(async () => {
    setLoading(true)
    const [pr, dp, gs] = await Promise.all([
      fetch('/api/admin/programs').then((r) => r.json()),
      fetch('/api/admin/departments').then((r) => r.json()),
      fetch('/api/admin/grading-systems').then((r) => r.json()),
    ])
    setPrograms(pr)
    setDepts(dp)
    setGradSys(gs)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm({ name: '', code: '', mode: 'CHED', departmentId: depts[0]?.id ?? '', gradingSystemId: gradSys[0]?.id ?? '' })
    setError('')
    setModal('create')
  }

  const openEdit = (p: Program) => {
    setSelected(p)
    setForm({ name: p.name, code: p.code, mode: p.mode, departmentId: p.departmentId ?? '', gradingSystemId: p.gradingSystemId })
    setError('')
    setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const body = { ...form, departmentId: form.departmentId || null }
      const url = modal === 'create' ? '/api/admin/programs' : `/api/admin/programs/${selected?.id}`
      const method = modal === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error?.message ?? 'Error saving program')
        return
      }
      setModal(null)
      load()
      notify.success(modal === 'create' ? 'Program created' : 'Program updated', form.name)
    } catch {
      notify.error('Error', 'Failed to save program')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this program?')) return
    await fetch(`/api/admin/programs/${id}`, { method: 'DELETE' })
    load()
    notify.warning('Program removed', 'Soft-deleted successfully')
  }

  const columns: Column<Program>[] = [
    { key: 'name', header: 'Program', sortable: true, cell: (r) => <span className="font-semibold text-foreground">{r.name}</span> },
    { key: 'code', header: 'Code', sortable: true, cell: (r) => <Badge variant="outline" className="font-mono text-[11px]">{r.code}</Badge> },
    {
      key: 'mode', header: 'Mode',
      cell: (r) => <Badge variant={r.mode === 'CHED' ? 'default' : 'warning'} className="text-[10px]">{r.mode}</Badge>,
    },
    { key: 'departmentDetail', header: 'Department', cell: (r) => <span className="text-muted-foreground text-sm">{r.department?.name ?? '—'}</span> },
  ]

  return (
    <DashboardShell>
      <PageHeader
        title="Programs Configuration"
        description="Manage academic programs, assign departments & grading systems."
        actions={
          <Button id="btn-create-program" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add Program
          </Button>
        }
      />

      <DataTable
        id="programs-table"
        data={programs}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search programs…"
        pageSize={12}
        actions={(row) => (
          <div className="flex items-center gap-1 justify-end">
            <Button id={`btn-edit-prog-${row.id}`} variant="ghost" size="icon-sm" onClick={() => openEdit(row)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button id={`btn-delete-prog-${row.id}`} variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(row.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      />

      {modal && (
        <Modal title={modal === 'create' ? 'Add Program' : 'Edit Program'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <Field label="Name">
              <Input id="input-prog-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Code">
                <Input id="input-prog-code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} maxLength={10} />
              </Field>
              <Field label="Mode">
                <Select
                  id="input-prog-mode"
                  value={form.mode}
                  onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
                  options={[{ value: 'CHED', label: 'CHED' }, { value: 'TESDA', label: 'TESDA' }]}
                />
              </Field>
            </div>
            <Field label="Department">
              <Select
                id="input-prog-dept"
                value={form.departmentId}
                onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                placeholder="— No department —"
                options={depts.map((d) => ({ value: d.id, label: d.name }))}
              />
            </Field>
            <Field label="Grading System">
              <Select
                id="input-prog-grading"
                value={form.gradingSystemId}
                onChange={(e) => setForm((f) => ({ ...f, gradingSystemId: e.target.value }))}
                options={gradSys.map((g) => ({ value: g.id, label: g.name }))}
              />
            </Field>
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-slide-up">{error}</div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button id="btn-save-prog" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}