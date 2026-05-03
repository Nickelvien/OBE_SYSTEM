// app/api/attainment/compute/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { inngest }     from '@/lib/inngest'
import { z }           from 'zod'

const schema = z.object({
  programId: z.string().uuid(),
  periodId:  z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const session = await requireAuth(['super_admin','campus_admin','dean','program_head'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await inngest.send({
    name: 'obe/period.compute-requested',
    data: { ...parsed.data, requestedBy: session.user.id },
  })

  return NextResponse.json({ ok: true, message: 'Attainment computation queued.' })
}
