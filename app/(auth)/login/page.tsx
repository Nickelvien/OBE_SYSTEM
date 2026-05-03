// app/(auth)/login/page.tsx
'use client'

import Image from 'next/image'
import { Headphones, Shield, ShieldCheck, Zap, Lock, ArrowRight, Waypoints } from 'lucide-react'
import { LoginFormWrapper } from './_components/login-form-wrapper'

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex bg-[#020617] text-slate-50 font-sans overflow-hidden">
      {/* LEFT SIDE (55%) */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-12 lg:p-16 xl:p-24 z-10 group overflow-hidden border-r border-[rgba(255,255,255,0.05)]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/loginbg.png" 
            alt="Campus Background" 
            fill 
            className="object-cover object-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-[20s] group-hover:scale-100"
            priority
          />
          <div className="absolute inset-0 bg-[#020617]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 via-[#020617]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50" />
          {/* Soft green ambient lighting */}
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#10B981]/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        </div>

        {/* Top left branding */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-[0_0_20px_rgba(16,185,129,0.15)] flex-shrink-0 bg-black">
            <Image src="/ac.png" alt="School Logo" width={48} height={48} className="object-contain w-full h-full p-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-tight">ACES Panabo</span>
            <span className="text-[#94A3B8] text-xs font-medium tracking-[0.15em] uppercase">OBE Cycle Management</span>
          </div>
        </div>

        {/* Main hero content */}
        <div className="relative z-10 max-w-2xl mt-auto pb-20 pt-20">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] mb-10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
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

          <p className="text-[#94A3B8] text-lg lg:text-xl font-light leading-relaxed max-w-xl mb-16">
            A unified platform for curriculum mapping, attainment tracking, real-time analytics, and institutional compliance.
          </p>

          {/* Bottom feature row */}
          <div className="grid grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.05)] backdrop-blur-sm">
                <Waypoints className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold mb-1.5">Smart Mapping</h3>
                <p className="text-[#94A3B8] text-xs leading-relaxed">Align PLOs, CLOs and curriculums effortlessly.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.05)] backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold mb-1.5">Live Analytics</h3>
                <p className="text-[#94A3B8] text-xs leading-relaxed">Track attainment and performance in real-time.</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.05)] backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold mb-1.5">Secure & Reliable</h3>
                <p className="text-[#94A3B8] text-xs leading-relaxed">Military-grade encryption for your peace of mind.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom left footer */}
        <div className="relative z-10 border-t border-[rgba(255,255,255,0.05)] pt-6">
          <p className="text-[#94A3B8] text-xs font-medium">&copy; 2024 ACES Panabo. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT SIDE (45%) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center relative z-20 px-6 sm:px-12 py-12">
        {/* Mobile Background */}
        <div className="absolute inset-0 z-0 lg:hidden">
           <Image src="/loginbg.png" alt="Campus" fill className="object-cover opacity-20" priority />
           <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" />
        </div>

        {/* Mobile Branding */}
        <div className="lg:hidden flex flex-col items-center gap-4 mb-10 relative z-10">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-black p-1">
            <Image src="/ac.png" alt="School Logo" width={64} height={64} className="object-contain w-full h-full" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">ACES Panabo</h1>
            <p className="text-[#10B981] text-xs font-medium tracking-widest uppercase">OBE Portal</p>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[420px]">
          {/* Card */}
          <div className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-[28px] p-8 sm:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            {/* Top icon */}
            <div className="w-12 h-12 rounded-full border border-[#10B981]/20 bg-[#10B981]/10 flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(16,185,129,0.15)] mx-auto relative">
              <div className="absolute inset-0 rounded-full bg-[#10B981]/20 blur-md animate-pulse" />
              <Lock className="w-5 h-5 text-[#10B981] relative z-10" />
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="text-[28px] font-bold text-[#F8FAFC] mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-[#94A3B8] text-sm">Sign in to continue to ACES OBE Portal</p>
            </div>

            {/* Login Form component handles the fields and submit button */}
            <LoginFormWrapper />

            {/* Content Divider */}
            <div className="relative mt-8 mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(255,255,255,0.08)]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#020617] lg:bg-transparent px-2 text-[#94A3B8] lg:bg-[#020617]">Secured and trusted by ACES</span>
              </div>
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <span className="text-[10px] text-[#94A3B8] font-medium leading-tight">AES-256<br/>Encryption</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  <Shield className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <span className="text-[10px] text-[#94A3B8] font-medium leading-tight">Faculty<br/>Verified</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  <Zap className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <span className="text-[10px] text-[#94A3B8] font-medium leading-tight">Fast &<br/>Secure</span>
              </div>
            </div>
          </div>

          {/* Bottom support card */}
          <div className="mt-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
                <Headphones className="w-4 h-4 text-[#10B981] group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-0.5">Need help signing in?</span>
                <span className="text-sm font-medium text-[#F8FAFC]">Contact IT Support</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-colors">
              <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
