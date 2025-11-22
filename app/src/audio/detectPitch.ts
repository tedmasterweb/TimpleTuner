/**
 * Detect pitch using autocorrelation algorithm (YIN-inspired)
 * Returns detected frequency in Hz, or null if no clear pitch detected
 */
export function detectPitch(samples: Float32Array, sampleRate: number): number | null {
  const bufferSize = samples.length

  // Check for silence
  let rms = 0
  for (let i = 0; i < bufferSize; i++) {
    rms += samples[i] * samples[i]
  }
  rms = Math.sqrt(rms / bufferSize)

  if (rms < 0.01) {
    return null // Too quiet, likely silence
  }

  // Use normalized square difference function (similar to YIN algorithm)
  const maxLag = Math.floor(bufferSize / 2)
  const nsdf = new Float32Array(maxLag)

  for (let lag = 0; lag < maxLag; lag++) {
    let acf = 0 // Autocorrelation
    let energy1 = 0
    let energy2 = 0

    for (let i = 0; i < maxLag; i++) {
      acf += samples[i] * samples[i + lag]
      energy1 += samples[i] * samples[i]
      energy2 += samples[i + lag] * samples[i + lag]
    }

    // Normalized square difference function
    if (energy1 + energy2 > 0) {
      nsdf[lag] = 2 * acf / (energy1 + energy2)
    } else {
      nsdf[lag] = 0
    }
  }

  // Find peaks in NSDF
  // Start looking after lag corresponding to highest reasonable frequency (~2000 Hz)
  const minLag = Math.floor(sampleRate / 2000)
  // Stop looking at lag corresponding to lowest reasonable frequency (~50 Hz)
  const maxSearchLag = Math.min(Math.floor(sampleRate / 50), maxLag - 1)

  let bestLag = -1
  let bestValue = 0
  const threshold = 0.3

  // Find first peak that crosses threshold
  let wasNegative = false
  for (let lag = minLag; lag < maxSearchLag; lag++) {
    if (nsdf[lag] < 0) {
      wasNegative = true
    }

    // Look for peak after zero crossing
    if (wasNegative && nsdf[lag] > threshold) {
      // Find local maximum
      while (lag + 1 < maxSearchLag && nsdf[lag + 1] > nsdf[lag]) {
        lag++
      }

      if (nsdf[lag] > bestValue) {
        bestValue = nsdf[lag]
        bestLag = lag
        break // Take first good peak
      }
    }
  }

  if (bestLag <= 0 || bestValue < threshold) {
    return null
  }

  // Parabolic interpolation for better precision
  if (bestLag > 0 && bestLag < maxLag - 1) {
    const prev = nsdf[bestLag - 1]
    const curr = nsdf[bestLag]
    const next = nsdf[bestLag + 1]

    const denom = 2 * (prev - 2 * curr + next)
    if (Math.abs(denom) > 0.0001) {
      const shift = (prev - next) / denom
      if (Math.abs(shift) < 1) {
        bestLag = bestLag + shift
      }
    }
  }

  const frequency = sampleRate / bestLag

  return frequency
}
