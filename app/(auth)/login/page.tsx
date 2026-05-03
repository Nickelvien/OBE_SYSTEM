// app/(auth)/login/page.tsx
'use client'

import Image from 'next/image'
import { ShieldCheck, Zap, Lock, Waypoints } from 'lucide-react'
import { LoginFormWrapper } from './_components/login-form-wrapper'

export default function LoginPage() {
  return (
    <main className="h-[100dvh] w-full relative overflow-hidden text-slate-50 font-sans flex flex-col items-center justify-center">
      {/* Background Image (covers entire screen) */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/new.png" 
          alt="Campus Background" 
          fill 
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Main Container - Adjusted to center mobile purely, and use grid/flex structure for desktop */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 sm:px-12 lg:px-16 2xl:px-24 gap-8 lg:gap-0 pb-16 lg:pb-0 pt-6 lg:pt-0">
        
        {/* =========================================================================
            LEFT COLUMN (Desktop) / TOP STACK (Mobile) 
            ========================================================================= */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left justify-center lg:justify-center h-auto lg:h-[80%] w-full max-w-2xl lg:py-4 lg:pr-8 lg:-ml-8 xl:-ml-4">
          
          {/* ---- MOBILE TOP SECTION ---- */}
          <div className="flex lg:hidden flex-col items-center w-full gap-3">
            <div className="flex flex-col items-center gap-2 mb-1">
              <div className="w-[72px] h-[72px] rounded-full overflow-hidden border border-white/20 bg-white flex items-center justify-center shadow-2xl">
                <Image src="/ac.png" alt="School Logo" width={60} height={60} className="object-contain" priority />
              </div>
              <div className="flex flex-col items-center text-center mt-1">
                <h1 className="text-3xl font-bold tracking-tight text-white leading-tight drop-shadow-lg">ACES Panabo</h1>
                <span className="text-[#10B981] text-[10px] font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-md">OBE SYSTEM V2.0</span>
              </div>
            </div>

            {/* Mobile-only Pills */}
            <div className="flex flex-row items-center gap-3 mb-2 w-full justify-center">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-black/20 backdrop-blur-md shadow-sm whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={2.5} />
                <span className="text-[10px] text-slate-100 font-semibold tracking-wide uppercase">Secure Access</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-black/20 backdrop-blur-md shadow-sm whitespace-nowrap">
                <Waypoints className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={2.5} />
                <span className="text-[10px] text-slate-100 font-semibold tracking-wide uppercase">Curriculum Mapping</span>
              </div>
            </div>
          </div>

          {/* ---- DESKTOP BRANDING (Top Left) ---- */}
          <div className="hidden lg:block w-full mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-white/20 bg-white flex items-center justify-center shadow-lg">
                <Image src="/ac.png" alt="School Logo" width={64} height={64} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">ACES Panabo</span>
                <span className="text-[#10B981] text-sm font-semibold tracking-widest uppercase mb-2">OBE Cycle Management</span>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 w-fit">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[10px] text-[#10B981] font-semibold tracking-wide uppercase">System Online & Secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- DESKTOP MAIN HEADLINE & FEATURES (Bottom Left) ---- */}
          <div className="hidden lg:flex flex-col w-full mt-4 mb-auto">

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Empowering <br/>
              <span className="text-[#10B981]">Outcomes-Based</span> <br/>
              Education.
            </h1>
            <p className="text-slate-300 text-lg max-w-lg leading-relaxed mb-4">
              A unified platform for curriculum mapping, attainment tracking, real-time analytics, and institutional compliance.
            </p>
          </div>
          
        </div>

        {/* =========================================================================
            RIGHT COLUMN (Desktop) / BOTTOM STACK (Mobile) 
            ========================================================================= */}
        <div className="w-full lg:w-[440px] flex-shrink-0 flex flex-col justify-center z-10 lg:z-auto">
          
          {/* Glassmorphism Floating Login Card */}
          <div className="bg-[#0a0d14]/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 sm:p-8 w-full max-w-[420px] mx-auto shadow-2xl">
            
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-slate-400 text-sm">Sign in to continue to ACES OBE Portal</p>
            </div>

            <LoginFormWrapper />

            {/* Trust row inside card */}
            <div className="mt-6 lg:mt-8 pt-6 border-t border-white/10">
              <div className="flex justify-between items-start text-center px-1 mb-4">
                <div className="flex flex-col items-center gap-1.5 w-1/3">
                  <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[9px] sm:text-[10px] text-slate-300 font-medium">AES-256<br/>Encryption</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-1/3">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[9px] sm:text-[10px] text-slate-300 font-medium">Faculty<br/>Verified Access</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-1/3">
                  <Zap className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[9px] sm:text-[10px] text-slate-300 font-medium">Fast & Secure<br/>Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          GLOBAL FOOTER (Fixed at absolute bottom center)
          ========================================================================= */}
      <div className="absolute bottom-6 md:bottom-8 left-0 w-full text-center z-20 pointer-events-none">
        <div className="flex flex-col items-center justify-center gap-1.5 md:gap-2">
          <div className="flex items-center justify-center gap-1.5 text-[#10B981]">
            <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white leading-tight drop-shadow-md">
              Military-Grade Encryption
            </span>
          </div>
          <p className="text-slate-400 text-[9px] md:text-[10px] font-medium tracking-widest drop-shadow-md">
            &copy; 2026 ACES IT SECURITY
          </p>
        </div>
      </div>

    </main>
  )
}
