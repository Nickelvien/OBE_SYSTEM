// middleware.ts
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest & { auth: { user?: { role?: string; accreditorExpiresAt?: string | null } } | null }) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Redirect unauthenticated users to login
  if (!session?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Enforce accreditor expiry on EVERY protected route
  if (session?.user?.role === 'accreditor') {
    const expiresAt = session.user.accreditorExpiresAt
    if (!expiresAt || new Date(expiresAt) < new Date()) {
      return NextResponse.redirect(new URL('/expired', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/(dashboard)/:path*',
    '/dashboard/:path*',
  ],
}
