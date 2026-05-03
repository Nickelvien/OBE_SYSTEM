// app/api/cqi/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET(req: NextRequest) {
  const session = await requireAuth(['super_admin','campus_admin','dean','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status    = searchParams.get('status')    ?? undefined
  const programId = searchParams.get('programId') ?? undefined

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const plans = await tx.cqiActionPlan.findMany({
      where: {
        deletedAt: null,
        ...(status    ? { status: status as never }  : {}),
        ...(programId ? { programId }                : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(plans)
  })
}
