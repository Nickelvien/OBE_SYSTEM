// app/api/admin/periods/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  name:      z.string().min(1),
  startDate: z.string().refine((v) => !isNaN(Date.parse(v))),
  endDate:   z.string().refine((v) => !isNaN(Date.parse(v))),
  isActive:  z.boolean().optional(),
  isLocked:  z.boolean().optional(),
})

export async function GET() {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const periods = await tx.academicPeriod.findMany({
      where: { deletedAt: null },
      orderBy: { startDate: 'desc' },
    })
    return NextResponse.json(periods)
  })
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const period = await tx.academicPeriod.create({
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate:   new Date(parsed.data.endDate),
      },
    })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'academic_periods', recordId: period.id, newValue: parsed.data })
    return NextResponse.json(period, { status: 201 })
  })
}
