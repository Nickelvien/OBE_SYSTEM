// app/api/programs/[id]/courses/[courseId]/clos/[cloId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { createCurriculumSnapshot, closePreviousSnapshot } from '@/lib/curriculum/snapshot'
import { z }           from 'zod'

const schema = z.object({
  code:        z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  weight:      z.number().min(0).max(1).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string; courseId: string; cloId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head','faculty'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const snapshotId = await createCurriculumSnapshot({ programId: params.id, createdBy: session.user.id })
  await closePreviousSnapshot(params.id, snapshotId)
  return withRLS(session.user.id, session.user.role, async (tx) => {
    const updated = await tx.courseLearningOutcome.update({ where: { id: params.cloId }, data: parsed.data })
    await auditLog(tx, { userId: session.user.id, action: 'UPDATE', tableName: 'course_learning_outcomes', recordId: params.cloId, newValue: parsed.data })
    return NextResponse.json(updated)
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; courseId: string; cloId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snapshotId = await createCurriculumSnapshot({ programId: params.id, createdBy: session.user.id })
  await closePreviousSnapshot(params.id, snapshotId)
  return withRLS(session.user.id, session.user.role, async (tx) => {
    await tx.courseLearningOutcome.update({ where: { id: params.cloId }, data: { deletedAt: new Date() } })
    await auditLog(tx, { userId: session.user.id, action: 'DELETE', tableName: 'course_learning_outcomes', recordId: params.cloId })
    return NextResponse.json({ ok: true })
  })
}
