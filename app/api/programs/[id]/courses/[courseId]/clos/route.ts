// app/api/programs/[id]/courses/[courseId]/clos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { createCurriculumSnapshot, closePreviousSnapshot } from '@/lib/curriculum/snapshot'
import { z }           from 'zod'

const schema = z.object({
  code:        z.string().min(1),
  description: z.string().min(1),
  weight:      z.number().min(0).max(1),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string; courseId: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const clos = await tx.courseLearningOutcome.findMany({
      where:   { courseId: params.courseId, deletedAt: null },
      include: { ploMappings: { include: { plo: true } } },
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(clos)
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string; courseId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head','faculty'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const snapshotId = await createCurriculumSnapshot({ programId: params.id, createdBy: session.user.id })
  await closePreviousSnapshot(params.id, snapshotId)

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const clo = await tx.courseLearningOutcome.create({ data: { ...parsed.data, courseId: params.courseId } })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'course_learning_outcomes', recordId: clo.id, newValue: parsed.data })
    return NextResponse.json(clo, { status: 201 })
  })
}
