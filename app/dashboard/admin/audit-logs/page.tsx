'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Search, RefreshCw } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/data-table'
import { PageHeader } from '@/components/layout/page-header'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface AuditLog {
  id: string; userId: string; action: string; tableName: string
  recordId: string | null; ipAddress: string | null; createdAt: string
}

const actionBadgeVariant: Record<string, 'success' | 'default' | 'destructive'> = {
  CREATE: 'success',
  UPDATE: 'default',
  DELETE: 'destructive',
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [table, setTable] = useState('')
  const [action, setAction] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (table) params.set('table', table)
    if (action) params.set('action', action)
    const res = await fetch(`/api/admin/audit-logs?${params.toString()}`)
    if (res.ok) setLogs(await res.json())
    setLoading(false)
  }, [table, action])

  useEffect(() => { load() }, [load])

  const columns: Column<AuditLog>[] = [
    {
      key: 'action', header: 'Action', sortable: true, width: 'w-28',
      cell: (r) => <Badge variant={actionBadgeVariant[r.action] ?? 'secondary'} className="text-[10px] font-semibold">{r.action}</Badge>,
    },
    { key: 'tableName', header: 'Table', sortable: true, width: 'w-40', cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.tableName}</span> },
    { key: 'recordId', header: 'Record ID', sortable: true, cell: (r) => <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[120px] block">{r.recordId ?? '—'}</span> },
    { key: 'ipAddress', header: 'IP', cell: (r) => <span className="text-muted-foreground text-xs">{r.ipAddress ?? '—'}</span> },
    {
      key: 'createdAt', header: 'Timestamp', sortable: true,
      cell: (r) => <span className="text-muted-foreground text-xs whitespace-nowrap">{format(new Date(r.createdAt), 'MMM d, yyyy · HH:mm:ss')}</span>,
    },
  ]

  return (
    <DashboardShell>
      <PageHeader
        title="Audit Logs"
        description="Immutable audit trail for all system mutations."
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Filter by table…"
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="All actions"
          options={[
            { value: '', label: 'All actions' },
            { value: 'CREATE', label: 'CREATE' },
            { value: 'UPDATE', label: 'UPDATE' },
            { value: 'DELETE', label: 'DELETE' },
          ]}
          className="w-40"
        />
        <Button variant="outline" size="icon" onClick={load} title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <DataTable
        id="audit-logs-table"
        data={logs}
        columns={columns}
        searchable={false}
        loading={loading}
        emptyMessage="No audit logs found."
        pageSize={20}
      />
    </DashboardShell>
  )
}