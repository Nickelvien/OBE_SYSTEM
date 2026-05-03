// app/api/programs/[id]/snapshots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const snapshots = await tx.curriculumSnapshot.findMany({
      where:   { programId: params.id },
      orderBy: { effectiveFrom: 'desc' },
    })
    return NextResponse.json(snapshots)
  })
}
