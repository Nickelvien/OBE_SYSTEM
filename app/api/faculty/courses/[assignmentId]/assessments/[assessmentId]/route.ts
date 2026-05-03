// app/api/faculty/courses/[assignmentId]/assessments/[assessmentId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  name:           z.string().min(1).optional(),
  assessmentType: z.enum(['formative','summative','performance','portfolio']).optional(),
  maxScore:       z.number().positive().optional(),
  weight:         z.number().min(0).max(1).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { assignmentId: string; assessmentId: string } }) {
  const session = await requireAuth(['faculty','super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.assessmentTool.findFirst({ where: { id: params.assessmentId, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const updated = await tx.assessmentTool.update({ where: { id: params.assessmentId }, data: parsed.data })
    await auditLog(tx, { userId: session.user.id, action: 'UPDATE', tableName: 'assessment_tools', recordId: params.assessmentId, oldValue: existing, newValue: parsed.data })
    return NextResponse.json(updated)
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: { assignmentId: string; assessmentId: string } }) {
  const session = await requireAuth(['faculty','super_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.assessmentTool.findFirst({ where: { id: params.assessmentId, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await tx.assessmentTool.update({ where: { id: params.assessmentId }, data: { deletedAt: new Date() } })
    await auditLog(tx, { userId: session.user.id, action: 'DELETE', tableName: 'assessment_tools', recordId: params.assessmentId, oldValue: existing })
    return NextResponse.json({ ok: true })
  })
}
