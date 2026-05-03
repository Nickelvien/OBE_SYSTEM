// app/api/programs/[id]/peos/[peoId]/plo-links/route.ts
// Manage PEO ↔ PLO links (weights)
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'

const schema = z.object({
  ploId:  z.string().uuid(),
  weight: z.number().min(0).max(1),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string; peoId: string } }) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const links = await tx.peoPloLink.findMany({
      where:   { peoId: params.peoId },
      include: { plo: { select: { id: true, code: true, description: true } } },
    })
    return NextResponse.json(links)
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; peoId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const link = await tx.peoPloLink.upsert({
      where:  { peoId_ploId: { peoId: params.peoId, ploId: parsed.data.ploId } },
      create: { peoId: params.peoId, ploId: parsed.data.ploId, weight: parsed.data.weight },
      update: { weight: parsed.data.weight },
    })
    await auditLog(tx, { userId: session.user.id, action: 'UPDATE', tableName: 'peo_plo_links', recordId: link.id, newValue: parsed.data })
    return NextResponse.json(link)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; peoId: string } }) {
  const session = await requireAuth(['super_admin','campus_admin','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ploId } = await req.json()
  return withRLS(session.user.id, session.user.role, async (tx) => {
    await tx.peoPloLink.deleteMany({ where: { peoId: params.peoId, ploId } })
    await auditLog(tx, { userId: session.user.id, action: 'DELETE', tableName: 'peo_plo_links', recordId: params.peoId, newValue: { ploId } })
    return NextResponse.json({ ok: true })
  })
}
