// app/api/programs/[id]/plos/[ploId]/clo-mappings/route.ts
// Manage PLO ↔ CLO mappings (weights)
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { createCurriculumSnapshot, closePreviousSnapshot } from '@/lib/curriculum/snapshot'
import { z }           from 'zod'

const schema = z.object({
  cloId:  z.string().uuid(),
  weight: z.number().min(0).max(1),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string; ploId: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const mappings = await tx.ploCloMapping.findMany({
      where:   { ploId: params.ploId },
      include: { clo: { select: { id: true, code: true, description: true, weight: true, course: { select: { code: true, name: true } } } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(mappings)
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; ploId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const snapshotId = await createCurriculumSnapshot({ programId: params.id, createdBy: session.user.id })
  await closePreviousSnapshot(params.id, snapshotId)

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const mapping = await tx.ploCloMapping.upsert({
      where:  { ploId_cloId: { ploId: params.ploId, cloId: parsed.data.cloId } },
      create: { ploId: params.ploId, cloId: parsed.data.cloId, weight: parsed.data.weight },
      update: { weight: parsed.data.weight },
    })
    await auditLog(tx, { userId: session.user.id, action: 'UPDATE', tableName: 'plo_clo_mapping', recordId: mapping.id, newValue: parsed.data })
    return NextResponse.json(mapping)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; ploId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cloId } = await req.json()
  const snapshotId = await createCurriculumSnapshot({ programId: params.id, createdBy: session.user.id })
  await closePreviousSnapshot(params.id, snapshotId)

  return withRLS(session.user.id, session.user.role, async (tx) => {
    await tx.ploCloMapping.deleteMany({ where: { ploId: params.ploId, cloId } })
    await auditLog(tx, { userId: session.user.id, action: 'DELETE', tableName: 'plo_clo_mapping', recordId: params.ploId, newValue: { cloId } })
    return NextResponse.json({ ok: true })
  })
}
