// app/api/analytics/summary/route.ts
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET() {
  const session = await requireAuth(['super_admin','campus_admin','dean'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const [programs, users, closMeeting, cqiOpen, attainmentTrend] = await Promise.all([
      tx.program.count({ where: { deletedAt: null } }),
      tx.user.count({ where: { deletedAt: null, role: 'student' } }),
      tx.attainmentResult.count({ where: { entityType: 'clo', isStale: false, attainmentPercentage: { gte: 75 } } }),
      tx.cqiActionPlan.count({ where: { status: 'open', deletedAt: null } }),
      tx.attainmentResult.findMany({
        where:   { entityType: 'plo', isStale: false },
        select:  { attainmentPercentage: true, periodId: true, computedAt: true },
        orderBy: { computedAt: 'desc' },
        take:    100,
      }),
    ])

    return NextResponse.json({
      programs,
      activeStudents: users,
      closMeeting,
      openCqiPlans:   cqiOpen,
      attainmentTrend,
    })
  })
}
