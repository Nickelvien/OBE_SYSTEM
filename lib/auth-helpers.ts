// lib/auth-helpers.ts
// Returns the session object directly, or null if unauthorized.
// Usage: const session = await requireAuth(['super_admin'])
//        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
import { auth } from '@/lib/auth'

type UserRole =
  | 'super_admin' | 'campus_admin' | 'dean' | 'program_head'
  | 'faculty' | 'student' | 'accreditor'

interface AuthSession {
  user: {
    id:                  string
    email:               string
    role:                UserRole
    firstName:           string
    lastName:            string
    accreditorExpiresAt: string | null
  }
}

/**
 * Server-side session guard.
 * Returns the session if authenticated (and the user has an allowed role),
 * otherwise returns null.
 *
 * @param allowedRoles - optional list of roles; if omitted, any authenticated user is accepted
 */
export async function requireAuth(allowedRoles?: string[]): Promise<AuthSession | null> {
  const session = await auth()

  if (!session?.user) return null

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(session.user.role ?? '')) return null
  }

  return session as unknown as AuthSession
}
