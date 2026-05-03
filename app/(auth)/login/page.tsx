// app/(auth)/login/page.tsx
import type { Metadata } from 'next'
import { LoginFormWrapper } from './_components/login-form-wrapper'

export const metadata: Metadata = {
  title: 'Sign In — OBE Cycle Management System | ACES Panabo',
  description: 'Sign in to the OBE Cycle Management System for ACES Polytechnic College, Panabo Campus.',
}

function FloatingOrb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`absolute rounded-full opacity-20 blur-3xl animate-float ${className ?? ''}`}
      style={{
        background: 'radial-gradient(circle, rgba(182,241,99,0.4) 0%, transparent 70%)',
        ...style,
      }}
    />
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-background overflow-hidden">
      {/* Left: Branding Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid opacity-[0.08]" />
        <FloatingOrb className="w-[600px] h-[600px] -top-40 -left-40" style={{ animationDelay: '0s' }} />
        <FloatingOrb className="w-[400px] h-[400px] bottom-20 left-60" style={{ animationDelay: '2s' }} />
        <FloatingOrb className="w-[300px] h-[300px] top-1/3 right-10" style={{ animationDelay: '4s' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          {/* Top branding */}
          <div>
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-2xl shadow-primary/30">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-primary-foreground">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight leading-none">OBE System</h1>
                <p className="text-sm text-primary/80 mt-0.5">v2.0 · Panabo Campus</p>
              </div>
            </div>

            <div className="max-w-md">
              <h2 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
                Outcomes-Based
                <br />
                <span className="gradient-text">Education</span> Management
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Automate your full OBE cycle — from PEO/PLO/CLO mapping to attainment computation, CQI action plans, and accreditation-ready reports. Built for CHED & TESDA compliance.
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'CHED CMO Compliant', icon: 'A' },
              { label: 'TESDA TR Ready', icon: 'T' },
              { label: 'RA 10173 Privacy', icon: 'P' },
              { label: 'Real-time Attainment', icon: 'R' },
            ].map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm text-slate-300 backdrop-blur-sm"
              >
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>

          {/* Bottom text */}
          <p className="text-xs text-slate-600">
            ACES Polytechnic College · Panabo Campus · Davao Region XI, Philippines
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Subtle grid for the form side too */}
        <div className="absolute inset-0 bg-grid opacity-[0.04]" />

        <div className="relative z-10 w-full max-w-md px-8 py-12">
          {/* Mobile branding (shown only on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 mb-4 shadow-2xl shadow-primary/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-primary-foreground">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">OBE Cycle Management</h1>
            <p className="text-primary/70 text-sm mt-1">ACES Polytechnic College · Panabo</p>
          </div>

          {/* Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl -m-[1px]" />
            <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white">Welcome back</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Sign in with your institutional email address.
                </p>
              </div>
              <LoginFormWrapper />
            </div>
          </div>

          <p className="text-center text-muted-foreground/40 text-xs mt-8">
            Secured with Auth.js v5 · SameSite Strict · JWT
          </p>
        </div>
      </div>
    </main>
  )
}