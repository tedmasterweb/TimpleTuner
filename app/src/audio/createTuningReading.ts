import { TuningReading } from '../tuningReading'
import { NoiseHandlingConfig } from '../noiseConfig'

// Cents threshold for considering a note "in tune"
const IN_TUNE_CENTS_THRESHOLD = 10

/**
 * Calculate cents difference between two frequencies
 * Cents = 1200 * log2(f1/f2)
 */
function calculateCentsOff(detectedHz: number, targetHz: number): number {
  return 1200 * Math.log2(detectedHz / targetHz)
}

export function createTuningReading(
  detectedFrequencyHz: number | null,
  targetFrequencyHz: number,
  noiseConfig: NoiseHandlingConfig,
  confidence: number,
  volume: number
): TuningReading {
  // No frequency detected
  if (detectedFrequencyHz === null) {
    return {
      frequencyHz: null,
      centsOff: null,
      status: 'awaiting',
      confidence,
      volume,
    }
  }

  // Volume too low
  if (volume < noiseConfig.minVolumeThreshold) {
    return {
      frequencyHz: detectedFrequencyHz,
      centsOff: calculateCentsOff(detectedFrequencyHz, targetFrequencyHz),
      status: 'awaiting',
      confidence,
      volume,
    }
  }

  // Confidence too low (noisy signal)
  if (confidence < noiseConfig.minConfidenceThreshold) {
    return {
      frequencyHz: detectedFrequencyHz,
      centsOff: calculateCentsOff(detectedFrequencyHz, targetFrequencyHz),
      status: 'noisy',
      confidence,
      volume,
    }
  }

  // Calculate cents offset
  const centsOff = calculateCentsOff(detectedFrequencyHz, targetFrequencyHz)

  // Determine tuning status based on cents offset
  let status: TuningReading['status']
  if (Math.abs(centsOff) <= IN_TUNE_CENTS_THRESHOLD) {
    status = 'in_tune'
  } else if (centsOff > 0) {
    status = 'sharp'
  } else {
    status = 'flat'
  }

  return {
    frequencyHz: detectedFrequencyHz,
    centsOff,
    status,
    confidence,
    volume,
  }
}
