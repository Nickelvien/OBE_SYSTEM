// app/(auth)/login/_components/login-form.tsx
'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.'),
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
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-6" 
      noValidate
    >
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[14px] font-medium text-[#F8FAFC]">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@panabo.aces.edu.ph"
            className="pl-11 h-[52px] bg-[#141416] border-[#27272A] text-[#F8FAFC] placeholder:text-[#3F3F46] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all rounded-[12px]"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-[14px] font-medium text-[#F8FAFC]">Password</Label>
          <a href="#" className="text-[11px] text-[#10B981] hover:text-[#34D399] transition-colors tracking-widest font-semibold uppercase">
            Forgot?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-11 pr-11 h-[52px] bg-[#141416] border-[#27272A] text-[#F8FAFC] placeholder:text-[#3F3F46] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all rounded-[12px] font-medium tracking-widest"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-1 pr-3 flex items-center text-[#64748B] hover:text-[#94A3B8] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <Button
          id="login-submit-btn"
          type="submit"
          disabled={isPending}
          className="w-full h-[52px] rounded-[14px] bg-[#10B981] text-[#020617] hover:bg-[#059669] font-bold text-[15px] tracking-wide transition-colors border-0"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Authenticating...
            </span>
          ) : (
            'Secure Sign In'
          )}
        </Button>
      </div>
    </form>
  )
}
