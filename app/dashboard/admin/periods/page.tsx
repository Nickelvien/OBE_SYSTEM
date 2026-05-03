'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Plus, Pencil, Trash2, Lock, Unlock, CheckCircle, Loader2 } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/data-table'
import { PageHeader } from '@/components/layout/page-header'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useNotify } from '@/components/ui/toaster'

interface Period { id: string; name: string; startDate: string; endDate: string; isActive: boolean; isLocked: boolean }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">{label}</Label>
      {children}
    </div>
  )
}

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Period | null>(null)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const notify = useNotify()

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/periods')
    if (res.ok) setPeriods(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const patch = async (id: string, data: Partial<Period>) => {
    try {
      await fetch(`/api/admin/periods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      load()
      if (data.isActive) notify.success('Period activated', 'This is now the active academic period.')
      if (data.isLocked !== undefined) notify.info(data.isLocked ? 'Period locked' : 'Period unlocked', `"${periods.find((p) => p.id === id)?.name}" ${data.isLocked ? 'is now locked' : 'is now unlocked'}.`)
    } catch {
      notify.error('Error', 'Failed to update period')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const url = modal === 'create' ? '/api/admin/periods' : `/api/admin/periods/${selected?.id}`
      const method = modal === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error?.message ?? 'Error saving period')
        return
      }
      setModal(null)
      load()
      notify.success(modal === 'create' ? 'Period created' : 'Period updated', form.name)
    } catch {
      notify.error('Error', 'Failed to save period')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this period?')) return
    await fetch(`/api/admin/periods/${id}`, { method: 'DELETE' })
    load()
    notify.warning('Period removed', 'Soft-deleted successfully')
  }

  const columns: Column<Period>[] = [
    { key: 'name', header: 'Period', sortable: true, cell: (r) => <span className="font-semibold text-foreground">{r.name}</span> },
    { key: 'startDate', header: 'Start', cell: (r) => <span className="text-muted-foreground text-xs">{format(new Date(r.startDate), 'MMM d, yyyy')}</span> },
    { key: 'endDate', header: 'End', cell: (r) => <span className="text-muted-foreground text-xs">{format(new Date(r.endDate), 'MMM d, yyyy')}</span> },
    {
      key: 'status', header: 'Status',
      cell: (r) => (
        <div className="flex gap-1.5">
          {r.isActive && <Badge variant="success" className="text-[10px]">Active</Badge>}
          {r.isLocked && <Badge variant="secondary" className="text-[10px]">Locked</Badge>}
          {!r.isActive && !r.isLocked && <span className="text-muted-foreground text-xs">—</span>}
        </div>
      ),
    },
  ]

  return (
    <DashboardShell>
      <PageHeader
        title="Academic Periods"
        description="Manage academic semesters and years."
        actions={
          <Button id="btn-create-period" onClick={() => { setForm({ name: '', startDate: '', endDate: '' }); setError(''); setModal('create') }}>
            <Plus className="w-4 h-4" />
            Add Period
          </Button>
        }
      />

      <DataTable
        id="periods-table"
        data={periods}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search periods…"
        pageSize={12}
        actions={(row) => (
          <div className="flex items-center gap-1 justify-end">
            {!row.isActive && (
              <Button id={`btn-activate-${row.id}`} variant="ghost" size="icon-sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10" onClick={() => patch(row.id, { isActive: true })} title="Set active">
                <CheckCircle className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button id={`btn-lock-${row.id}`} variant="ghost" size="icon-sm" onClick={() => patch(row.id, { isLocked: !row.isLocked })} title={row.isLocked ? 'Unlock' : 'Lock'}>
              {row.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </Button>
            <Button id={`btn-edit-period-${row.id}`} variant="ghost" size="icon-sm" onClick={() => { setSelected(row); setForm({ name: row.name, startDate: row.startDate.slice(0, 10), endDate: row.endDate.slice(0, 10) }); setError(''); setModal('edit') }}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button id={`btn-delete-period-${row.id}`} variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(row.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      />

      {modal && (
        <Modal title={modal === 'create' ? 'Add Period' : 'Edit Period'} onClose={() => setModal(null)} maxWidth="sm">
          <div className="flex flex-col gap-4">
            <Field label="Name">
              <Input id="input-period-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. 1st Semester AY 2025—2026" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <Input id="input-period-start" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </Field>
              <Field label="End Date">
                <Input id="input-period-end" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
              </Field>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-slide-up">{error}</div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button id="btn-save-period" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}