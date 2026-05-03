// app/(auth)/login/page.tsx
'use client'

import Image from 'next/image'
import { Shield, ShieldCheck, Zap, Lock, Waypoints, HelpCircle } from 'lucide-react'
import { LoginFormWrapper } from './_components/login-form-wrapper'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="h-screen w-full relative overflow-hidden text-slate-50 font-sans">
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

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 lg:p-24">
        
        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-between h-full w-full max-w-2xl text-left">
          
          {/* Top Left Branding */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 bg-white flex items-center justify-center shadow-lg">
              <Image src="/ac.png" alt="School Logo" width={56} height={56} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-white leading-tight">ACES Panabo</span>
              <span className="text-[#10B981] text-xs font-semibold tracking-widest uppercase">OBE Cycle Management</span>
            </div>
          </div>

          {/* Main Headline */}
          <div>
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
              <span className="text-[11px] font-semibold text-white tracking-widest uppercase">System Online & Secure</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Empowering <br />
              <span className="text-[#10B981]">Outcomes-Based</span> <br />
              Education.
            </h1>

            <p className="text-slate-300 text-lg max-w-lg leading-relaxed mb-16">
              A unified platform for curriculum mapping, attainment tracking, real-time analytics, and institutional compliance.
            </p>

            {/* Bottom feature row */}
            <div className="grid grid-cols-3 gap-8 pb-4">
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
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
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
          
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            &copy; {new Date().getFullYear()} ACES Panabo. All rights reserved.
          </div>
        </div>

        {/* RIGHT SIDE (Login Form Wrapper) */}
        <div className="w-full lg:w-[440px] flex-shrink-0 flex flex-col justify-center items-center lg:items-stretch h-full lg:h-auto">
          
          {/* Mobile Branding (Hidden on desktop) */}
          <div className="lg:hidden flex flex-col items-center gap-5 mb-8 relative z-10 w-full pt-10">
            <div className="w-[84px] h-[84px] rounded-3xl overflow-hidden border border-white/20 bg-white p-2 flex items-center justify-center shadow-2xl">
              <Image src="/ac.png" alt="School Logo" width={70} height={70} className="object-contain" priority />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1.5">ACES Panabo</h1>
              <p className="text-[#10B981] text-xs font-bold tracking-widest uppercase">OBE Cycle Management</p>
            </div>
          </div>

          {/* Floating Login Card */}
          <div className="bg-[#0f141c] rounded-2xl border border-white/10 p-8 w-full shadow-2xl relative z-10">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full border border-white/10 bg-transparent flex items-center justify-center mx-auto mb-6">
                <Lock className="w-7 h-7 text-[#10B981]" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-slate-400 text-sm">Sign in to continue to ACES OBE Portal</p>
            </div>

            <LoginFormWrapper />

            {/* Desktop Trust row (inside or below card) */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="hidden lg:flex justify-between items-center text-center">
                <div className="flex flex-col items-center gap-2 opacity-60">
                  <Lock className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[10px] text-white">AES-256<br/>Encryption</span>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-60">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[10px] text-white">Faculty<br/>Verified Access</span>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-60">
                  <Zap className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[10px] text-white">Fast & Secure<br/>Access</span>
                </div>
              </div>
              <div className="text-center mt-6 hidden lg:block">
                <Link href="#" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group">
                  <HelpCircle className="w-4 h-4 text-[#10B981]" />
                  Need help signing in? <span className="text-[#10B981] group-hover:text-emerald-400 transition-colors">Contact IT Support ›</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
