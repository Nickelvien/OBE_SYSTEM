// lib/obe/ched-engine.ts
// CHED OBE attainment computation engine.
// WARNING: Never import from tesda-engine.ts — these are separate frameworks.

export interface CloAttainmentInput {
  passingThreshold: number   // from GradingSystem.passingThreshold (DB-read, never hardcoded)
  studentsScored:   number
  studentsPassing:  number   // students whose score >= passingThreshold
  studentsEnrolled: number
  eviThreshold:     number   // Evidence-of-Impact threshold (80% by default from DB)
}

export interface CloAttainmentOutput {
  attainmentPercentage: number
  isProvisional:        boolean  // true if studentsScored / studentsEnrolled < eviThreshold
}

/**
 * CLO Attainment = (studentsPassingCLO / studentsScoredForCLO) * 100
 * Provisional if fewer than eviThreshold% of enrolled students have scores.
 */
export function computeCloAttainment(input: CloAttainmentInput): CloAttainmentOutput {
  if (input.studentsScored === 0) {
    return { attainmentPercentage: 0, isProvisional: true }
  }

  const attainmentPercentage = (input.studentsPassing / input.studentsScored) * 100
  const scoredRatio          = input.studentsEnrolled > 0
    ? input.studentsScored / input.studentsEnrolled
    : 0
  const isProvisional = scoredRatio < (input.eviThreshold / 100)

  return { attainmentPercentage: Math.round(attainmentPercentage * 100) / 100, isProvisional }
}

export interface PloAttainmentInput {
  cloResults: Array<{
    attainmentPercentage: number
    weight:              number  // PLO-CLO mapping weight (0–1)
    isProvisional:       boolean
  }>
}

export interface PloAttainmentOutput {
  attainmentPercentage: number
  isProvisional:        boolean
}

/**
 * PLO Attainment = weighted average of eligible CLO attainments.
 * Uses only CLOs with weight > 0. Provisional if any contributing CLO is provisional.
 */
export function computePloAttainment(input: PloAttainmentInput): PloAttainmentOutput {
  const eligible = input.cloResults.filter((c) => c.weight > 0)
  if (eligible.length === 0) {
    return { attainmentPercentage: 0, isProvisional: true }
  }

  const totalWeight = eligible.reduce((sum, c) => sum + c.weight, 0)
  const weighted    = eligible.reduce((sum, c) => sum + c.attainmentPercentage * c.weight, 0)

  return {
    attainmentPercentage: Math.round((weighted / totalWeight) * 100) / 100,
    isProvisional:        eligible.some((c) => c.isProvisional),
  }
}

export interface PeoAttainmentInput {
  ploResults: Array<{
    attainmentPercentage: number
    weight:              number  // PEO-PLO link weight (0–1)
    isProvisional:       boolean
  }>
}

export interface PeoAttainmentOutput {
  attainmentPercentage: number
  isProvisional:        boolean
}

/**
 * PEO Attainment = weighted average of linked PLO attainments.
 */
export function computePeoAttainment(input: PeoAttainmentInput): PeoAttainmentOutput {
  const eligible = input.ploResults.filter((p) => p.weight > 0)
  if (eligible.length === 0) {
    return { attainmentPercentage: 0, isProvisional: true }
  }

  const totalWeight = eligible.reduce((sum, p) => sum + p.weight, 0)
  const weighted    = eligible.reduce((sum, p) => sum + p.attainmentPercentage * p.weight, 0)

  return {
    attainmentPercentage: Math.round((weighted / totalWeight) * 100) / 100,
    isProvisional:        eligible.some((p) => p.isProvisional),
  }
}
