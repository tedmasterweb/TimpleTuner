import { describe, it, expect } from 'vitest'
import { createTuningReading } from '../audio/createTuningReading'
import { NoiseHandlingConfig } from '../noiseConfig'

const defaultConfig: NoiseHandlingConfig = {
  minVolumeThreshold: 0.1,
  minConfidenceThreshold: 0.7,
}

describe('createTuningReading', () => {
  it('should return in_tune with centsOff near 0 when frequency equals target', () => {
    const reading = createTuningReading(440, 440, defaultConfig, 0.9, 0.5)

    expect(reading.status).toBe('in_tune')
    expect(reading.centsOff).toBeCloseTo(0, 1)
    expect(reading.frequencyHz).toBe(440)
  })

  it('should return sharp with positive centsOff when frequency is above target', () => {
    // +15 cents above 440 Hz ≈ 443.8 Hz
    const sharpFrequency = 440 * Math.pow(2, 15 / 1200)
    const reading = createTuningReading(sharpFrequency, 440, defaultConfig, 0.9, 0.5)

    expect(reading.status).toBe('sharp')
    expect(reading.centsOff).toBeGreaterThan(0)
    expect(reading.centsOff).toBeCloseTo(15, 1)
  })

  it('should return flat with negative centsOff when frequency is below target', () => {
    // -15 cents below 440 Hz ≈ 436.2 Hz
    const flatFrequency = 440 * Math.pow(2, -15 / 1200)
    const reading = createTuningReading(flatFrequency, 440, defaultConfig, 0.9, 0.5)

    expect(reading.status).toBe('flat')
    expect(reading.centsOff).toBeLessThan(0)
    expect(reading.centsOff).toBeCloseTo(-15, 1)
  })

  it('should return awaiting when detectedFrequencyHz is null', () => {
    const reading = createTuningReading(null, 440, defaultConfig, 0.9, 0.5)

    expect(reading.status).toBe('awaiting')
    expect(reading.frequencyHz).toBeNull()
    expect(reading.centsOff).toBeNull()
  })

  it('should return awaiting with null centsOff when volume is below threshold', () => {
    const reading = createTuningReading(440, 440, defaultConfig, 0.9, 0.05)

    expect(reading.status).toBe('awaiting')
    expect(reading.volume).toBe(0.05)
    expect(reading.centsOff).toBeNull()
  })

  it('should return noisy with null centsOff when confidence is below threshold', () => {
    const reading = createTuningReading(440, 440, defaultConfig, 0.5, 0.5)

    expect(reading.status).toBe('noisy')
    expect(reading.confidence).toBe(0.5)
    expect(reading.centsOff).toBeNull()
  })

  it('should return noisy with null centsOff even with correct frequency when confidence is low', () => {
    const reading = createTuningReading(440, 440, defaultConfig, 0.3, 0.5)

    expect(reading.status).toBe('noisy')
    expect(reading.frequencyHz).toBe(440)
    expect(reading.centsOff).toBeNull()
  })

  it('should include confidence and volume in all readings', () => {
    const reading = createTuningReading(440, 440, defaultConfig, 0.85, 0.6)

    expect(reading.confidence).toBe(0.85)
    expect(reading.volume).toBe(0.6)
  })

  it('should include detectedString when provided', () => {
    const timpleString = { id: 'string-4', label: 'String 4 (A)', note: 'A4', frequencyHz: 440 }
    const reading = createTuningReading(440, 440, defaultConfig, 0.9, 0.5, timpleString)

    expect(reading.detectedString).toEqual(timpleString)
  })

  it('should default detectedString to null when not provided', () => {
    const reading = createTuningReading(440, 440, defaultConfig, 0.9, 0.5)

    expect(reading.detectedString).toBeNull()
  })

  it('should set detectedString to null on awaiting/noisy readings', () => {
    const timpleString = { id: 'string-4', label: 'String 4 (A)', note: 'A4', frequencyHz: 440 }

    // null frequency
    const awaitingReading = createTuningReading(null, 440, defaultConfig, 0.9, 0.5, timpleString)
    expect(awaitingReading.detectedString).toBeNull()

    // low volume
    const lowVolReading = createTuningReading(440, 440, defaultConfig, 0.9, 0.05, timpleString)
    expect(lowVolReading.detectedString).toBeNull()

    // low confidence
    const noisyReading = createTuningReading(440, 440, defaultConfig, 0.3, 0.5, timpleString)
    expect(noisyReading.detectedString).toBeNull()
  })
})
