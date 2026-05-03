// tests/obe/tesda-engine.test.ts
import { describe, it, expect } from 'vitest'
import { computeUnitResult, computeQualificationResult } from '@/lib/obe/tesda-engine'

describe('computeUnitResult', () => {
  it('returns competent when all PCs are competent', () => {
    const r = computeUnitResult({
      unitId: 'u1',
      pcResults: [
        { pcId: 'pc1', result: 'competent' },
        { pcId: 'pc2', result: 'competent' },
      ],
    })
    expect(r.result).toBe('competent')
    expect(r.competent).toBe(2)
  })

  it('returns not_yet_competent when any PC fails', () => {
    const r = computeUnitResult({
      unitId: 'u1',
      pcResults: [
        { pcId: 'pc1', result: 'competent'     },
        { pcId: 'pc2', result: 'not_yet_competent' },
        { pcId: 'pc3', result: 'competent'     },
      ],
    })
    expect(r.result).toBe('not_yet_competent')
    expect(r.competent).toBe(2)
    expect(r.totalPcs).toBe(3)
  })

  it('returns not_yet_competent when no PCs exist', () => {
    const r = computeUnitResult({ unitId: 'u1', pcResults: [] })
    expect(r.result).toBe('not_yet_competent')
  })

  it('returns not_yet_competent when all PCs fail', () => {
    const r = computeUnitResult({
      unitId: 'u1',
      pcResults: [
        { pcId: 'pc1', result: 'not_yet_competent' },
        { pcId: 'pc2', result: 'not_yet_competent' },
      ],
    })
    expect(r.result).toBe('not_yet_competent')
    expect(r.competent).toBe(0)
  })

  it('counts total PCs correctly', () => {
    const r = computeUnitResult({
      unitId: 'u1',
      pcResults: Array.from({ length: 5 }, (_, i) => ({ pcId: `pc${i}`, result: 'competent' as const })),
    })
    expect(r.totalPcs).toBe(5)
    expect(r.competent).toBe(5)
  })
})

describe('computeQualificationResult', () => {
  it('returns competent when all units are competent', () => {
    const r = computeQualificationResult({
      qualificationId: 'q1',
      unitResults: [
        { unitId: 'u1', result: 'competent', totalPcs: 3, competent: 3 },
        { unitId: 'u2', result: 'competent', totalPcs: 2, competent: 2 },
      ],
    })
    expect(r.result).toBe('competent')
    expect(r.competentUnits).toBe(2)
    expect(r.competencyPercentage).toBe(100)
  })

  it('returns not_yet_competent when any unit fails', () => {
    const r = computeQualificationResult({
      qualificationId: 'q1',
      unitResults: [
        { unitId: 'u1', result: 'competent',         totalPcs: 3, competent: 3 },
        { unitId: 'u2', result: 'not_yet_competent', totalPcs: 2, competent: 1 },
      ],
    })
    expect(r.result).toBe('not_yet_competent')
    expect(r.competentUnits).toBe(1)
    expect(r.competencyPercentage).toBe(50)
  })

  it('returns 0% when no units exist', () => {
    const r = computeQualificationResult({ qualificationId: 'q1', unitResults: [] })
    expect(r.competencyPercentage).toBe(0)
    expect(r.result).toBe('not_yet_competent')
  })

  it('computes percentage correctly for 3 of 4 units', () => {
    const units = Array.from({ length: 4 }, (_, i) => ({
      unitId: `u${i}`, result: i < 3 ? ('competent' as const) : ('not_yet_competent' as const),
      totalPcs: 2, competent: i < 3 ? 2 : 0,
    }))
    const r = computeQualificationResult({ qualificationId: 'q1', unitResults: units })
    expect(r.competencyPercentage).toBe(75)
    expect(r.result).toBe('not_yet_competent')
  })

  it('rounds competency percentage to 2 decimal places', () => {
    const units = Array.from({ length: 3 }, (_, i) => ({
      unitId: `u${i}`, result: i < 1 ? ('competent' as const) : ('not_yet_competent' as const),
      totalPcs: 2, competent: i < 1 ? 2 : 0,
    }))
    const r = computeQualificationResult({ qualificationId: 'q1', unitResults: units })
    expect(r.competencyPercentage).toBe(33.33)
  })
})
