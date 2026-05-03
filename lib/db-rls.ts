// lib/db-rls.ts
import { prisma } from './db'
import { Prisma } from '@prisma/client'

export async function withRLS<T>(
  userId: string,
  role: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT
        set_config('app.current_user_id', ${userId}, true),
        set_config('app.current_role',    ${role},   true)
    `
    return fn(tx)
  })
}
