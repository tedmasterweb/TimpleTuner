import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MockAudioInputSource } from '../audio/MockAudioInputSource'

describe('MockAudioInputSource', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call callback with samples after start', async () => {
    const source = new MockAudioInputSource(440)
    const receivedFrames: Float32Array[] = []

    source.onFrame((samples) => {
      receivedFrames.push(samples)
    })

    await source.start()

    // Advance timers to trigger at least one callback
    vi.advanceTimersByTime(100)

    expect(receivedFrames.length).toBeGreaterThan(0)
    expect(receivedFrames[0]).toBeInstanceOf(Float32Array)
    expect(receivedFrames[0].length).toBe(source.bufferSize)

    source.stop()
  })

  it('should stop calling callback after stop is invoked', async () => {
    const source = new MockAudioInputSource(440)
    const receivedFrames: Float32Array[] = []

    source.onFrame((samples) => {
      receivedFrames.push(samples)
    })

    await source.start()
    vi.advanceTimersByTime(100)

    const countAfterStart = receivedFrames.length
    expect(countAfterStart).toBeGreaterThan(0)

    source.stop()

    vi.advanceTimersByTime(100)

    expect(receivedFrames.length).toBe(countAfterStart)
  })

  it('should generate sine wave samples', async () => {
    const source = new MockAudioInputSource(440)
    let samples: Float32Array | null = null

    source.onFrame((s) => {
      samples = s
    })

    await source.start()
    vi.advanceTimersByTime(100)
    source.stop()

    expect(samples).not.toBeNull()
    // Sine wave values should be between -1 and 1
    samples!.forEach((sample) => {
      expect(sample).toBeGreaterThanOrEqual(-1)
      expect(sample).toBeLessThanOrEqual(1)
    })
  })
})
