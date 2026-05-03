// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const updateSchema = z.object({
  email:               z.string().email().optional(),
  firstName:           z.string().min(1).optional(),
  lastName:            z.string().min(1).optional(),
  role:                z.enum(['super_admin','campus_admin','dean','program_head','faculty','student','accreditor']).optional(),
  departmentId:        z.string().uuid().optional().nullable(),
  isDpo:               z.boolean().optional(),
  accreditorExpiresAt: z.string().datetime().optional().nullable(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: params.id, deletedAt: null },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, departmentId: true, isDpo: true,
        accreditorExpiresAt: true, createdAt: true,
      },
    })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(user)
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.user.findFirst({ where: { id: params.id, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await tx.user.update({
      where: { id: params.id },
      data:  parsed.data,
    })
    await auditLog(tx, {
      userId:    session.user.id,
      action:    'UPDATE',
      tableName: 'users',
      recordId:  params.id,
      oldValue:  existing,
      newValue:  parsed.data,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })
    return NextResponse.json(updated)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.user.findFirst({ where: { id: params.id, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await tx.user.update({ where: { id: params.id }, data: { deletedAt: new Date() } })
    await auditLog(tx, {
      userId:    session.user.id,
      action:    'DELETE',
      tableName: 'users',
      recordId:  params.id,
      oldValue:  existing,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })
    return NextResponse.json({ ok: true })
  })
}
