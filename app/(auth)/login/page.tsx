// app/(auth)/login/page.tsx
'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { LoginFormWrapper } from './_components/login-form-wrapper'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-app-bg overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full animate-pulse-glow" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Left: Branding Hero */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 border-r border-app-border bg-app-surface/30 backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 bg-app-bg border border-brand/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)] group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image src="/ac.png" alt="Institutional Logo" width={38} height={38} className="object-contain relative z-10 transition-transform duration-500 group-hover:scale-110" priority />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-app-text flex items-center gap-2">
                ACES Panabo
                <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-mono uppercase tracking-tighter border border-brand/20">v2.0</span>
              </h1>
              <p className="text-xs text-brand font-mono tracking-widest uppercase">OBE Cycle Management</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl font-bold tracking-tight text-app-text mb-6 leading-[1.1]"
          >
            Empowering <span className="text-brand text-glow">Outcomes-Based</span> Education.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-app-muted leading-relaxed mb-10 max-w-md"
          >
            A high-performance platform for PEO/PLO/CLO mapping, attainment tracking, and institutional compliance.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap gap-3"
          >
            {['CHED CMO Compliant', 'TESDA TR Ready', 'Institutional Data Security'].map((f) => (
              <span key={f} className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand/5 text-brand text-[11px] font-bold border border-brand/20 tracking-wide uppercase">
                {f}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 text-[10px] text-app-muted/50 font-mono tracking-tighter uppercase">
          &copy; {new Date().getFullYear()} ACES Polytechnic College · Internal Systems v2.0
        </div>
      </motion.div>

      {/* Right: Login Form */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="w-full max-w-[420px] mx-auto px-8"
        >
          {/* Mobile Branding */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <div className="relative w-16 h-16 bg-app-surface border border-brand/30 rounded-2xl flex items-center justify-center shadow-xl mb-4">
              <Image src="/ac.png" alt="Institutional Logo" width={42} height={42} className="object-contain" priority />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-app-text">Sign In</h1>
            <p className="text-sm text-brand font-mono mt-1 uppercase tracking-wider">OBE System</p>
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-app-text">Authentication</h2>
            <p className="text-sm text-app-muted mt-2">Enter your institutional credentials to proceed.</p>
          </div>

          <div className="bg-app-surface p-8 rounded-3xl border border-app-border shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
            <LoginFormWrapper />
          </div>

          <p className="text-center text-app-muted/30 text-[10px] mt-10 font-mono tracking-widest uppercase">
            Military-Grade Encryption · Auth.js v5 · ACES IT Security
          </p>
        </motion.div>
      </div>
    </main>
  )
}