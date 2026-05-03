// app/(auth)/login/page.tsx
'use client'

import Image from 'next/image'
import { ShieldCheck, Zap, Lock, Waypoints, HelpCircle } from 'lucide-react'
import { LoginFormWrapper } from './_components/login-form-wrapper'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="h-[100dvh] w-full relative overflow-hidden text-slate-50 font-sans flex flex-col">
      {/* Background Image (covers entire screen) */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/loginbg.png" 
          alt="Campus Background" 
          fill 
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay so the text remains readable */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 sm:px-12 lg:px-24 pb-20 lg:pb-0">
        
        {/* =========================================================================
            LEFT COLUMN (Desktop) / TOP STACK (Mobile) 
            ========================================================================= */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left justify-center lg:justify-between h-auto lg:h-full w-full max-w-2xl lg:py-16">
          
          {/* ---- MOBILE TOP SECTION ---- */}
          <div className="flex lg:hidden flex-col items-center w-full">
            {/* Mobile Branding */}
            <div className="flex flex-col items-center gap-4 mb-6 mt-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 bg-white flex items-center justify-center shadow-lg">
                <Image src="/ac.png" alt="School Logo" width={56} height={56} className="object-contain" priority />
              </div>
              <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">ACES Panabo</h1>
                <span className="text-[#10B981] text-xs font-bold tracking-widest uppercase mt-1">OBE SYSTEM V2.0</span>
              </div>
            </div>

            {/* Mobile-only Pills */}
            <div className="flex flex-row items-center gap-3 mb-8 w-full justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[10px] sm:text-[11px] text-slate-100 font-medium tracking-wide uppercase">Secure Access</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm whitespace-nowrap">
                <Waypoints className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[10px] sm:text-[11px] text-slate-100 font-medium tracking-wide uppercase">Curriculum Mapping</span>
              </div>
            </div>
          </div>

          {/* ---- DESKTOP BRANDING (Top Left) ---- */}
          <div className="hidden lg:block w-full">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 bg-white flex items-center justify-center shadow-lg">
                <Image src="/ac.png" alt="School Logo" width={56} height={56} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">ACES Panabo</span>
                <span className="text-[#10B981] text-xs font-semibold tracking-widest uppercase">OBE Cycle Management</span>
              </div>
            </div>
          </div>

          {/* ---- DESKTOP MAIN HEADLINE & FEATURES (Bottom Left) ---- */}
          <div className="hidden lg:flex flex-col w-full mt-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 w-fit mb-8">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[11px] text-[#10B981] font-semibold tracking-wide uppercase">System Online & Secure</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Empowering <br/>
              <span className="text-[#10B981]">Outcomes-Based</span> <br/>
              Education.
            </h1>
            <p className="text-slate-300 text-lg max-w-lg leading-relaxed mb-12">
              A unified platform for curriculum mapping, attainment tracking, real-time analytics, and institutional compliance.
            </p>

            <div className="grid grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[#10B981]">
                  <Waypoints className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold mb-1">Smart Mapping</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-[140px]">Align PLOs, CLOs and curriculums effortlessly.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[#10B981]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold mb-1">Live Analytics</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-[140px]">Track attainment and performance in real-time.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[#10B981]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold mb-1">Secure & Reliable</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-[140px]">Military-grade encryption for your peace of mind.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* =========================================================================
            RIGHT COLUMN (Desktop) / BOTTOM STACK (Mobile) 
            ========================================================================= */}
        <div className="w-full lg:w-[440px] flex-shrink-0 flex flex-col justify-center z-10 lg:z-auto">
          
          {/* Glassmorphism Floating Login Card */}
          <div className="bg-[#0f141c]/70 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 w-full max-w-[420px] mx-auto shadow-2xl">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-slate-400 text-sm">Sign in to continue to ACES OBE Portal</p>
            </div>

            <LoginFormWrapper />

            {/* Trust row inside card */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex justify-between items-center text-center px-2">
                <div className="flex flex-col items-center gap-2">
                  <Lock className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[10px] text-slate-300 font-medium">AES-256<br/>Encryption</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[10px] text-slate-300 font-medium">Faculty<br/>Verified Access</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[10px] text-slate-300 font-medium">Fast & Secure<br/>Access</span>
                </div>
              </div>
              <div className="text-center mt-6">
                <Link href="#" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group relative z-50">
                  <HelpCircle className="w-4 h-4 text-[#10B981]" />
                  Need help signing in? <span className="text-[#10B981] group-hover:text-emerald-400 transition-colors">Contact IT Support ›</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          FOOTER (Both views) 
          ========================================================================= */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 z-20 flex flex-col items-center justify-center pointer-events-none text-center bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center gap-2 text-[#10B981] mb-1">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white shadow-black drop-shadow-md">Military-Grade Encryption</span>
        </div>
        <p className="text-slate-300 text-[10px] font-semibold tracking-wider font-mono drop-shadow-md">
          &copy; 2026 ACES IT SECURITY
        </p>
      </div>

    </main>
  )
}
