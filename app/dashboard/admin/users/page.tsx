'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { UserPlus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/data-table'
import { PageHeader } from '@/components/layout/page-header'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useNotify } from '@/components/ui/toaster'

interface User {
  id: string; email: string; firstName: string; lastName: string
  role: string; departmentId: string | null; isDpo: boolean
  accreditorExpiresAt: string | null; createdAt: string
}

const ROLES = ['super_admin','campus_admin','dean','program_head','faculty','student','accreditor']

const roleBadgeVariant: Record<string, 'purple' | 'default' | 'info' | 'success' | 'warning' | 'secondary' | 'rose'> = {
  super_admin: 'purple',
  campus_admin: 'default',
  dean: 'info',
  program_head: 'success',
  faculty: 'warning',
  student: 'secondary',
  accreditor: 'rose',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">{label}</Label>
      {children}
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<User | null>(null)
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', role: 'faculty',
    departmentId: '', isDpo: false, accreditorExpiresAt: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const notify = useNotify()

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm({ email: '', password: '', firstName: '', lastName: '', role: 'faculty', departmentId: '', isDpo: false, accreditorExpiresAt: '' })
    setError('')
    setModal('create')
  }

  const openEdit = (u: User) => {
    setSelected(u)
    setForm({
      email: u.email, password: '', firstName: u.firstName, lastName: u.lastName,
      role: u.role, departmentId: u.departmentId ?? '',
      isDpo: u.isDpo, accreditorExpiresAt: u.accreditorExpiresAt ? u.accreditorExpiresAt.slice(0, 10) : '',
    })
    setError('')
    setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        email: form.email, firstName: form.firstName, lastName: form.lastName,
        role: form.role, isDpo: form.isDpo,
        departmentId: form.departmentId || null,
        accreditorExpiresAt: form.accreditorExpiresAt ? new Date(form.accreditorExpiresAt).toISOString() : null,
      }
      if (modal === 'create') body.password = form.password

      const url = modal === 'create' ? '/api/admin/users' : `/api/admin/users/${selected?.id}`
      const method = modal === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error?.message ?? 'Error saving user')
        return
      }
      setModal(null)
      load()
      notify.success(modal === 'create' ? 'User created' : 'User updated', `${form.firstName} ${form.lastName}`)
    } catch {
      notify.error('Error', 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Soft-delete this user?')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    load()
    notify.warning('User removed', 'Soft-deleted successfully')
  }

  const columns: Column<User>[] = [
    {
      key: 'name', header: 'Name', sortable: true,
      cell: (r) => <span className="font-semibold text-foreground">{r.firstName} {r.lastName}</span>,
    },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role', header: 'Role', sortable: true,
      cell: (r) => (
        <Badge variant={roleBadgeVariant[r.role] ?? 'secondary'} className="capitalize text-[11px]">
          {r.role.replace(/_/, ' ')}
        </Badge>
      ),
    },
    {
      key: 'isDpo', header: 'DPO',
      cell: (r) => r.isDpo ? <Check className="w-4 h-4 text-green-400" /> : null,
    },
    {
      key: 'createdAt', header: 'Joined', sortable: true,
      cell: (r) => <span className="text-muted-foreground text-xs">{format(new Date(r.createdAt), 'MMM d, yyyy')}</span>,
    },
  ]

  return (
    <DashboardShell>
      <PageHeader
        title="Users"
        description="Manage system users across all roles — soft delete only."
        actions={
          <Button id="btn-create-user" onClick={openCreate}>
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        }
      />

      <Card className="p-0 border-0 bg-transparent">
        <DataTable
          id="users-table"
          data={users}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search by name or email…"
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
      </Card>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-foreground font-semibold text-lg">
                {modal === 'create' ? 'Add New User' : 'Edit User'}
              </h3>
              <Button id="modal-close" variant="ghost" size="icon-sm" onClick={() => setModal(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name">
                    <Input id="input-firstName" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                  </Field>
                  <Field label="Last Name">
                    <Input id="input-lastName" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Email">
                  <Input id="input-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </Field>
                {modal === 'create' && (
                  <Field label="Password">
                    <Input id="input-password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                  </Field>
                )}
                <Field label="Role">
                  <Select
                    id="input-role"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    options={ROLES.map((r) => ({ value: r, label: r.replace(/_/g, ' ') }))}
                  />
                </Field>
                {form.role === 'accreditor' && (
                  <Field label="Accreditor Expires At">
                    <Input id="input-expires" type="date" value={form.accreditorExpiresAt} onChange={(e) => setForm((f) => ({ ...f, accreditorExpiresAt: e.target.value }))} />
                  </Field>
                )}
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Checkbox id="input-isDpo" checked={form.isDpo} onCheckedChange={(checked) => setForm((f) => ({ ...f, isDpo: !!checked }))} />
                  <Label htmlFor="input-isDpo">Data Privacy Officer (DPO)</Label>
                </div>
                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-slide-up">
                    {error}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setModal(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardShell>
  )
}