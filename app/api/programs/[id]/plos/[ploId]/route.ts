// app/api/programs/[id]/plos/[ploId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { createCurriculumSnapshot, closePreviousSnapshot } from '@/lib/curriculum/snapshot'
import { z }           from 'zod'

const schema = z.object({
  code:        z.string().min(1).optional(),
  description: z.string().min(1).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string; ploId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const snapshotId = await createCurriculumSnapshot({ programId: params.id, createdBy: session.user.id })
  await closePreviousSnapshot(params.id, snapshotId)

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.programLearningOutcome.findFirst({ where: { id: params.ploId, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const updated = await tx.programLearningOutcome.update({ where: { id: params.ploId }, data: parsed.data })
    await auditLog(tx, { userId: session.user.id, action: 'UPDATE', tableName: 'program_learning_outcomes', recordId: params.ploId, oldValue: existing, newValue: parsed.data })
    return NextResponse.json(updated)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; ploId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const snapshotId = await createCurriculumSnapshot({ programId: params.id, createdBy: session.user.id })
  await closePreviousSnapshot(params.id, snapshotId)

  return withRLS(session.user.id, session.user.role, async (tx) => {
    await tx.programLearningOutcome.update({ where: { id: params.ploId }, data: { deletedAt: new Date() } })
    await auditLog(tx, { userId: session.user.id, action: 'DELETE', tableName: 'program_learning_outcomes', recordId: params.ploId })
    return NextResponse.json({ ok: true })
  })
}
