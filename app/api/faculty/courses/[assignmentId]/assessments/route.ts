// app/api/faculty/courses/[assignmentId]/assessments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  name:           z.string().min(1),
  assessmentType: z.enum(['formative','summative','performance','portfolio']),
  maxScore:       z.number().positive(),
  weight:         z.number().min(0).max(1),
})

export async function GET(_req: NextRequest, { params }: { params: { assignmentId: string } }) {
  const session = await requireAuth(['faculty','super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const assignment = await tx.facultyCourseAssignment.findUnique({ where: { id: params.assignmentId } })
    if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const assessments = await tx.assessmentTool.findMany({
      where:   { courseId: assignment.courseId, periodId: assignment.periodId, deletedAt: null },
      include: { cloAlignments: { include: { clo: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(assessments)
  })
}

export async function POST(req: NextRequest, { params }: { params: { assignmentId: string } }) {
  const session = await requireAuth(['faculty','super_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const assignment = await tx.facultyCourseAssignment.findUnique({ where: { id: params.assignmentId } })
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    const assessment = await tx.assessmentTool.create({
      data: { ...parsed.data, courseId: assignment.courseId, periodId: assignment.periodId },
    })
    await auditLog(tx, { userId: session.user.id, action: 'CREATE', tableName: 'assessment_tools', recordId: assessment.id, newValue: parsed.data })
    return NextResponse.json(assessment, { status: 201 })
  })
}
