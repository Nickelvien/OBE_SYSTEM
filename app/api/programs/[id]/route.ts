// app/api/programs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const program = await tx.program.findFirst({
      where: { id: params.id, deletedAt: null },
      include: {
        department:    { select: { id: true, name: true } },
        gradingSystem: { select: { id: true, name: true, passingThreshold: true, eviThreshold: true, cowThreshold: true, scaleType: true } },
        _count:        { select: { plos: true, courses: true, peos: true } },
      },
    })
    if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(program)
  })
}
