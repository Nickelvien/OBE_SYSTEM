// components/ui/skeleton.tsx
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-shimmer rounded-lg bg-white/[0.03]', className)}
      {...props}
    />
  )
}

export { Skeleton }