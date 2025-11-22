import { TuningReading } from '../tuningReading'
import { NoiseHandlingConfig } from '../noiseConfig'

// Cents threshold for considering a note "in tune"
const IN_TUNE_CENTS_THRESHOLD = 10

// Max cents offset to respond to (ignore sounds far from target frequency)
// 200 cents = 2 semitones
const MAX_CENTS_OFF_THRESHOLD = 200

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

  // Volume too low - don't move meter
  if (volume < noiseConfig.minVolumeThreshold) {
    return {
      frequencyHz: detectedFrequencyHz,
      centsOff: null,
      status: 'awaiting',
      confidence,
      volume,
    }
  }

  // Confidence too low (noisy signal) - don't move meter
  if (confidence < noiseConfig.minConfidenceThreshold) {
    return {
      frequencyHz: detectedFrequencyHz,
      centsOff: null,
      status: 'noisy',
      confidence,
      volume,
    }
  }

  // Calculate cents offset
  const centsOff = calculateCentsOff(detectedFrequencyHz, targetFrequencyHz)

  // Ignore sounds too far from target frequency (not the string we're tuning)
  if (Math.abs(centsOff) > MAX_CENTS_OFF_THRESHOLD) {
    return {
      frequencyHz: detectedFrequencyHz,
      centsOff: null,
      status: 'awaiting',
      confidence,
      volume,
    }
  }

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
