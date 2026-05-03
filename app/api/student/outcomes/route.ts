// app/api/student/outcomes/route.ts
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET() {
  const session = await requireAuth(['student','super_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    // Find all courses the student is enrolled in
    const enrollments = await tx.enrollment.findMany({
      where:   { studentId: session.user.id, deletedAt: null, status: 'enrolled' },
      include: {
        course: {
          include: {
            clos:    { where: { deletedAt: null } },
            program: { include: { gradingSystem: true } },
          },
        },
      },
    })

    // For each course, get attainment results for each CLO
    const results = await Promise.all(enrollments.map(async (enr) => {
      const course   = enr.course
      const snapshot = await tx.curriculumSnapshot.findFirst({
        where:   { programId: course.programId },
        orderBy: { effectiveFrom: 'desc' },
      })

      const passingThreshold = Number(course.program.gradingSystem.passingThreshold)

      const cloResults = await Promise.all(course.clos.map(async (clo) => {
        const attResult = snapshot
          ? await tx.attainmentResult.findFirst({
              where:   { snapshotId: snapshot.id, entityType: 'clo', entityId: clo.id, isStale: false },
              orderBy: { computedAt: 'desc' },
            })
          : null
        return {
          code:                clo.code,
          description:         clo.description,
          attainmentPercentage: attResult?.attainmentPercentage ? Number(attResult.attainmentPercentage) : null,
          passingThreshold,
        }
      }))

      return { courseCode: course.code, courseName: course.name, clos: cloResults }
    }))

    return NextResponse.json(results)
  })
}
