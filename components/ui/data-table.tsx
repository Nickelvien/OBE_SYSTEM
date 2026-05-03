'use client'

import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, ListFilter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export interface Column<T> {
  key: string
  header: string
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  id?: string
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  emptyMessage?: string
  actions?: (row: T) => React.ReactNode
  loading?: boolean
  loadingRows?: number
}

export function DataTable<T>({
  id,
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search…',
  pageSize = 15,
  emptyMessage = 'No records found.',
  actions,
  loading = false,
  loadingRows = 5,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  const filtered = query
    ? data.filter((row) =>
        Object.values(row as Record<string, unknown>).some((v) =>
          String(v).toLowerCase().includes(query.toLowerCase())
        )
      )
    : data

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortKey] ?? '')
        const bv = String((b as Record<string, unknown>)[sortKey] ?? '')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    : filtered

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  return (
    <div id={id} className="flex flex-col gap-4">
      {/* Search bar */}
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            id={id ? `${id}-search` : 'data-table-search'}
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-white/[0.015]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3.5 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-[0.08em] select-none',
                      col.sortable && 'cursor-pointer hover:text-foreground transition-colors',
                      col.width
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && (
                        <span className="flex flex-col -space-y-0.5">
                          <ChevronUp
                            className={cn(
                              'w-3 h-3',
                              sortKey === col.key && sortDir === 'asc' ? 'text-primary' : 'text-muted-foreground/30'
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              'w-3 h-3',
                              sortKey === col.key && sortDir === 'desc' ? 'text-primary' : 'text-muted-foreground/30'
                            )}
                          />
                        </span>
                      )}
                    </span>
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3.5 text-right text-[11px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: loadingRows }, (_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-[90%]" />
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </td>
                    )}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-16 text-center"
                  >
                    <ListFilter className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/30 last:border-0 hover:bg-white/[0.025] transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-foreground/80">
                        {col.cell ? col.cell(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right">{actions(row)}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-white/[0.01] text-sm text-muted-foreground">
            <span className="text-xs">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
            </span>
            <div className="flex items-center gap-0.5">
              <Button
                id={id ? `${id}-prev` : 'data-table-prev'}
                variant="ghost"
                size="icon-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors',
                      p === page
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-white/[0.04] text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              <Button
                id={id ? `${id}-next` : 'data-table-next'}
                variant="ghost"
                size="icon-sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}