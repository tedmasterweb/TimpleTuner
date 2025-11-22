import { describe, it, expect } from 'vitest'
import { TuningReading, TuningStatus } from '../tuningReading'

describe('TuningReading', () => {
  const statuses: TuningStatus[] = ['awaiting', 'in_tune', 'sharp', 'flat', 'noisy']

  it('should allow creating TuningReading with each possible status', () => {
    statuses.forEach((status) => {
      const reading: TuningReading = {
        frequencyHz: 440,
        centsOff: 0,
        status,
        confidence: 0.9,
        volume: 0.5,
      }

      expect(reading.status).toBe(status)
      expect(typeof reading.confidence).toBe('number')
      expect(typeof reading.volume).toBe('number')
    })
  })

  it('should have confidence within valid range [0, 1]', () => {
    const validReadings: TuningReading[] = [
      { frequencyHz: 440, centsOff: 0, status: 'in_tune', confidence: 0, volume: 0.5 },
      { frequencyHz: 440, centsOff: 0, status: 'in_tune', confidence: 0.5, volume: 0.5 },
      { frequencyHz: 440, centsOff: 0, status: 'in_tune', confidence: 1, volume: 0.5 },
    ]

    validReadings.forEach((reading) => {
      expect(reading.confidence).toBeGreaterThanOrEqual(0)
      expect(reading.confidence).toBeLessThanOrEqual(1)
    })
  })

  it('should have volume within valid range [0, 1]', () => {
    const validReadings: TuningReading[] = [
      { frequencyHz: 440, centsOff: 0, status: 'in_tune', confidence: 0.9, volume: 0 },
      { frequencyHz: 440, centsOff: 0, status: 'in_tune', confidence: 0.9, volume: 0.5 },
      { frequencyHz: 440, centsOff: 0, status: 'in_tune', confidence: 0.9, volume: 1 },
    ]

    validReadings.forEach((reading) => {
      expect(reading.volume).toBeGreaterThanOrEqual(0)
      expect(reading.volume).toBeLessThanOrEqual(1)
    })
  })
})
