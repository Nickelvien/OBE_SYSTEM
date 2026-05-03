import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id                  = user.id
        token.firstName           = (user as { firstName: string }).firstName
        token.lastName            = (user as { lastName: string }).lastName
        token.role                = (user as { role: string }).role
        token.accreditorExpiresAt = (user as { accreditorExpiresAt: string | null }).accreditorExpiresAt
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id                  = token.id as string
        session.user.firstName           = token.firstName as string
        session.user.lastName            = token.lastName as string
        session.user.role                = token.role as string
        session.user.accreditorExpiresAt = token.accreditorExpiresAt as string | null
      }
      return session
    },
  },
} satisfies NextAuthConfig
