// app/(auth)/login/page.tsx
'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { LoginFormWrapper } from './_components/login-form-wrapper'
import { ShieldCheck, Layers, BarChart } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-app-bg overflow-hidden relative">
      {/* Immersive Animated Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-noise" />
        
        {/* Animated Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand/20 blur-[120px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-500/10 blur-[100px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-teal-500/10 blur-[150px] rounded-full animate-blob animation-delay-4000 mix-blend-screen" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-grid opacity-30 mask-image:linear-gradient(to_bottom,transparent,black,transparent)" />
      </div>

      {/* Left: Branding Hero (Desktop) */}
      <motion.div 
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] } as any}
        className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16 border-r border-white/5 bg-black/40 backdrop-blur-3xl z-10"
      >
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-5 mb-auto">
            <div className="relative w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image src="/ac.png" alt="Institutional Logo" width={44} height={44} className="object-contain relative z-10 transition-transform duration-700 group-hover:scale-110" priority />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                ACES Panabo
                <span className="text-[10px] bg-brand/20 text-emerald-400 px-2.5 py-1 rounded-full font-mono uppercase tracking-widest border border-brand/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">v2.0</span>
              </h1>
              <p className="text-xs text-brand font-mono tracking-[0.2em] uppercase mt-1">OBE Cycle Management</p>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="relative z-10 max-w-xl my-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span className="text-xs font-medium text-emerald-100 tracking-wide">System Online & Secure</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl font-extrabold tracking-tighter text-white mb-6 leading-[1.05]"
            >
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-brand to-teal-400 text-glow">
                Outcomes-Based
              </span> <br />
              Education.
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg text-emerald-100/70 leading-relaxed mb-12 max-w-lg font-light"
            >
              A high-performance, institutional-grade platform engineered for seamless curriculum mapping, real-time attainment analytics, and compliance.
            </motion.p>
            
            {/* Feature Cards Showcase */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Layers, title: 'Smart Mapping', desc: 'PEO, PLO, and CLO alignment made effortless.' },
                { icon: BarChart, title: 'Live Analytics', desc: 'Real-time attainment tracking & visualization.' },
              ].map((feature, i) => (
                <div key={i} className="glass-panel p-5 rounded-2xl flex flex-col gap-3 group hover:border-brand/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{feature.title}</h3>
                    <p className="text-white/50 text-xs mt-1 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-8">
            <div className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
              &copy; {new Date().getFullYear()} ACES Polytechnic College
            </div>
            <div className="flex gap-4">
               {['CHED', 'TESDA', 'DPO'].map((badge) => (
                  <span key={badge} className="text-[10px] font-bold text-white/30 tracking-widest uppercase">
                    {badge}
                  </span>
               ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right: Login Form (Mobile & Desktop) */}
      <div className="flex-1 flex flex-col justify-center relative z-20 bg-app-bg lg:bg-transparent">
        {/* Mobile-only background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-app-bg to-app-bg lg:hidden pointer-events-none z-[-1]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px] mx-auto px-6 sm:px-8 relative"
        >
          {/* Mobile Branding & Rich Visuals */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10 pt-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
              className="relative w-20 h-20 bg-app-surface/50 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] mb-6 group"
            >
              <div className="absolute inset-0 bg-brand/20 rounded-3xl animate-pulse" />
              <Image src="/ac.png" alt="Institutional Logo" width={50} height={50} className="object-contain relative z-10" priority />
            </motion.div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 text-glow">ACES Panabo</h1>
            <p className="text-sm text-brand font-mono uppercase tracking-[0.2em] font-bold">OBE System v2.0</p>
            
            {/* Mobile Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                { icon: ShieldCheck, text: 'Secure Access' },
                { icon: Layers, text: 'Curriculum Mapping' }
              ].map((pill, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-100 text-[10px] font-medium tracking-wide">
                  <pill.icon className="w-3 h-3 text-brand" />
                  {pill.text}
                </span>
              ))}
            </div>
          </div>

          {/* Desktop Form Header */}
          <div className="hidden lg:block mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold tracking-tight text-white">Authentication</h2>
            <p className="text-sm text-white/50 mt-3 font-light">Secure access for ACES faculty and administrators.</p>
          </div>

          {/* Form Container - Glassmorphism */}
          <div className="glass-panel p-8 sm:p-10 rounded-[2rem] relative overflow-hidden group">
            {/* Animated border gradient */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            
            <LoginFormWrapper />
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand/50" />
              <p className="text-center text-white/30 text-[10px] font-mono tracking-[0.2em] uppercase">
                Military-Grade Encryption
              </p>
            </div>
            <p className="text-center text-white/20 text-[9px] font-mono tracking-widest uppercase lg:hidden">
              &copy; {new Date().getFullYear()} ACES IT Security
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}