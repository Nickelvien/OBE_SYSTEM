// app/api/programs/[id]/curriculum-map/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { createCurriculumSnapshot, closePreviousSnapshot } from '@/lib/curriculum/snapshot'
import { z }           from 'zod'

const schema = z.object({
  courseId: z.string().uuid(),
  ploId:    z.string().uuid(),
  idaLevel: z.enum(['I','D','A']),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const map = await tx.curriculumMap.findMany({
      where:   { course: { programId: params.id, deletedAt: null } },
      include: { course: { select: { id: true, code: true, name: true } }, plo: { select: { id: true, code: true, description: true } } },
    })
    return NextResponse.json(map)
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const snapshotId = await createCurriculumSnapshot({ programId: params.id, createdBy: session.user.id })
  await closePreviousSnapshot(params.id, snapshotId)

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const entry = await tx.curriculumMap.upsert({
      where:  { courseId_ploId: { courseId: parsed.data.courseId, ploId: parsed.data.ploId } },
      create: parsed.data,
      update: { idaLevel: parsed.data.idaLevel },
    })
    return NextResponse.json(entry)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, ploId } = await req.json()
  const snapshotId = await createCurriculumSnapshot({ programId: params.id, createdBy: session.user.id })
  await closePreviousSnapshot(params.id, snapshotId)

  return withRLS(session.user.id, session.user.role, async (tx) => {
    await tx.curriculumMap.deleteMany({ where: { courseId, ploId } })
    return NextResponse.json({ ok: true })
  })
}
