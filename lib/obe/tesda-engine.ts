// lib/obe/tesda-engine.ts
// TESDA competency assessment engine.
// WARNING: Never import from ched-engine.ts — these are separate frameworks.
// TESDA uses competency-based assessment (Competent / Not Yet Competent).

export type CompetencyResult = 'competent' | 'not_yet_competent'

export interface PcResult {
  pcId:   string
  result: CompetencyResult
}

export interface UnitResultInput {
  unitId:    string
  pcResults: PcResult[]
}

export interface UnitResultOutput {
  unitId:    string
  result:    CompetencyResult
  totalPcs:  number
  competent: number
}

/**
 * Competency Unit Result:
 * A unit is COMPETENT only when ALL performance criteria are rated Competent.
 * A single Not Yet Competent PC makes the entire unit Not Yet Competent.
 */
export function computeUnitResult(input: UnitResultInput): UnitResultOutput {
  const competent = input.pcResults.filter((p) => p.result === 'competent').length
  const result: CompetencyResult =
    input.pcResults.length > 0 && competent === input.pcResults.length
      ? 'competent'
      : 'not_yet_competent'

  return { unitId: input.unitId, result, totalPcs: input.pcResults.length, competent }
}

export interface QualificationResultInput {
  qualificationId: string
  unitResults:     UnitResultOutput[]
}

export interface QualificationResultOutput {
  qualificationId:      string
  result:               CompetencyResult
  totalUnits:           number
  competentUnits:       number
  competencyPercentage: number
}

/**
 * Qualification Result:
 * A qualification is COMPETENT only when ALL units are Competent.
 * Also computes competency percentage = competentUnits / totalUnits * 100.
 */
export function computeQualificationResult(input: QualificationResultInput): QualificationResultOutput {
  const competentUnits       = input.unitResults.filter((u) => u.result === 'competent').length
  const totalUnits           = input.unitResults.length
  const competencyPercentage = totalUnits > 0 ? (competentUnits / totalUnits) * 100 : 0
  const result: CompetencyResult =
    totalUnits > 0 && competentUnits === totalUnits ? 'competent' : 'not_yet_competent'

  return {
    qualificationId:      input.qualificationId,
    result,
    totalUnits,
    competentUnits,
    competencyPercentage: Math.round(competencyPercentage * 100) / 100,
  }
}
