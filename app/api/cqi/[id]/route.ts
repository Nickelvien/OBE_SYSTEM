// app/api/cqi/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  status:      z.enum(['open','in_progress','completed']).optional(),
  description: z.string().optional(),
  responsible: z.string().optional().nullable(),
  targetDate:  z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','dean','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.cqiActionPlan.findFirst({ where: { id: params.id, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data: Record<string, unknown> = { ...parsed.data }
    if (parsed.data.targetDate)  data.targetDate  = new Date(parsed.data.targetDate)
    if (parsed.data.completedAt) data.completedAt = new Date(parsed.data.completedAt)

    const updated = await tx.cqiActionPlan.update({ where: { id: params.id }, data })
    await auditLog(tx, { userId: session.user.id, action: 'UPDATE', tableName: 'cqi_action_plans', recordId: params.id, oldValue: existing, newValue: parsed.data })
    return NextResponse.json(updated)
  })
}
