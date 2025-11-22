/**
 * Calculate RMS volume from samples (0-1 range)
 */
export function calculateVolume(samples: Float32Array): number {
  let sum = 0
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i]
  }
  return Math.sqrt(sum / samples.length)
}

/**
 * Estimate confidence based on signal clarity
 * Returns a value between 0 and 1
 */
export function estimateConfidence(
  samples: Float32Array,
  detectedFrequency: number | null
): number {
  if (detectedFrequency === null) return 0

  const volume = calculateVolume(samples)
  if (volume < 0.01) return 0

  // Simple heuristic: higher volume correlates with cleaner signal
  // A pure tone at good volume should have high confidence
  // This is a simplified approach - real implementations might use
  // harmonic analysis or autocorrelation peak strength
  return Math.min(1, volume * 2 + 0.5)
}
