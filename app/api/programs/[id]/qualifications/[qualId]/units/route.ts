// app/api/programs/[id]/qualifications/[qualId]/units/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({ code: z.string().min(1), name: z.string().min(1) })

export async function POST(req: NextRequest, { params }: { params: { id: string; qualId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const unit = await tx.competencyUnit.create({ data: { qualificationId: params.qualId, ...parsed.data } })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'competency_units', recordId: unit.id, newValue: parsed.data })
    return NextResponse.json(unit, { status: 201 })
  })
}
