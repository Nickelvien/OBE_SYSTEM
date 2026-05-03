// app/api/privacy/export/[userId]/route.ts — RA 10173 Student Data Export
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await requireAuth(['super_admin'])
  if (!session) {
    // Allow DPO to access
    const dpoSession = await requireAuth()
    if (!dpoSession?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const authSession = await requireAuth()
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(authSession.user.id, authSession.user.role, async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: params.userId, deletedAt: null },
      select: {
        id:        true,
        email:     true,
        firstName: true,
        lastName:  true,
        role:      true,
        createdAt: true,
      },
    })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [scores, enrollments, consents] = await Promise.all([
      tx.studentScore.findMany({ where: { studentId: params.userId } }),
      tx.enrollment.findMany({ where: { studentId: params.userId } }),
      tx.dataPrivacyConsent.findMany({ where: { userId: params.userId } }),
    ])

    await auditLog(tx, {
      userId:    authSession.user.id,
      action:    'EXPORT',
      tableName: 'users',
      recordId:  params.userId,
      newValue:  { reason: 'RA 10173 data export' },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    const exportData = {
      exportedAt:  new Date().toISOString(),
      exportedBy:  authSession.user.id,
      dataSubject: user,
      scores:      scores.map((s) => ({ assessmentId: s.assessmentId, rawScore: s.rawScore, percentageScore: s.percentageScore, createdAt: s.createdAt })),
      enrollments: enrollments.map((e) => ({ courseId: e.courseId, periodId: e.periodId, status: e.status })),
      consents,
      legalBasis:  'Republic Act 10173 — Data Privacy Act of 2012, Philippines',
    }

    return NextResponse.json(exportData)
  })
}
