import { describe, it, expect } from 'vitest'
import { closestTimpleString } from '../audio/closestTimpleString'
import { TIMPLE_TUNING } from '../tuning'

describe('closestTimpleString', () => {
  it('should return String 1 (G4 - 392 Hz) for frequency near 392 Hz', () => {
    const result = closestTimpleString(390, TIMPLE_TUNING)
    expect(result.id).toBe('string-1')

    const result2 = closestTimpleString(395, TIMPLE_TUNING)
    expect(result2.id).toBe('string-1')
  })

  it('should return String 2 (C4 - 261.63 Hz) for frequency near 262 Hz', () => {
    const result = closestTimpleString(260, TIMPLE_TUNING)
    expect(result.id).toBe('string-2')

    const result2 = closestTimpleString(265, TIMPLE_TUNING)
    expect(result2.id).toBe('string-2')
  })

  it('should return String 3 (E4 - 329.63 Hz) for frequency near 330 Hz', () => {
    const result = closestTimpleString(328, TIMPLE_TUNING)
    expect(result.id).toBe('string-3')

    const result2 = closestTimpleString(332, TIMPLE_TUNING)
    expect(result2.id).toBe('string-3')
  })

  it('should return String 4 (A3 - 220 Hz) for frequency near 220 Hz', () => {
    const result = closestTimpleString(218, TIMPLE_TUNING)
    expect(result.id).toBe('string-4')

    const result2 = closestTimpleString(222, TIMPLE_TUNING)
    expect(result2.id).toBe('string-4')
  })

  it('should return String 5 (D4 - 293.66 Hz) for frequency near 294 Hz', () => {
    const result = closestTimpleString(292, TIMPLE_TUNING)
    expect(result.id).toBe('string-5')

    const result2 = closestTimpleString(296, TIMPLE_TUNING)
    expect(result2.id).toBe('string-5')
  })

  it('should always return one of the 5 tuning entries', () => {
    const testFrequencies = [100, 200, 300, 400, 500, 600]

    for (const freq of testFrequencies) {
      const result = closestTimpleString(freq, TIMPLE_TUNING)
      expect(TIMPLE_TUNING).toContain(result)
    }
  })

  it('should return exact match when frequency equals target', () => {
    for (const string of TIMPLE_TUNING) {
      const result = closestTimpleString(string.frequencyHz, TIMPLE_TUNING)
      expect(result.id).toBe(string.id)
    }
  })
})
