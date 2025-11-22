import { describe, it, expect } from 'vitest'
import { TIMPLE_TUNING } from '../tuning'

describe('Timple tuning constants', () => {
  it('should have exactly 5 strings', () => {
    expect(TIMPLE_TUNING).toHaveLength(5)
  })

  it('should have all required properties defined for each string', () => {
    TIMPLE_TUNING.forEach((string) => {
      expect(string.id).toBeDefined()
      expect(string.label).toBeDefined()
      expect(string.note).toBeDefined()
      expect(string.frequencyHz).toBeDefined()
    })
  })

  it('should have positive frequency values for all strings', () => {
    TIMPLE_TUNING.forEach((string) => {
      expect(typeof string.frequencyHz).toBe('number')
      expect(string.frequencyHz).toBeGreaterThan(0)
    })
  })
})
