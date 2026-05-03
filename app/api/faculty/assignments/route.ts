// app/api/faculty/assignments/route.ts
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET() {
  const session = await requireAuth(['faculty','super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const assignments = await tx.facultyCourseAssignment.findMany({
      where:   { facultyId: session.user.id, deletedAt: null },
      include: {
        course: { select: { id: true, code: true, name: true, units: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    // Fetch periods separately
    const periodIds = Array.from(new Set(assignments.map((a) => a.periodId)))
    const periods   = await tx.academicPeriod.findMany({ where: { id: { in: periodIds } } })
    const periodMap = Object.fromEntries(periods.map((p) => [p.id, p]))
    return NextResponse.json(assignments.map((a) => ({ ...a, period: periodMap[a.periodId] })))
  })
}
