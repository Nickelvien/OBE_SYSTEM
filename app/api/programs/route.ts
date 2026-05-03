// app/api/programs/route.ts
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET() {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const programs = await tx.program.findMany({
      where: { deletedAt: null },
      include: {
        department:    { select: { id: true, name: true } },
        gradingSystem: { select: { id: true, name: true, passingThreshold: true } },
        _count:        { select: { plos: true, courses: true } },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(programs)
  })
}
