'use client'
// app/(dashboard)/reports/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PageHeader }     from '@/components/layout/page-header'
import { FileText, Download, Plus, X, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface Report {
  id: string; reportType: string; status: string; storagePath: string | null
  createdAt: string; program: { name: string; code: string }
}
interface Program { id: string; name: string; code: string }
interface Period  { id: string; name: string }

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-slate-500/20 text-slate-300',
  processing: 'bg-primary/20 text-primary/80',
  ready:      'bg-green-500/20 text-green-300',
  failed:     'bg-red-500/20 text-red-300',
}
const REPORT_TYPES = ['ched_compliance','tesda_competency','curriculum_map','syllabus']
const inputCls = "w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [reports,  setReports]  = useState<Report[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [periods,  setPeriods]  = useState<Period[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState({ programId: '', periodId: '', reportType: 'ched_compliance' })
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [rRes, prRes, perRes] = await Promise.all([
      fetch('/api/reports').then((r) => r.json()),
      fetch('/api/programs').then((r) => r.json()),
      fetch('/api/admin/periods').then((r) => r.json()),
    ])
    setReports(rRes); setPrograms(prRes); setPeriods(perRes)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleRequest = async () => {
    setSaving(true)
    const res = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setModal(false); load() }
    setSaving(false)
  }

  const handleDownload = async (id: string) => {
    const res = await fetch(`/api/reports/${id}/download`)
    if (res.ok) {
      const { url } = await res.json()
      window.open(url, '_blank')
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Reports"
        description="Request and download accreditation and compliance reports."
        actions={
          <div className="flex gap-2">
            <button id="btn-refresh" onClick={load} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700"><RefreshCw className="w-4 h-4" /></button>
            <button id="btn-request-report" onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium">
              <Plus className="w-4 h-4" /> Request Report
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading reports…</div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.length === 0 && (
            <div className="py-20 text-center text-slate-500">No reports yet. Request your first report above.</div>
          )}
          {reports.map((r) => (
            <div key={r.id} id={`report-${r.id}`} className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{r.reportType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                <p className="text-slate-500 text-sm">{r.program.name} · {format(new Date(r.createdAt), 'MMM d, yyyy HH:mm')}</p>
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? ''}`}>{r.status}</span>
              {r.status === 'ready' && (
                <button id={`btn-download-${r.id}`} onClick={() => handleDownload(r.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="Request Report" onClose={() => setModal(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Program</label>
              <select id="input-report-program" className={inputCls} value={form.programId} onChange={(e) => setForm((f) => ({ ...f, programId: e.target.value }))}>
                <option value="">— Select Program —</option>
                {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Period</label>
              <select id="input-report-period" className={inputCls} value={form.periodId} onChange={(e) => setForm((f) => ({ ...f, periodId: e.target.value }))}>
                <option value="">— Select Period —</option>
                {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Report Type</label>
              <select id="input-report-type" className={inputCls} value={form.reportType} onChange={(e) => setForm((f) => ({ ...f, reportType: e.target.value }))}>
                {REPORT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button id="btn-cancel" onClick={() => setModal(false)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Cancel</button>
              <button id="btn-submit-report" onClick={handleRequest} disabled={saving || !form.programId || !form.periodId}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary text-white text-sm font-medium disabled:opacity-60">
                {saving ? 'Requesting…' : 'Request Report'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  )
}
