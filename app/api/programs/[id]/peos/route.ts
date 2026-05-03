// app/api/programs/[id]/peos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  code:        z.string().min(1),
  description: z.string().min(1),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const peos = await tx.programEdObjective.findMany({
      where:   { programId: params.id, deletedAt: null },
      include: { ploLinks: { include: { plo: true } }, goalLinks: true },
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(peos)
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const peo = await tx.programEdObjective.create({ data: { ...parsed.data, programId: params.id } })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'program_ed_objectives', recordId: peo.id, newValue: parsed.data })
    return NextResponse.json(peo, { status: 201 })
  })
}
