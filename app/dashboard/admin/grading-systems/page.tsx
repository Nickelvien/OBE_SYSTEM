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
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { useNotify } from '@/components/ui/toaster'

interface GradingSystem {
  id: string; name: string; passingThreshold: number; eviThreshold: number
  cowThreshold: number; scaleType: string
}

const defaultForm = { name: '', passingThreshold: 75, eviThreshold: 80, cowThreshold: 70, scaleType: 'percentage' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">{label}</Label>
      {children}
    </div>
  )
}

export default function GradingSystemsPage() {
  const [systems, setSystems] = useState<GradingSystem[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<GradingSystem | null>(null)
  const [form, setForm] = useState({ ...defaultForm })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const notify = useNotify()

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/grading-systems')
    if (res.ok) setSystems(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm({ ...defaultForm }); setError(''); setModal('create') }
  const openEdit = (g: GradingSystem) => {
    setSelected(g)
    setForm({
      name: g.name,
      passingThreshold: Number(g.passingThreshold),
      eviThreshold: Number(g.eviThreshold),
      cowThreshold: Number(g.cowThreshold),
      scaleType: g.scaleType,
    })
    setError('')
    setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const url = modal === 'create' ? '/api/admin/grading-systems' : `/api/admin/grading-systems/${selected?.id}`
      const method = modal === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error?.message ?? 'Error saving grading system')
        return
      }
      setModal(null)
      load()
      notify.success(modal === 'create' ? 'Grading system created' : 'Grading system updated', form.name)
    } catch {
      notify.error('Error', 'Failed to save grading system')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete grading system? Programs using it may be affected.')) return
    await fetch(`/api/admin/grading-systems/${id}`, { method: 'DELETE' })
    load()
    notify.warning('Grading system removed', 'Soft-deleted successfully')
  }

  const columns: Column<GradingSystem>[] = [
    { key: 'name', header: 'Name', sortable: true, cell: (r) => <span className="font-semibold text-foreground">{r.name}</span> },
    {
      key: 'passingThreshold', header: 'Passing',
      cell: (r) => <Badge variant="success" className="font-mono text-[11px]">{Number(r.passingThreshold).toFixed(0)}%</Badge>,
    },
    {
      key: 'eviThreshold', header: 'EVI',
      cell: (r) => <Badge variant="default" className="font-mono text-[11px]">{Number(r.eviThreshold).toFixed(0)}%</Badge>,
    },
    {
      key: 'cowThreshold', header: 'COW',
      cell: (r) => <Badge variant="warning" className="font-mono text-[11px]">{Number(r.cowThreshold).toFixed(0)}%</Badge>,
    },
    { key: 'scaleType', header: 'Scale', cell: (r) => <span className="text-muted-foreground text-xs capitalize">{r.scaleType}</span> },
  ]

  return (
    <DashboardShell>
      <PageHeader
        title="Grading Systems"
        description="Configure passing, EVI, and COW thresholds per scale type."
        actions={
          <Button id="btn-create-gs" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add Grading System
          </Button>
        }
      />

      <Card className="border-amber-500/20 bg-amber-500/[0.03] p-4 text-amber-300 text-xs flex items-start gap-2 mb-2">
        <span className="text-base flex-shrink-0">!</span>
        <span><strong>Security:</strong> Thresholds are always read from this table — never hardcoded in engine logic.</span>
      </Card>

      <DataTable
        id="gs-table"
        data={systems}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search grading systems…"
        pageSize={12}
        actions={(row) => (
          <div className="flex items-center gap-1 justify-end">
            <Button id={`btn-edit-gs-${row.id}`} variant="ghost" size="icon-sm" onClick={() => openEdit(row)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button id={`btn-delete-gs-${row.id}`} variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(row.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      />

      {modal && (
        <Modal title={modal === 'create' ? 'Add Grading System' : 'Edit Grading System'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <Field label="Name">
              <Input id="input-gs-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. CHED Standard 2024" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Passing %">
                <Input id="input-gs-pass" type="number" min={0} max={100} value={form.passingThreshold} onChange={(e) => setForm((f) => ({ ...f, passingThreshold: +e.target.value }))} />
              </Field>
              <Field label="EVI %">
                <Input id="input-gs-evi" type="number" min={0} max={100} value={form.eviThreshold} onChange={(e) => setForm((f) => ({ ...f, eviThreshold: +e.target.value }))} />
              </Field>
              <Field label="COW %">
                <Input id="input-gs-cow" type="number" min={0} max={100} value={form.cowThreshold} onChange={(e) => setForm((f) => ({ ...f, cowThreshold: +e.target.value }))} />
              </Field>
            </div>
            <Field label="Scale Type">
              <Select
                id="input-gs-scale"
                value={form.scaleType}
                onChange={(e) => setForm((f) => ({ ...f, scaleType: e.target.value }))}
                options={[
                  { value: 'percentage', label: 'Percentage' },
                  { value: 'points', label: 'Points' },
                  { value: 'competency', label: 'Competency (TESDA)' },
                ]}
              />
            </Field>
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-slide-up">{error}</div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button id="btn-save-gs" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}