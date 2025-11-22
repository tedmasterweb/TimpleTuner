import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTuning } from '../hooks/useTuning'
import { MockAudioInputSource } from '../audio/MockAudioInputSource'

describe('useTuning', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start with isRunning false and no reading', () => {
    const source = new MockAudioInputSource(440)
    const { result } = renderHook(() =>
      useTuning(source, { targetFrequencyHz: 440 })
    )

    expect(result.current.isRunning).toBe(false)
    expect(result.current.reading).toBeNull()
  })

  it('should set isRunning to true after start', async () => {
    const source = new MockAudioInputSource(440)
    const { result } = renderHook(() =>
      useTuning(source, { targetFrequencyHz: 440 })
    )

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.isRunning).toBe(true)

    act(() => {
      result.current.stop()
    })
  })

  it('should produce a reading after audio frames are processed', async () => {
    const source = new MockAudioInputSource(440)
    const { result } = renderHook(() =>
      useTuning(source, { targetFrequencyHz: 440 })
    )

    await act(async () => {
      await result.current.start()
    })

    // Advance timers to process frames
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.reading).not.toBeNull()
    expect(result.current.reading?.frequencyHz).not.toBeNull()

    act(() => {
      result.current.stop()
    })
  })

  it('should detect frequency close to target when source matches', async () => {
    const targetFreq = 440
    const source = new MockAudioInputSource(targetFreq)
    const { result } = renderHook(() =>
      useTuning(source, { targetFrequencyHz: targetFreq })
    )

    await act(async () => {
      await result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    // The detected frequency should be close to target
    const reading = result.current.reading
    expect(reading).not.toBeNull()
    if (reading?.frequencyHz) {
      expect(reading.frequencyHz).toBeGreaterThan(targetFreq - 10)
      expect(reading.frequencyHz).toBeLessThan(targetFreq + 10)
    }

    act(() => {
      result.current.stop()
    })
  })

  it('should clear reading after stop', async () => {
    const source = new MockAudioInputSource(440)
    const { result } = renderHook(() =>
      useTuning(source, { targetFrequencyHz: 440 })
    )

    await act(async () => {
      await result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.reading).not.toBeNull()

    act(() => {
      result.current.stop()
    })

    expect(result.current.isRunning).toBe(false)
    expect(result.current.reading).toBeNull()
  })
})
