// app/api/programs/[id]/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  code:      z.string().min(1),
  name:      z.string().min(1),
  units:     z.number().int().min(0),
  yearLevel: z.number().int().min(1),
  semester:  z.number().int().min(1).max(3),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const courses = await tx.course.findMany({
      where:   { programId: params.id, deletedAt: null },
      include: { clos: { where: { deletedAt: null } }, _count: { select: { enrollments: true } } },
      orderBy: [{ yearLevel: 'asc' }, { semester: 'asc' }, { code: 'asc' }],
    })
    return NextResponse.json(courses)
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const course = await tx.course.create({ data: { ...parsed.data, programId: params.id } })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'courses', recordId: course.id, newValue: parsed.data })
    return NextResponse.json(course, { status: 201 })
  })
}
