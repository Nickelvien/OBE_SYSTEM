// app/api/faculty/courses/[assignmentId]/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET(_req: NextRequest, { params }: { params: { assignmentId: string } }) {
  const session = await requireAuth(['faculty','super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const assignment = await tx.facultyCourseAssignment.findUnique({ where: { id: params.assignmentId } })
    if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const enrollments = await tx.enrollment.findMany({
      where:   { courseId: assignment.courseId, periodId: assignment.periodId, deletedAt: null, status: 'enrolled' },
      orderBy: { createdAt: 'asc' },
    })

    // Get student user records
    const studentIds = enrollments.map((e) => e.studentId)
    const users      = await tx.user.findMany({ where: { id: { in: studentIds }, deletedAt: null } })
    const students   = users.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email }))

    return NextResponse.json({ enrollments, students })
  })
}
