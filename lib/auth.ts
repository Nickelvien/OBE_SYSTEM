import NextAuth                  from 'next-auth'
import Credentials               from 'next-auth/providers/credentials'
import { prisma }                from '@/lib/db'
import { compare }               from 'bcryptjs'
import { z }                     from 'zod'
import { authConfig }            from '@/lib/auth.config'

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/\d/, 'Password must contain at least one number.')
    .regex(/[\W_]/, 'Password must contain at least one special character.'),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user || user.deletedAt) return null

        const valid = await compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return {
          id:                  user.id,
          email:               user.email,
          name:                `${user.firstName} ${user.lastName}`,
          firstName:           user.firstName,
          lastName:            user.lastName,
          role:                user.role,
          accreditorExpiresAt: user.accreditorExpiresAt?.toISOString() ?? null,
        }
      },
    }),
  ],
})
