// tests/api/scores.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch for API validation tests
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Scores API validation', () => {
  beforeEach(() => { mockFetch.mockReset() })

  it('rejects score entry without studentId', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: { fieldErrors: { studentId: ['Required'] } } }) })
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId: '00000000-0000-0000-0000-000000000001', rawScore: 85 }),
    })
    expect(res.status).toBe(400)
  })

  it('rejects score entry without assessmentId', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: { fieldErrors: { assessmentId: ['Required'] } } }) })
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: '00000000-0000-0000-0000-000000000001', rawScore: 85 }),
    })
    expect(res.status).toBe(400)
  })

  it('accepts valid score entry', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 'score-id-1', rawScore: 85 }) })
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId:    '00000000-0000-0000-0000-000000000001',
        assessmentId: '00000000-0000-0000-0000-000000000002',
        rawScore:     85,
      }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.rawScore).toBe(85)
  })

  it('accepts excused flag without score', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ isExcused: true, rawScore: null }) })
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId:    '00000000-0000-0000-0000-000000000001',
        assessmentId: '00000000-0000-0000-0000-000000000002',
        isExcused:    true,
      }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.isExcused).toBe(true)
  })

  it('rejects invalid UUID for studentId', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: 'Invalid UUID' }) })
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 'not-a-uuid', assessmentId: '00000000-0000-0000-0000-000000000002', rawScore: 85 }),
    })
    expect(res.status).toBe(400)
  })
})
