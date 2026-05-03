// app/api/admin/grading-systems/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  name:             z.string().min(1),
  passingThreshold: z.number().min(0).max(100),
  eviThreshold:     z.number().min(0).max(100),
  cowThreshold:     z.number().min(0).max(100),
  scaleType:        z.enum(['percentage','points','competency']),
})

export async function GET() {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const gs = await tx.gradingSystem.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } })
    return NextResponse.json(gs)
  })
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const gs = await tx.gradingSystem.create({ data: parsed.data })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'grading_systems', recordId: gs.id, newValue: parsed.data })
    return NextResponse.json(gs, { status: 201 })
  })
}
