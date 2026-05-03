// types/auth.ts — extended with firstName, lastName for session access
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id:                  string
      email:               string
      name:                string
      firstName:           string
      lastName:            string
      role:                string
      accreditorExpiresAt: string | null
    }
  }

  interface User {
    id:                  string
    firstName:           string
    lastName:            string
    role:                string
    accreditorExpiresAt: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:                  string
    firstName:           string
    lastName:            string
    role:                string
    accreditorExpiresAt: string | null
  }
}
