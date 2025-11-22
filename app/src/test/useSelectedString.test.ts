import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelectedString } from '../hooks/useSelectedString'
import { TIMPLE_TUNING } from '../tuning'

describe('useSelectedString', () => {
  it('should initialize with the first string selected', () => {
    const { result } = renderHook(() => useSelectedString())

    expect(result.current.selectedString.id).toBe(TIMPLE_TUNING[0].id)
  })

  it('should update selectedString when setSelectedString is called with valid id', () => {
    const { result } = renderHook(() => useSelectedString())

    act(() => {
      result.current.setSelectedString(TIMPLE_TUNING[2].id)
    })

    expect(result.current.selectedString.id).toBe(TIMPLE_TUNING[2].id)
  })

  it('should not change selectedString when setSelectedString is called with invalid id', () => {
    const { result } = renderHook(() => useSelectedString())
    const initialId = result.current.selectedString.id

    act(() => {
      result.current.setSelectedString('invalid-id')
    })

    expect(result.current.selectedString.id).toBe(initialId)
  })
})
