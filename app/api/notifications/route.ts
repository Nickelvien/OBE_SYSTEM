// app/api/notifications/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'

export async function GET() {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const notifications = await tx.notification.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take:    20,
    })
    return NextResponse.json(notifications)
  })
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  return withRLS(session.user.id, session.user.role, async (tx) => {
    await tx.notification.update({
      where: { id },
      data:  { readAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  })
}
