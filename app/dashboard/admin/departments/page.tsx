'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/data-table'
import { PageHeader } from '@/components/layout/page-header'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { useNotify } from '@/components/ui/toaster'

interface Dept { id: string; name: string; code: string; deanId: string | null; programs?: { id: string }[] }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">{label}</Label>
      {children}
    </div>
  )
}

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<Dept[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Dept | null>(null)
  const [form, setForm] = useState({ name: '', code: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const notify = useNotify()

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/departments')
    if (res.ok) setDepts(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm({ name: '', code: '' })
    setError('')
    setModal('create')
  }

  const openEdit = (d: Dept) => {
    setSelected(d)
    setForm({ name: d.name, code: d.code })
    setError('')
    setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const url = modal === 'create' ? '/api/admin/departments' : `/api/admin/departments/${selected?.id}`
      const method = modal === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error?.message ?? 'Error saving department')
        return
      }
      setModal(null)
      load()
      notify.success(modal === 'create' ? 'Department created' : 'Department updated', form.name)
    } catch {
      notify.error('Error', 'Failed to save department')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Soft-delete this department?')) return
    await fetch(`/api/admin/departments/${id}`, { method: 'DELETE' })
    load()
    notify.warning('Department removed', 'Soft-deleted successfully')
  }

  const columns: Column<Dept>[] = [
    { key: 'name', header: 'Name', sortable: true, cell: (r) => <span className="font-semibold text-foreground">{r.name}</span> },
    { key: 'code', header: 'Code', sortable: true, cell: (r) => <Badge variant="outline" className="font-mono text-[11px]">{r.code}</Badge> },
    {
      key: 'programCount', header: 'Programs', sortable: true,
      cell: (r) => <span className="text-muted-foreground">{r.programs?.length ?? 0}</span>,
    },
  ]

  return (
    <DashboardShell>
      <PageHeader
        title="Departments"
        description="Manage academic departments and associate deans."
        actions={
          <Button id="btn-create" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add Department
          </Button>
        }
      />

      <DataTable
        id="departments-table"
        data={depts}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search departments…"
        pageSize={12}
        actions={(row) => (
          <div className="flex items-center gap-1 justify-end">
            <Button id={`btn-edit-${row.id}`} variant="ghost" size="icon-sm" onClick={() => openEdit(row)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button id={`btn-delete-${row.id}`} variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(row.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      />

      {modal && (
        <Modal title={modal === 'create' ? 'Add Department' : 'Edit Department'} onClose={() => setModal(null)} maxWidth="sm">
          <div className="flex flex-col gap-4">
            <Field label="Name">
              <Input id="input-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Code">
              <Input id="input-code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} maxLength={6} />
            </Field>
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-slide-up">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}