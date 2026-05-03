// app/dashboard/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {/* Greeting Skeleton */}
      <div className="relative">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-app-border rounded-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 bg-app-surface" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-48 bg-app-surface" />
            <Skeleton className="h-5 w-20 bg-app-surface rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-app-surface border border-app-border rounded-[24px] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="w-12 h-12 rounded-2xl bg-app-bg" />
              <Skeleton className="w-20 h-6 rounded-full bg-app-bg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-24 bg-app-bg" />
              <Skeleton className="h-4 w-32 bg-app-bg" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-6">
          <Skeleton className="h-8 w-48 bg-app-surface" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-app-surface border border-app-border rounded-[24px] p-5 flex items-center gap-5">
                <Skeleton className="w-14 h-14 rounded-2xl bg-app-bg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2 bg-app-bg" />
                  <Skeleton className="h-3 w-3/4 bg-app-bg" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 bg-app-surface" />
          <div className="bg-app-surface border border-app-border rounded-[24px] p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full bg-app-bg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2 bg-app-bg" />
                  <Skeleton className="h-3 w-1/4 bg-app-bg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
