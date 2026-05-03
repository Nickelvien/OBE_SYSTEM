// app/api/reports/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { inngest }     from '@/lib/inngest'
import { z }           from 'zod'

const schema = z.object({
  programId:  z.string().uuid(),
  periodId:   z.string().uuid(),
  reportType: z.enum(['ched_compliance','tesda_competency','curriculum_map','syllabus']),
})

export async function GET() {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const reports = await tx.report.findMany({
      where:   session.user.role === 'faculty' ? { requestedBy: session.user.id } : {},
      include: { program: { select: { id: true, name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reports)
  })
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(['super_admin','campus_admin','dean','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const report = await tx.report.create({
      data: { ...parsed.data, requestedBy: session.user.id, status: 'pending' },
    })
    // Fire generation event
    await inngest.send({ name: 'obe/report.generate-requested', data: { reportId: report.id } })
    return NextResponse.json(report, { status: 201 })
  })
}
