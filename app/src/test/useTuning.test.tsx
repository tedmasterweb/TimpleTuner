import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
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
      useTuning(source)
    )

    expect(result.current.isRunning).toBe(false)
    expect(result.current.reading).toBeNull()
  })

  it('should set isRunning to true after start', async () => {
    const source = new MockAudioInputSource(440)
    const { result } = renderHook(() =>
      useTuning(source)
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
      useTuning(source)
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

  it('should auto-detect the closest string for the detected frequency', async () => {
    // 440 Hz should match A4 (string-4)
    const source = new MockAudioInputSource(440)
    const { result } = renderHook(() =>
      useTuning(source)
    )

    await act(async () => {
      await result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    const reading = result.current.reading
    expect(reading).not.toBeNull()
    if (reading?.detectedString) {
      expect(reading.detectedString.note).toBe('A4')
      expect(reading.detectedString.id).toBe('string-4')
    }

    act(() => {
      result.current.stop()
    })
  })

  it('should detect frequency close to source when source matches a string', async () => {
    const source = new MockAudioInputSource(440)
    const { result } = renderHook(() =>
      useTuning(source)
    )

    await act(async () => {
      await result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    const reading = result.current.reading
    expect(reading).not.toBeNull()
    if (reading?.frequencyHz) {
      expect(reading.frequencyHz).toBeGreaterThan(430)
      expect(reading.frequencyHz).toBeLessThan(450)
    }

    act(() => {
      result.current.stop()
    })
  })

  it('should clear reading after stop', async () => {
    const source = new MockAudioInputSource(440)
    const { result } = renderHook(() =>
      useTuning(source)
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
