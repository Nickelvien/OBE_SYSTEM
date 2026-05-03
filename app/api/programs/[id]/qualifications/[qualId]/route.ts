// app/api/programs/[id]/qualifications/[qualId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; qualId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const existing = await tx.tesdaQualification.findFirst({ where: { id: params.qualId, programId: params.id, deletedAt: null } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await tx.tesdaQualification.update({ where: { id: params.qualId }, data: { deletedAt: new Date() } })
    await auditLog(tx, { userId: session.user.id, action: 'DELETE', tableName: 'tesda_qualifications', recordId: params.qualId, oldValue: existing })
    return NextResponse.json({ ok: true })
  })
}
