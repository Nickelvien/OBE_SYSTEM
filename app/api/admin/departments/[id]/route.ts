// app/api/admin/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  name:   z.string().min(1).optional(),
  code:   z.string().min(1).optional(),
  deanId: z.string().uuid().optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.department.findFirst({ where: { id: params.id, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const updated = await tx.department.update({ where: { id: params.id }, data: parsed.data })
    await auditLog(tx, { userId: session.user.id, action: 'UPDATE', tableName: 'departments', recordId: params.id, oldValue: existing, newValue: parsed.data })
    return NextResponse.json(updated)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.department.findFirst({ where: { id: params.id, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await tx.department.update({ where: { id: params.id }, data: { deletedAt: new Date() } })
    await auditLog(tx, { userId: session.user.id, action: 'DELETE', tableName: 'departments', recordId: params.id, oldValue: existing })
    return NextResponse.json({ ok: true })
  })
}
