import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { TIMPLE_TUNING } from '../tuning'

describe('useAutoAdvance', () => {
  it('should not advance when disabled', () => {
    const onAdvance = vi.fn()

    const { rerender } = renderHook(
      ({ status }) =>
        useAutoAdvance({
          enabled: false,
          currentStringId: TIMPLE_TUNING[0].id,
          tuningStatus: status,
          onAdvance,
        }),
      { initialProps: { status: undefined as any } }
    )

    rerender({ status: 'in_tune' })

    expect(onAdvance).not.toHaveBeenCalled()
  })

  it('should advance to next string when enabled and status becomes in_tune', () => {
    const onAdvance = vi.fn()

    const { result, rerender } = renderHook(
      ({ status }) =>
        useAutoAdvance({
          enabled: true,
          currentStringId: TIMPLE_TUNING[0].id,
          tuningStatus: status,
          onAdvance,
        }),
      { initialProps: { status: 'awaiting' as any } }
    )

    // Enable auto-advance
    act(() => {
      result.current.setAutoAdvanceEnabled(true)
    })

    // Status becomes in_tune
    rerender({ status: 'in_tune' })

    expect(onAdvance).toHaveBeenCalledWith(TIMPLE_TUNING[1].id)
  })

  it('should not advance when already on last string', () => {
    const onAdvance = vi.fn()
    const lastStringId = TIMPLE_TUNING[TIMPLE_TUNING.length - 1].id

    const { rerender } = renderHook(
      ({ status }) =>
        useAutoAdvance({
          enabled: true,
          currentStringId: lastStringId,
          tuningStatus: status,
          onAdvance,
        }),
      { initialProps: { status: 'awaiting' as any } }
    )

    rerender({ status: 'in_tune' })

    expect(onAdvance).not.toHaveBeenCalled()
  })

  it('should not advance repeatedly while staying in_tune', () => {
    const onAdvance = vi.fn()

    const { rerender } = renderHook(
      ({ status }) =>
        useAutoAdvance({
          enabled: true,
          currentStringId: TIMPLE_TUNING[0].id,
          tuningStatus: status,
          onAdvance,
        }),
      { initialProps: { status: 'awaiting' as any } }
    )

    // First time becoming in_tune
    rerender({ status: 'in_tune' })
    expect(onAdvance).toHaveBeenCalledTimes(1)

    // Stay in_tune - should not advance again
    rerender({ status: 'in_tune' })
    expect(onAdvance).toHaveBeenCalledTimes(1)
  })

  it('should allow toggling auto-advance on and off', () => {
    const onAdvance = vi.fn()

    const { result } = renderHook(() =>
      useAutoAdvance({
        enabled: false,
        currentStringId: TIMPLE_TUNING[0].id,
        tuningStatus: 'awaiting',
        onAdvance,
      })
    )

    expect(result.current.autoAdvanceEnabled).toBe(false)

    act(() => {
      result.current.setAutoAdvanceEnabled(true)
    })

    expect(result.current.autoAdvanceEnabled).toBe(true)
  })
})
