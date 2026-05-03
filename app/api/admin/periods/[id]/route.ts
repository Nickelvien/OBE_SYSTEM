// app/api/admin/periods/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  name:      z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate:   z.string().optional(),
  isActive:  z.boolean().optional(),
  isLocked:  z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.academicPeriod.findFirst({ where: { id: params.id, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data: Record<string, unknown> = { ...parsed.data }
    if (parsed.data.startDate) data.startDate = new Date(parsed.data.startDate)
    if (parsed.data.endDate)   data.endDate   = new Date(parsed.data.endDate)

    // If activating, deactivate all others first
    if (parsed.data.isActive) {
      await tx.academicPeriod.updateMany({ where: { isActive: true }, data: { isActive: false } })
    }

    const updated = await tx.academicPeriod.update({ where: { id: params.id }, data })
    await auditLog(tx, { userId: session.user.id, action: 'UPDATE', tableName: 'academic_periods', recordId: params.id, oldValue: existing, newValue: parsed.data })
    return NextResponse.json(updated)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.academicPeriod.findFirst({ where: { id: params.id, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await tx.academicPeriod.update({ where: { id: params.id }, data: { deletedAt: new Date() } })
    await auditLog(tx, { userId: session.user.id, action: 'DELETE', tableName: 'academic_periods', recordId: params.id, oldValue: existing })
    return NextResponse.json({ ok: true })
  })
}
