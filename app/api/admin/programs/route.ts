// app/api/admin/programs/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  name:            z.string().min(1),
  code:            z.string().min(1),
  mode:            z.enum(['CHED','TESDA']),
  departmentId:    z.string().uuid().optional().nullable(),
  gradingSystemId: z.string().uuid(),
  programHeadId:   z.string().uuid().optional().nullable(),
  pqfLevel:        z.number().int().optional().nullable(),
})

export async function GET() {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const programs = await tx.program.findMany({
      where: { deletedAt: null },
      include: {
        department:    { select: { id: true, name: true, code: true } },
        gradingSystem: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(programs)
  })
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const program = await tx.program.create({ data: parsed.data })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'programs', recordId: program.id, newValue: parsed.data })
    return NextResponse.json(program, { status: 201 })
  })
}
