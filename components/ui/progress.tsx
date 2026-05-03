// components/ui/progress.tsx
'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { variant?: 'default' | 'success' | 'warning' | 'destructive' }
>(({ className, value, variant = 'default', ...props }, ref) => {
  const barColor = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    destructive: 'bg-red-500',
  }
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white/[0.04]', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn('h-full w-full flex-1 transition-all duration-500 ease-out', barColor[variant])}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }