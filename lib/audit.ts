// lib/audit.ts
import { Prisma } from '@prisma/client'

export async function auditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string
    action: string
    tableName: string
    recordId?: string
    oldValue?: unknown
    newValue?: unknown
    ipAddress?: string
  }
) {
  await tx.auditLog.create({
    data: {
      userId:    params.userId,
      action:    params.action,
      tableName: params.tableName,
      recordId:  params.recordId,
      oldValue:  params.oldValue as Prisma.InputJsonValue ?? Prisma.JsonNull,
      newValue:  params.newValue as Prisma.InputJsonValue ?? Prisma.JsonNull,
      ipAddress: params.ipAddress,
    },
  })
}
