// app/api/scores/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { inngest }     from '@/lib/inngest'
import { z }           from 'zod'

const schema = z.object({
  studentId:    z.string().uuid(),
  assessmentId: z.string().uuid(),
  rawScore:     z.number().optional().nullable(),
  isExcused:    z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const session = await requireAuth(['faculty','super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    // Get assessment to compute percentage
    const assessment = await tx.assessmentTool.findUnique({ where: { id: parsed.data.assessmentId } })
    if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })

    const percentageScore = parsed.data.rawScore != null
      ? (parsed.data.rawScore / Number(assessment.maxScore)) * 100
      : null

    const score = await tx.studentScore.upsert({
      where:  { studentId_assessmentId: { studentId: parsed.data.studentId, assessmentId: parsed.data.assessmentId } },
      create: { ...parsed.data, percentageScore },
      update: { rawScore: parsed.data.rawScore, isExcused: parsed.data.isExcused ?? false, percentageScore },
    })

    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'student_scores', recordId: score.id, newValue: parsed.data })

    // Mark attainment as stale
    await inngest.send({ name: 'obe/score.updated', data: { assessmentId: parsed.data.assessmentId, periodId: assessment.periodId } })

    return NextResponse.json(score, { status: 201 })
  })
}

export async function GET(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const assessmentId = searchParams.get('assessmentId')

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const scores = await tx.studentScore.findMany({
      where: assessmentId ? { assessmentId } : {},
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(scores)
  })
}
