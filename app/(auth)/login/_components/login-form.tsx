'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } as any }
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-z]/, 'Must contain a lowercase letter.')
    .regex(/[A-Z]/, 'Must contain an uppercase letter.')
    .regex(/\d/, 'Must contain a number.')
    .regex(/[\W_]/, 'Must contain a special character.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = (values: LoginFormValues) => {
    setError(null)
    startTransition(async () => {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
        return
      }

      router.push(callbackUrl)
      router.refresh()
    })
  }

  return (
    <motion.form 
      variants={container}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-5" 
      noValidate
    >
      {/* Email */}
      <motion.div variants={item} className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-white">Email address</Label>
        <div className="relative group">
          <div className="absolute inset-0 bg-brand/20 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand transition-colors z-10" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@panabo.aces.edu.ph"
            className="pl-10 h-12 bg-[#020617]/50 border-[rgba(255,255,255,0.08)] text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all relative z-10 rounded-xl"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </motion.div>

      {/* Password */}
      <motion.div variants={item} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium text-white">Password</Label>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-brand/20 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand transition-colors z-10" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10 pr-10 h-12 bg-[#020617]/50 border-[rgba(255,255,255,0.08)] text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all relative z-10 rounded-xl"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors z-10"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </motion.div>

      {/* Remember me & Forgot Password */}
      <motion.div variants={item} className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative w-4 h-4 rounded bg-white/5 border border-white/20 group-hover:border-[#10B981]/50 transition-colors flex items-center justify-center">
            <input type="checkbox" className="peer absolute opacity-0 w-0 h-0" defaultChecked />
            <svg className="w-3 h-3 text-[#10B981] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs text-[#94A3B8] font-medium">Remember me</span>
        </label>
        <a href="#" className="text-xs font-semibold text-[#10B981] hover:text-emerald-400 transition-colors">
          Forgot password?
        </a>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}

      {/* Submit */}
      <motion.div variants={item} className="pt-2">
        <Button
          id="login-submit-btn"
          type="submit"
          disabled={isPending}
          className="w-full h-[52px] rounded-xl bg-gradient-to-r from-emerald-500 to-[#10B981] text-white hover:from-emerald-400 hover:to-emerald-500 font-bold tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 relative overflow-hidden group border-0"
          size="lg"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating…</span>
              </>
            ) : (
              <>
                <span>Sign In Securely</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </span>
        </Button>
      </motion.div>
    </motion.form>
  )
}