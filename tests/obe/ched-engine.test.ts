// tests/obe/ched-engine.test.ts
import { describe, it, expect } from 'vitest'
import {
  computeCloAttainment,
  computePloAttainment,
  computePeoAttainment,
} from '@/lib/obe/ched-engine'

// ─── CLO ATTAINMENT ─────────────────────────────────────────────────────────

describe('computeCloAttainment', () => {
  const base = { passingThreshold: 75, eviThreshold: 80, studentsEnrolled: 40 }

  it('returns 0 and provisional when no students scored', () => {
    const r = computeCloAttainment({ ...base, studentsScored: 0, studentsPassing: 0 })
    expect(r.attainmentPercentage).toBe(0)
    expect(r.isProvisional).toBe(true)
  })

  it('returns 100% when all scored students pass', () => {
    const r = computeCloAttainment({ ...base, studentsScored: 40, studentsPassing: 40 })
    expect(r.attainmentPercentage).toBe(100)
    expect(r.isProvisional).toBe(false)
  })

  it('returns 75% attainment correctly', () => {
    const r = computeCloAttainment({ ...base, studentsScored: 40, studentsPassing: 30 })
    expect(r.attainmentPercentage).toBe(75)
  })

  it('returns 0% when no students pass', () => {
    const r = computeCloAttainment({ ...base, studentsScored: 40, studentsPassing: 0 })
    expect(r.attainmentPercentage).toBe(0)
    expect(r.isProvisional).toBe(false)
  })

  it('marks provisional when fewer than eviThreshold% scored', () => {
    // 20/40 = 50% < 80% threshold
    const r = computeCloAttainment({ ...base, studentsScored: 20, studentsPassing: 20 })
    expect(r.isProvisional).toBe(true)
  })

  it('not provisional when exactly eviThreshold% scored', () => {
    // 32/40 = 80% = eviThreshold
    const r = computeCloAttainment({ ...base, studentsScored: 32, studentsPassing: 32 })
    expect(r.isProvisional).toBe(false)
  })

  it('handles partial passing correctly', () => {
    // 34/40 = 85% scored ≥ eviThreshold(80%) → NOT provisional. 17 pass → 50%.
    const r = computeCloAttainment({ ...base, studentsScored: 34, studentsPassing: 17 })
    expect(r.attainmentPercentage).toBe(50)
    expect(r.isProvisional).toBe(false) // 85% scored ≥ 80% EVI threshold
  })

  it('rounds to 2 decimal places', () => {
    const r = computeCloAttainment({ ...base, studentsScored: 40, studentsPassing: 33 })
    expect(r.attainmentPercentage).toBe(82.5)
  })

  it('handles 1 student enrolled and scored', () => {
    const r = computeCloAttainment({ ...base, studentsEnrolled: 1, studentsScored: 1, studentsPassing: 1 })
    expect(r.attainmentPercentage).toBe(100)
    expect(r.isProvisional).toBe(false)
  })

  it('provisional when 0 enrolled', () => {
    const r = computeCloAttainment({ ...base, studentsEnrolled: 0, studentsScored: 5, studentsPassing: 4 })
    expect(r.isProvisional).toBe(true)
  })
})

// ─── PLO ATTAINMENT ─────────────────────────────────────────────────────────

describe('computePloAttainment', () => {
  it('returns 0 provisional when no CLO results', () => {
    const r = computePloAttainment({ cloResults: [] })
    expect(r.attainmentPercentage).toBe(0)
    expect(r.isProvisional).toBe(true)
  })

  it('computes simple weighted average of two CLOs', () => {
    const r = computePloAttainment({
      cloResults: [
        { attainmentPercentage: 80, weight: 0.5, isProvisional: false },
        { attainmentPercentage: 60, weight: 0.5, isProvisional: false },
      ],
    })
    expect(r.attainmentPercentage).toBe(70)
    expect(r.isProvisional).toBe(false)
  })

  it('ignores CLOs with weight 0', () => {
    const r = computePloAttainment({
      cloResults: [
        { attainmentPercentage: 90, weight: 1,   isProvisional: false },
        { attainmentPercentage: 10, weight: 0,   isProvisional: false },
      ],
    })
    expect(r.attainmentPercentage).toBe(90)
  })

  it('marks provisional if any CLO is provisional', () => {
    const r = computePloAttainment({
      cloResults: [
        { attainmentPercentage: 80, weight: 0.5, isProvisional: false },
        { attainmentPercentage: 70, weight: 0.5, isProvisional: true  },
      ],
    })
    expect(r.isProvisional).toBe(true)
  })

  it('handles unequal weights correctly', () => {
    const r = computePloAttainment({
      cloResults: [
        { attainmentPercentage: 100, weight: 0.3, isProvisional: false },
        { attainmentPercentage: 50,  weight: 0.7, isProvisional: false },
      ],
    })
    // (100*0.3 + 50*0.7) / (0.3+0.7) = (30+35)/1 = 65
    expect(r.attainmentPercentage).toBe(65)
  })
})

// ─── PEO ATTAINMENT ─────────────────────────────────────────────────────────

describe('computePeoAttainment', () => {
  it('returns 0 provisional when no PLO results', () => {
    const r = computePeoAttainment({ ploResults: [] })
    expect(r.attainmentPercentage).toBe(0)
    expect(r.isProvisional).toBe(true)
  })

  it('computes weighted average of PLOs', () => {
    const r = computePeoAttainment({
      ploResults: [
        { attainmentPercentage: 80, weight: 0.4, isProvisional: false },
        { attainmentPercentage: 70, weight: 0.6, isProvisional: false },
      ],
    })
    // (80*0.4 + 70*0.6) / 1 = 32+42 = 74
    expect(r.attainmentPercentage).toBe(74)
    expect(r.isProvisional).toBe(false)
  })

  it('propagates provisional from PLOs', () => {
    const r = computePeoAttainment({
      ploResults: [
        { attainmentPercentage: 80, weight: 0.5, isProvisional: true  },
        { attainmentPercentage: 80, weight: 0.5, isProvisional: false },
      ],
    })
    expect(r.isProvisional).toBe(true)
  })

  it('ignores PLOs with zero weight', () => {
    const r = computePeoAttainment({
      ploResults: [
        { attainmentPercentage: 90, weight: 1, isProvisional: false },
        { attainmentPercentage: 0,  weight: 0, isProvisional: false },
      ],
    })
    expect(r.attainmentPercentage).toBe(90)
  })

  it('100% attainment when all PLOs are 100%', () => {
    const r = computePeoAttainment({
      ploResults: [
        { attainmentPercentage: 100, weight: 0.33, isProvisional: false },
        { attainmentPercentage: 100, weight: 0.33, isProvisional: false },
        { attainmentPercentage: 100, weight: 0.34, isProvisional: false },
      ],
    })
    expect(r.attainmentPercentage).toBe(100)
  })
})
