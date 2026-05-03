// app/api/inngest/route.ts â€” Updated to register all functions
import { serve }                     from 'inngest/next'
import { inngest }                   from '@/lib/inngest'
import { computePeriodAttainment }   from '@/inngest/functions/compute-period-attainment'
import { markAttainmentStale }       from '@/inngest/functions/mark-attainment-stale'
import { notifyProgramHead }         from '@/inngest/functions/notify-program-head'
import { generateAccreditationReport } from '@/inngest/functions/generate-accreditation-report'

export const { GET, POST, PUT } = serve({
  client:    inngest,
  functions: [
    computePeriodAttainment,
    markAttainmentStale,
    notifyProgramHead,
    generateAccreditationReport,
  ],
})
