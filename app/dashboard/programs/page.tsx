'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, GraduationCap, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface Program {
  id: string; name: string; code: string; mode: string
  department?: { name: string } | null
  gradingSystem?: { name: string; passingThreshold: number }
  _count?: { plos: number; courses: number }
}

function ProgramCardSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-14 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center gap-4 pt-1 border-t border-border">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </Card>
  )
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/programs')
      .then((r) => r.json())
      .then(setPrograms)
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardShell>
      <PageHeader title="Programs" description="Select a program to manage its OBE cycle and curriculum." />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProgramCardSkeleton key={i} />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <Card className="py-16 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No programs found.</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Add one in Admin → Programs Config.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {programs.map((p) => (
            <Link
              key={p.id}
              id={`program-card-${p.id}`}
              href={`/dashboard/programs/${p.id}`}
              className="group block"
            >
              <Card className={cn(
                'h-full px-6 py-5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5',
                p.mode === 'CHED' ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-amber-500'
              )}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      p.mode === 'CHED' ? 'bg-primary/10' : 'bg-amber-500/10'
                    )}>
                      {p.mode === 'CHED'
                        ? <BookOpen className="w-5 h-5 text-primary" />
                        : <GraduationCap className="w-5 h-5 text-amber-400" />
                      }
                    </div>
                    <Badge variant={p.mode === 'CHED' ? 'default' : 'warning'} className="text-[10px]">
                      {p.mode}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold leading-tight group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1">{p.department?.name ?? 'No department'}</p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-3 h-3" />{p._count?.plos ?? 0} PLOs
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" />{p._count?.courses ?? 0} Courses
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}