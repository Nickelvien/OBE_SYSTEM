// app/api/programs/[id]/courses/[courseId]/route.ts — GET/PATCH/DELETE single course
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  code:      z.string().min(1).optional(),
  name:      z.string().min(1).optional(),
  units:     z.number().int().positive().optional(),
  yearLevel: z.number().int().min(1).max(5).optional(),
  semester:  z.number().int().min(1).max(3).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string; courseId: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const course = await tx.course.findFirst({
      where:   { id: params.courseId, programId: params.id, deletedAt: null },
      include: { clos: { where: { deletedAt: null }, include: { ploMappings: { include: { plo: { select: { code: true } } } } } } },
    })
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(course)
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; courseId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.course.findFirst({ where: { id: params.courseId, programId: params.id, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const updated = await tx.course.update({ where: { id: params.courseId }, data: parsed.data })
    await auditLog(tx, { userId: session.user.id, action: 'UPDATE', tableName: 'courses', recordId: params.courseId, oldValue: existing, newValue: parsed.data })
    return NextResponse.json(updated)
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; courseId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.course.findFirst({ where: { id: params.courseId, programId: params.id, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await tx.course.update({ where: { id: params.courseId }, data: { deletedAt: new Date() } })
    await auditLog(tx, { userId: session.user.id, action: 'DELETE', tableName: 'courses', recordId: params.courseId, oldValue: existing })
    return NextResponse.json({ ok: true })
  })
}
