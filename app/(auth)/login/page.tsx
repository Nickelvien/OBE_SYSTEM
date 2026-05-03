// app/(auth)/login/page.tsx
'use client'

import Image from 'next/image'
import { Shield, ShieldCheck, Zap, Lock, Waypoints } from 'lucide-react'
import { LoginFormWrapper } from './_components/login-form-wrapper'

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex bg-[#020617] text-slate-50 font-sans overflow-hidden">
      {/* Background Image (Desktop) */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <Image 
          src="/loginbg.png" 
          alt="Campus Background" 
          fill 
          className="object-cover object-center opacity-70"
          priority
        />
        {/* Dark overlay but lighter than before to see the school */}
        <div className="absolute inset-0 bg-[#020617]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 w-[45%] right-0 ml-auto" />
      </div>

      {/* LEFT SIDE (55%) */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-12 lg:p-16 xl:p-24 z-10 border-r border-[rgba(255,255,255,0.1)] bg-[#020617]/30 backdrop-blur-md">
        {/* Top left branding */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-[0_0_20px_rgba(16,185,129,0.15)] flex-shrink-0 bg-[#0a0a0a]">
            <Image src="/ac.png" alt="School Logo" width={48} height={48} className="object-contain w-full h-full p-1.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-tight">ACES Panabo</span>
            <span className="text-[#10B981] text-xs font-semibold tracking-[0.15em] uppercase">OBE SYSTEM V2.0</span>
          </div>
        </div>

        {/* Main hero content */}
        <div className="relative z-10 max-w-2xl mt-auto pb-20 pt-20">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] mb-10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
            <span className="text-[11px] font-semibold text-white tracking-widest uppercase">System Online & Secure</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tighter text-[#F8FAFC] mb-8 leading-[1.05]">
            Empowering <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#10B981] to-teal-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              Outcomes-Based
            </span> <br />
            Education.
          </h1>

          <p className="text-[#E2E8F0] text-lg lg:text-xl font-light leading-relaxed max-w-xl mb-16 drop-shadow-md">
            A unified platform for curriculum mapping, attainment tracking, real-time analytics, and institutional compliance.
          </p>

          {/* Bottom feature row */}
          <div className="grid grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#020617]/50 flex items-center justify-center text-[#10B981] backdrop-blur-sm">
                <Waypoints className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold mb-1.5">Smart Mapping</h3>
                <p className="text-[#CBD5E1] text-xs leading-relaxed">Align PLOs, CLOs and curriculums effortlessly.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#020617]/50 flex items-center justify-center text-[#10B981] backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold mb-1.5">Live Analytics</h3>
                <p className="text-[#CBD5E1] text-xs leading-relaxed">Track attainment and performance in real-time.</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#020617]/50 flex items-center justify-center text-[#10B981] backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold mb-1.5">Secure & Reliable</h3>
                <p className="text-[#CBD5E1] text-xs leading-relaxed">Military-grade encryption for your peace of mind.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom left footer */}
        <div className="relative z-10 border-t border-[rgba(255,255,255,0.05)] pt-6">
          <p className="text-[#94A3B8] text-xs font-medium">&copy; {new Date().getFullYear()} ACES Panabo. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT SIDE (45%) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center relative z-20 px-6 sm:px-12 py-12 lg:bg-[#020617]/95 bg-[#050505]">

        {/* Mobile Branding */}
        <div className="lg:hidden flex flex-col items-center gap-5 mb-8 relative z-10 w-full">
          <div className="w-[84px] h-[84px] rounded-3xl overflow-hidden border border-[rgba(255,255,255,0.06)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[#0A0A0A] p-2 flex items-center justify-center">
            <Image src="/ac.png" alt="School Logo" width={70} height={70} className="object-contain" priority />
          </div>
          <div className="text-center">
            <h1 className="text-[32px] font-bold tracking-tight text-[#F8FAFC] mb-1.5 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">ACES Panabo</h1>
            <p className="text-[#10B981] text-[13px] font-bold tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">OBE SYSTEM V2.0</p>
          </div>

          {/* Mobile Pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[11px] text-[#E2E8F0] font-medium">Secure Access</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]">
              <Waypoints className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[11px] text-[#E2E8F0] font-medium">Curriculum Mapping</span>
            </div>
          </div>
        </div>

        {/* Desktop Heading (Hidden on mobile) */}
        <div className="hidden lg:block text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] mx-auto relative p-2">
            <Image src="/ac.png" alt="School Logo" width={48} height={48} className="object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-[#94A3B8] text-sm">Sign in to continue to ACES OBE Portal</p>
        </div>

        {/* Form Card */}
        <div className="relative z-10 w-full max-w-[420px]">
          <div className="w-full bg-[#09090B] lg:border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 lg:p-8 lg:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <LoginFormWrapper />
          </div>

          {/* Mobile Footer */}
          <div className="mt-12 lg:hidden flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-[#10B981]/50">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Military-Grade Encryption</span>
            </div>
            <p className="text-[#94A3B8]/40 text-[9px] font-mono tracking-widest uppercase">
              &copy; 2026 ACES IT SECURITY
            </p>
          </div>

          {/* Desktop Trust row */}
          <div className="hidden lg:grid grid-cols-3 gap-2 mt-8">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/5">
                <Lock className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
              <span className="text-[10px] text-[#546e8c] font-medium leading-tight">AES-256<br/>Encryption</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/5">
                <Shield className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
              <span className="text-[10px] text-[#546e8c] font-medium leading-tight">Faculty<br/>Verified</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/5">
                <Zap className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
              <span className="text-[10px] text-[#546e8c] font-medium leading-tight">Fast &<br/>Secure</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
