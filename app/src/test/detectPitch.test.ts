import { describe, it, expect } from 'vitest'
import { detectPitch } from '../audio/detectPitch'

function generateSineWave(frequency: number, sampleRate: number, duration: number): Float32Array {
  const numSamples = Math.floor(sampleRate * duration)
  const samples = new Float32Array(numSamples)
  const angularFrequency = (2 * Math.PI * frequency) / sampleRate

  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.sin(angularFrequency * i)
  }

  return samples
}

function generateSilence(numSamples: number): Float32Array {
  return new Float32Array(numSamples)
}

function generateNoise(numSamples: number): Float32Array {
  const samples = new Float32Array(numSamples)
  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.random() * 2 - 1
  }
  return samples
}

describe('detectPitch', () => {
  const sampleRate = 44100

  it('should detect 440 Hz sine wave within ±2 Hz', () => {
    const samples = generateSineWave(440, sampleRate, 0.1)
    const detected = detectPitch(samples, sampleRate)

    expect(detected).not.toBeNull()
    expect(detected).toBeGreaterThanOrEqual(438)
    expect(detected).toBeLessThanOrEqual(442)
  })

  it('should detect 392 Hz (G4) sine wave within ±2 Hz', () => {
    const samples = generateSineWave(392, sampleRate, 0.1)
    const detected = detectPitch(samples, sampleRate)

    expect(detected).not.toBeNull()
    expect(detected).toBeGreaterThanOrEqual(390)
    expect(detected).toBeLessThanOrEqual(394)
  })

  it('should return null for silence', () => {
    const samples = generateSilence(4096)
    const detected = detectPitch(samples, sampleRate)

    expect(detected).toBeNull()
  })

  it('should return null for random noise', () => {
    const samples = generateNoise(4096)
    const detected = detectPitch(samples, sampleRate)

    // Noise should either return null or an unreliable result
    // For our implementation, we expect null due to low confidence
    expect(detected).toBeNull()
  })

  it('should detect lower frequencies like 220 Hz (A3)', () => {
    const samples = generateSineWave(220, sampleRate, 0.1)
    const detected = detectPitch(samples, sampleRate)

    expect(detected).not.toBeNull()
    expect(detected).toBeGreaterThanOrEqual(218)
    expect(detected).toBeLessThanOrEqual(222)
  })
})
