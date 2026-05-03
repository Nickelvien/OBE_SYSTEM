// app/api/admin/audit-logs/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET(req: NextRequest) {
  const session = await requireAuth(['super_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const table  = searchParams.get('table')   ?? undefined
  const action = searchParams.get('action')  ?? undefined
  const limit  = parseInt(searchParams.get('limit') ?? '100')

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const logs = await tx.auditLog.findMany({
      where: {
        ...(table  ? { tableName: table }  : {}),
        ...(action ? { action }            : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 500),
    })
    return NextResponse.json(logs)
  })
}
