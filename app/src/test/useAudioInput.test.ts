import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioInput } from '../hooks/useAudioInput'
import { MockAudioInputSource } from '../audio/MockAudioInputSource'

describe('useAudioInput', () => {
  it('should have isRunning false initially', () => {
    const source = new MockAudioInputSource()
    const { result } = renderHook(() => useAudioInput(source))

    expect(result.current.isRunning).toBe(false)
  })

  it('should set isRunning to true after calling start', async () => {
    const source = new MockAudioInputSource()
    const { result } = renderHook(() => useAudioInput(source))

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.isRunning).toBe(true)

    // Cleanup
    act(() => {
      result.current.stop()
    })
  })

  it('should set isRunning to false after calling stop', async () => {
    const source = new MockAudioInputSource()
    const { result } = renderHook(() => useAudioInput(source))

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.isRunning).toBe(true)

    act(() => {
      result.current.stop()
    })

    expect(result.current.isRunning).toBe(false)
  })
})
