// app/api/attainment/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const programId = searchParams.get('programId')
  const periodId  = searchParams.get('periodId')

  if (!programId || !periodId) return NextResponse.json({ error: 'programId and periodId required' }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const snapshot = await tx.curriculumSnapshot.findFirst({
      where:   { programId },
      orderBy: { effectiveFrom: 'desc' },
    })
    if (!snapshot) return NextResponse.json([])

    const results = await tx.attainmentResult.findMany({
      where:   { snapshotId: snapshot.id, periodId },
      orderBy: { entityType: 'asc' },
    })
    return NextResponse.json(results)
  })
}
