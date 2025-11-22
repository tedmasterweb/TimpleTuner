import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMicPermission, MicPermissionAPI } from '../hooks/useMicPermission'

describe('useMicPermission', () => {
  it('should have state unknown initially', () => {
    const mockAPI: MicPermissionAPI = {
      requestPermission: vi.fn(),
    }

    const { result } = renderHook(() => useMicPermission(mockAPI))

    expect(result.current.state).toBe('unknown')
  })

  it('should set state to granted after successful permission request', async () => {
    const mockAPI: MicPermissionAPI = {
      requestPermission: vi.fn().mockResolvedValue('granted'),
    }

    const { result } = renderHook(() => useMicPermission(mockAPI))

    await act(async () => {
      await result.current.requestPermission()
    })

    expect(result.current.state).toBe('granted')
  })

  it('should set state to denied after denied permission request', async () => {
    const mockAPI: MicPermissionAPI = {
      requestPermission: vi.fn().mockResolvedValue('denied'),
    }

    const { result } = renderHook(() => useMicPermission(mockAPI))

    await act(async () => {
      await result.current.requestPermission()
    })

    expect(result.current.state).toBe('denied')
  })

  it('should call the API requestPermission method', async () => {
    const mockAPI: MicPermissionAPI = {
      requestPermission: vi.fn().mockResolvedValue('granted'),
    }

    const { result } = renderHook(() => useMicPermission(mockAPI))

    await act(async () => {
      await result.current.requestPermission()
    })

    expect(mockAPI.requestPermission).toHaveBeenCalledTimes(1)
  })
})
