import { describe, it, expect } from 'vitest'
import { defaultNoiseHandlingConfig } from '../noiseConfig'

describe('NoiseHandlingConfig', () => {
  it('should have minVolumeThreshold between 0 and 1', () => {
    expect(defaultNoiseHandlingConfig.minVolumeThreshold).toBeGreaterThanOrEqual(0)
    expect(defaultNoiseHandlingConfig.minVolumeThreshold).toBeLessThanOrEqual(1)
  })

  it('should have minConfidenceThreshold between 0 and 1', () => {
    expect(defaultNoiseHandlingConfig.minConfidenceThreshold).toBeGreaterThanOrEqual(0)
    expect(defaultNoiseHandlingConfig.minConfidenceThreshold).toBeLessThanOrEqual(1)
  })
})
