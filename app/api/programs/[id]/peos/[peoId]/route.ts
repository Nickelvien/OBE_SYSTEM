// app/api/programs/[id]/peos/[peoId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  code:        z.string().min(1).optional(),
  description: z.string().min(1).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string; peoId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return withRLS(session.user.id, session.user.role, async (tx) => {
    const updated = await tx.programEdObjective.update({ where: { id: params.peoId }, data: parsed.data })
    await auditLog(tx, { userId: session.user.id, action: 'UPDATE', tableName: 'program_ed_objectives', recordId: params.peoId, newValue: parsed.data })
    return NextResponse.json(updated)
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; peoId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return withRLS(session.user.id, session.user.role, async (tx) => {
    await tx.programEdObjective.update({ where: { id: params.peoId }, data: { deletedAt: new Date() } })
    await auditLog(tx, { userId: session.user.id, action: 'DELETE', tableName: 'program_ed_objectives', recordId: params.peoId })
    return NextResponse.json({ ok: true })
  })
}
