// app/api/admin/users/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { withRLS }     from '@/lib/db-rls'
import { auditLog }    from '@/lib/audit'
import { z }           from 'zod'
import { hash }        from 'bcryptjs'

const createSchema = z.object({
  email:               z.string().email(),
  password:            z.string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/\d/, 'Password must contain at least one number.')
    .regex(/[\W_]/, 'Password must contain at least one special character.'),
  firstName:           z.string().min(1),
  lastName:            z.string().min(1),
  role:                z.enum(['super_admin','campus_admin','dean','program_head','faculty','student','accreditor']),
  departmentId:        z.string().uuid().optional().nullable(),
  isDpo:               z.boolean().optional(),
  accreditorExpiresAt: z.string().datetime().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const role  = searchParams.get('role')  ?? undefined
  const dept  = searchParams.get('departmentId') ?? undefined

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const users = await tx.user.findMany({
      where: {
        deletedAt:    null,
        ...(role ? { role: role as never } : {}),
        ...(dept  ? { departmentId: dept } : {}),
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, departmentId: true, isDpo: true,
        accreditorExpiresAt: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(users)
  })
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(['super_admin','campus_admin'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { password, ...rest } = parsed.data
  const passwordHash = await hash(password, 12)

  return withRLS(session.user.id, session.user.role, async (tx) => {
    const user = await tx.user.create({
      data: { ...rest, passwordHash },
    })
    await auditLog(tx, {
      userId:    session.user.id,
      action:    'CREATE',
      tableName: 'users',
      recordId:  user.id,
      newValue:  rest,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })
    return NextResponse.json(user, { status: 201 })
  })
}
