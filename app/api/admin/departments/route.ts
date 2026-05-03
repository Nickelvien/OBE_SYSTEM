// app/api/admin/departments/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  name:   z.string().min(1),
  code:   z.string().min(1).toUpperCase(),
  deanId: z.string().uuid().optional().nullable(),
})

export async function GET() {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const depts = await tx.department.findMany({
      where: { deletedAt: null },
      include: { programs: { where: { deletedAt: null }, select: { id: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(depts)
  })
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const dept = await tx.department.create({ data: parsed.data })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'departments', recordId: dept.id, newValue: parsed.data })
    return NextResponse.json(dept, { status: 201 })
  })
}
