'use client'
// app/(dashboard)/privacy/page.tsx — RA 10173 Privacy Dashboard (DPO only)
import { useState, useEffect } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { Shield, Download } from 'lucide-react'

interface User { id: string; email: string; firstName: string; lastName: string; role: string }

export default function PrivacyPage() {
  const [users,       setUsers]       = useState<User[]>([])
  const [loading,     setLoading]     = useState(true)
  const [exporting,   setExporting]   = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/admin/users').then((r) => r.json()).then(setUsers).finally(() => setLoading(false))
  }, [])

  const handleExport = async (userId: string) => {
    setExporting(userId)
    const res = await fetch(`/api/privacy/export/${userId}`)
    if (res.ok) {
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `student-data-${userId.slice(0,8)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    setExporting(null)
  }

  const filtered = users.filter((u) =>
    u.role === 'student' &&
    (`${u.firstName} ${u.lastName} ${u.email}`).toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardShell>
      <PageHeader
        title="RA 10173 Privacy Dashboard"
        description="Data Privacy Officer controls — student data export and consent management."
      />

      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-3 text-primary/80 text-sm">
        <Shield className="w-5 h-5 flex-shrink-0" />
        <span>This page is restricted to Data Privacy Officers (DPO). All exports are logged for compliance purposes.</span>
      </div>

      <div>
        <input
          id="privacy-search"
          type="text"
          placeholder="Search student by name or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-card border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading…</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-card/80 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">RA 10173 Export</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/60 hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-medium text-white">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      id={`btn-export-${u.id}`}
                      onClick={() => handleExport(u.id)}
                      disabled={exporting === u.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-xs transition-colors disabled:opacity-60 ml-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {exporting === u.id ? 'Exporting…' : 'Export JSON'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="py-10 text-center text-slate-500">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}
