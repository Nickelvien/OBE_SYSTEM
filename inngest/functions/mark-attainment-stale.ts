// inngest/functions/mark-attainment-stale.ts
import { inngest } from '@/lib/inngest'
import { prisma }  from '@/lib/db'

export const markAttainmentStale = inngest.createFunction(
  { id: 'mark-attainment-stale', name: 'Mark Attainment Stale' },
  { event: 'obe/score.updated' },
  async ({ event, step }) => {
    const { periodId } = event.data as { periodId: string }

    await step.run('set-stale', async () => {
      await prisma.attainmentResult.updateMany({
        where: { periodId, isStale: false },
        data:  { isStale: true },
      })
    })

    return { ok: true, periodId }
  },
)
