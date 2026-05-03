// app/api/programs/[id]/qualifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  ncLevel: z.string().min(1),
  name:    z.string().min(1),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const quals = await tx.tesdaQualification.findMany({
      where:   { programId: params.id, deletedAt: null },
      include: {
        units: {
          where:   { deletedAt: null },
          include: { criteria: { where: { deletedAt: null }, orderBy: { code: 'asc' } } },
          orderBy: { code: 'asc' },
        },
      },
      orderBy: { ncLevel: 'asc' },
    })
    return NextResponse.json(quals)
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const qual = await tx.tesdaQualification.create({ data: { programId: params.id, ...parsed.data } })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'tesda_qualifications', recordId: qual.id, newValue: parsed.data })
    return NextResponse.json(qual, { status: 201 })
  })
}
