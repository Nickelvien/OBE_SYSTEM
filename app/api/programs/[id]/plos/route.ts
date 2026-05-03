// app/api/programs/[id]/plos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { createCurriculumSnapshot, closePreviousSnapshot } from '@/lib/curriculum/snapshot'
import { z }           from 'zod'

const schema = z.object({
  code:        z.string().min(1),
  description: z.string().min(1),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const plos = await tx.programLearningOutcome.findMany({
      where:   { programId: params.id, deletedAt: null },
      include: { peoLinks: true, cloMappings: true },
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(plos)
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Auto-snapshot before change
  const snapshotId = await createCurriculumSnapshot({ programId: params.id, createdBy: session.user.id })
  await closePreviousSnapshot(params.id, snapshotId)

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const plo = await tx.programLearningOutcome.create({
      data: { ...parsed.data, programId: params.id },
    })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'program_learning_outcomes', recordId: plo.id, newValue: parsed.data })
    return NextResponse.json(plo, { status: 201 })
  })
}
