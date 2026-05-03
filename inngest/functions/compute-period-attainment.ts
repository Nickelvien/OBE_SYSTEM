// inngest/functions/compute-period-attainment.ts
import { inngest }                                   from '@/lib/inngest'
import { prisma }                                    from '@/lib/db'
import { computeCloAttainment, computePloAttainment, computePeoAttainment } from '@/lib/obe/ched-engine'

export const computePeriodAttainment = inngest.createFunction(
  { id: 'compute-period-attainment', name: 'Compute Period Attainment' },
  { event: 'obe/period.compute-requested' },
  async ({ event, step }) => {
    const { programId, periodId } = event.data as { programId: string; periodId: string }

    // Step 1: Fetch latest snapshot + grading system thresholds
    const { snapshot, program } = await step.run('fetch-snapshot', async () => {
      const prog = await prisma.program.findUniqueOrThrow({
        where:   { id: programId },
        include: { gradingSystem: true },
      })
      const snap = await prisma.curriculumSnapshot.findFirst({
        where:   { programId },
        orderBy: { effectiveFrom: 'desc' },
      })
      return { snapshot: snap, program: prog }
    })

    if (!snapshot) throw new Error(`No curriculum snapshot found for program ${programId}`)

    const passingThreshold = Number(program.gradingSystem.passingThreshold)
    const eviThreshold     = Number(program.gradingSystem.eviThreshold)
    const cowThreshold     = Number(program.gradingSystem.cowThreshold)

    // Step 2: Compute CLO attainment
    const cloResults = await step.run('compute-clo-attainment', async () => {
      const courses = await prisma.course.findMany({
        where:   { programId, deletedAt: null },
        include: {
          clos:        { where: { deletedAt: null }, include: { ploMappings: true } },
          assessments: { where: { periodId, deletedAt: null }, include: { scores: true, cloAlignments: true } },
          enrollments: { where: { periodId, status: 'enrolled' } },
        },
      })

      const results: Array<{ cloId: string; attainmentPercentage: number; isProvisional: boolean; ploMappings: { ploId: string; weight: number }[] }> = []

      for (const course of courses) {
        const studentsEnrolled = course.enrollments.length
        for (const clo of course.clos) {
          const relevantAssessments = course.assessments.filter((a) => a.cloAlignments.some((al) => al.cloId === clo.id))
          let studentsPassing = 0
          let studentsScored  = 0

          for (const assessment of relevantAssessments) {
            const maxScore = Number(assessment.maxScore)
            for (const score of assessment.scores) {
              if (score.isExcused) continue
              if (score.rawScore !== null) {
                studentsScored++
                const pct = (Number(score.rawScore) / maxScore) * 100
                if (pct >= passingThreshold) studentsPassing++
              }
            }
          }

          const output = computeCloAttainment({ passingThreshold, studentsScored, studentsPassing, studentsEnrolled, eviThreshold })
          results.push({ cloId: clo.id, ...output, ploMappings: clo.ploMappings.map((m) => ({ ploId: m.ploId, weight: Number(m.weight) })) })
        }
      }
      return results
    })

    // Step 3: Compute PLO attainment
    const ploResults = await step.run('compute-plo-attainment', async () => {
      const plos = await prisma.programLearningOutcome.findMany({
        where:   { programId, deletedAt: null },
        include: { peoLinks: { include: { peo: true } } },
      })
      return plos.map((plo) => {
        const cloInputs = cloResults
          .filter((c) => c.ploMappings.some((m) => m.ploId === plo.id))
          .map((c) => {
            const mapping = c.ploMappings.find((m) => m.ploId === plo.id)!
            return { attainmentPercentage: c.attainmentPercentage, weight: mapping.weight, isProvisional: c.isProvisional }
          })
        const output = computePloAttainment({ cloResults: cloInputs })
        return { ploId: plo.id, ...output, peoLinks: plo.peoLinks.map((l) => ({ peoId: l.peoId, weight: Number(l.weight) })) }
      })
    })

    // Step 4: Compute PEO attainment
    const peoResults = await step.run('compute-peo-attainment', async () => {
      const peos = await prisma.programEdObjective.findMany({ where: { programId, deletedAt: null } })
      return peos.map((peo) => {
        const ploInputs = ploResults
          .filter((p) => p.peoLinks.some((l) => l.peoId === peo.id))
          .map((p) => {
            const link = p.peoLinks.find((l) => l.peoId === peo.id)!
            return { attainmentPercentage: p.attainmentPercentage, weight: link.weight, isProvisional: p.isProvisional }
          })
        const output = computePeoAttainment({ ploResults: ploInputs })
        return { peoId: peo.id, ...output }
      })
    })

    // Step 5: Upsert all results
    await step.run('upsert-results', async () => {
      const now = new Date()
      const upserts = [
        ...cloResults.map((c) => ({
          snapshotId:           snapshot.id, periodId, entityType: 'clo', entityId: c.cloId,
          attainmentPercentage: c.attainmentPercentage, isProvisional: c.isProvisional,
          isStale: false, computedAt: now,
        })),
        ...ploResults.map((p) => ({
          snapshotId:           snapshot.id, periodId, entityType: 'plo', entityId: p.ploId,
          attainmentPercentage: p.attainmentPercentage, isProvisional: p.isProvisional,
          isStale: false, computedAt: now,
        })),
        ...peoResults.map((p) => ({
          snapshotId:           snapshot.id, periodId, entityType: 'peo', entityId: p.peoId,
          attainmentPercentage: p.attainmentPercentage, isProvisional: p.isProvisional,
          isStale: false, computedAt: now,
        })),
      ]
      for (const u of upserts) {
        await prisma.attainmentResult.upsert({
          where:  { id: (await prisma.attainmentResult.findFirst({ where: { snapshotId: u.snapshotId, periodId, entityType: u.entityType, entityId: u.entityId } }))?.id ?? '' },
          create: u,
          update: { attainmentPercentage: u.attainmentPercentage, isProvisional: u.isProvisional, isStale: false, computedAt: now },
        }).catch(() => prisma.attainmentResult.create({ data: u }))
      }
    })

    // Step 6: Check thresholds & fire CQI events
    await step.run('check-thresholds', async () => {
      const breached = ploResults.filter((p) => !p.isProvisional && p.attainmentPercentage < cowThreshold)
      for (const plo of breached) {
        await inngest.send({
          name: 'obe/cqi.threshold-breached',
          data: { programId, periodId, entityType: 'plo', entityId: plo.ploId, attainment: plo.attainmentPercentage, threshold: cowThreshold },
        })
      }
    })

    return { ok: true, cloCount: cloResults.length, ploCount: ploResults.length, peoCount: peoResults.length }
  },
)
