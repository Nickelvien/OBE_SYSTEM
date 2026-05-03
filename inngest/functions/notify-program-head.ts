// inngest/functions/notify-program-head.ts
import { inngest } from '@/lib/inngest'
import { prisma }  from '@/lib/db'

export const notifyProgramHead = inngest.createFunction(
  { id: 'notify-program-head', name: 'Notify Program Head on CQI Threshold Breach' },
  { event: 'obe/cqi.threshold-breached' },
  async ({ event, step }) => {
    const { programId, periodId, entityType, entityId, attainment, threshold } =
      event.data as { programId: string; periodId: string; entityType: string; entityId: string; attainment: number; threshold: number }

    // Step 1: Create CQI action plan
    const plan = await step.run('create-cqi-plan', async () => {
      const existing = await prisma.cqiActionPlan.findFirst({
        where: { programId, periodId, entityId, status: { in: ['open', 'in_progress'] } },
      })
      if (existing) return existing
      return prisma.cqiActionPlan.create({
        data: {
          programId,
          periodId,
          triggeredBy: `${entityType}_below_threshold`,
          entityId,
          status:      'open',
          description: `${entityType.toUpperCase()} attainment of ${attainment.toFixed(1)}% is below the threshold of ${threshold}%. Immediate action is required.`,
        },
      })
    })

    // Step 2: Find program head and notify
    await step.run('notify-head', async () => {
      const program = await prisma.program.findUnique({ where: { id: programId } })
      if (!program?.programHeadId) return

      await prisma.notification.create({
        data: {
          userId:   program.programHeadId,
          title:    `CQI Alert: ${entityType.toUpperCase()} below threshold`,
          body:     `Attainment of ${attainment.toFixed(1)}% is below ${threshold}% threshold. CQI Plan #${plan.id.slice(0, 8)} has been created.`,
          type:     'cqi_triggered',
          entityId: plan.id,
        },
      })
    })

    return { ok: true, planId: plan.id }
  },
)
