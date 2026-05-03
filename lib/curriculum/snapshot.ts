// lib/curriculum/snapshot.ts
// Auto-snapshot logic: captures the full OBE hierarchy before any PLO/CLO/mapping change.

import { prisma } from '@/lib/db'

interface SnapshotPayload {
  programId: string
  createdBy: string
}

/**
 * Creates a curriculum snapshot for the given program.
 * Call this BEFORE saving any change to PLOs, CLOs, or mappings.
 * The snapshot captures all PLOs, PEOs, CLOs, and curriculum map entries
 * at the moment just before the mutation.
 */
export async function createCurriculumSnapshot(payload: SnapshotPayload): Promise<string> {
  const { programId, createdBy } = payload

  const [peos, plos, courses] = await Promise.all([
    prisma.programEdObjective.findMany({ where: { programId, deletedAt: null } }),
    prisma.programLearningOutcome.findMany({
      where: { programId, deletedAt: null },
      include: { cloMappings: true, peoLinks: true, curriculumMap: true },
    }),
    prisma.course.findMany({
      where: { programId, deletedAt: null },
      include: { clos: { include: { ploMappings: true } }, curriculumMap: true },
    }),
  ])

  const snapshotData = { peos, plos, courses, capturedAt: new Date().toISOString() }

  const snapshot = await prisma.curriculumSnapshot.create({
    data: {
      programId,
      createdBy,
      effectiveFrom: new Date(),
      snapshotData,
    },
  })

  return snapshot.id
}

/**
 * Closes the previous snapshot (sets effectiveTo) when a new snapshot is created.
 */
export async function closePreviousSnapshot(programId: string, newSnapshotId: string) {
  const previous = await prisma.curriculumSnapshot.findFirst({
    where:   { programId, id: { not: newSnapshotId }, effectiveTo: null },
    orderBy: { effectiveFrom: 'desc' },
  })
  if (previous) {
    await prisma.curriculumSnapshot.update({
      where: { id: previous.id },
      data:  { effectiveTo: new Date() },
    })
  }
}
