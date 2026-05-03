'use client'

import { Suspense } from 'react'
import { LoginForm } from './login-form'
import { Skeleton } from '@/components/ui/skeleton'

export function LoginFormWrapper() {
  return (
    <Suspense
      fallback={
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>
          <Skeleton className="h-11 w-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}