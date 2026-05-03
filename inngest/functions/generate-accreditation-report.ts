// inngest/functions/generate-accreditation-report.ts
import { inngest } from '@/lib/inngest'
import { prisma }  from '@/lib/db'

export const generateAccreditationReport = inngest.createFunction(
  { id: 'generate-accreditation-report', name: 'Generate Accreditation Report' },
  { event: 'obe/report.generate-requested' },
  async ({ event, step }) => {
    const { reportId } = event.data as { reportId: string }

    // Step 1: Mark as processing
    await step.run('mark-processing', async () => {
      await prisma.report.update({ where: { id: reportId }, data: { status: 'processing' } })
    })

    // Step 2: Fetch report data
    const { report, program, plos, peos, attainment } = await step.run('fetch-data', async () => {
      const rpt = await prisma.report.findUniqueOrThrow({
        where:   { id: reportId },
        include: { program: { include: { gradingSystem: true, department: true } } },
      })
      const prog = rpt.program
      const [_plos, _peos, _att] = await Promise.all([
        prisma.programLearningOutcome.findMany({ where: { programId: prog.id, deletedAt: null } }),
        prisma.programEdObjective.findMany({ where: { programId: prog.id, deletedAt: null } }),
        prisma.attainmentResult.findMany({ where: { periodId: rpt.periodId }, orderBy: { computedAt: 'desc' } }),
      ])
      return { report: rpt, program: prog, plos: _plos, peos: _peos, attainment: _att }
    })

    // Step 3: Generate PDF (placeholder — in production uses @react-pdf/renderer)
    // In a real deployment this calls renderToBuffer() from react-pdf and uploads to Supabase
    const storagePath = await step.run('generate-pdf', async () => {
      // NOTE: Actual PDF rendering happens here via @react-pdf/renderer
      // For now we store a JSON manifest as the artifact
      const manifest = {
        reportType:   report.reportType,
        programName:  program.name,
        programCode:  program.code,
        generatedAt:  new Date().toISOString(),
        ploCount:     plos.length,
        peoCount:     peos.length,
        attainment:   attainment.slice(0, 20),
      }
      // Upload to Supabase storage would happen here
      return `reports/${reportId}/report.json`
    })

    // Step 4: Mark as ready
    await step.run('mark-ready', async () => {
      await prisma.report.update({ where: { id: reportId }, data: { status: 'ready', storagePath } })
      // Notify requester
      await prisma.notification.create({
        data: {
          userId:   report.requestedBy,
          title:    'Report Ready',
          body:     `Your ${report.reportType} report for ${program.name} is ready to download.`,
          type:     'report_ready',
          entityId: reportId,
        },
      })
    })

    return { ok: true, reportId, storagePath }
  },
)
