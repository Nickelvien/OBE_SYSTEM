// app/(auth)/expired/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Access Expired — OBE System | ACES Panabo',
}

export default function ExpiredPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900">
      <div className="text-center px-6 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-600/20 border border-red-500/30 mb-6">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Accreditor Access Expired</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Your accreditor access credentials have expired. Please contact the campus administrator
          to renew your access credentials before logging in again.
        </p>
        <Link
          id="btn-back-login"
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition-colors"
        >
          Return to Login
        </Link>
        <p className="text-slate-600 text-xs mt-8">
          ACES Polytechnic College · OBE System · Panabo Campus
        </p>
      </div>
    </main>
  )
}
