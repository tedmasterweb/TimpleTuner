import { useState, useCallback } from 'react'

export type MicPermissionState = 'unknown' | 'granted' | 'denied'

export interface MicPermissionAPI {
  requestPermission: () => Promise<MicPermissionState>
}

// Default implementation using getUserMedia
const defaultMicPermissionAPI: MicPermissionAPI = {
  requestPermission: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop tracks immediately - we just needed to check permission
      stream.getTracks().forEach((track) => track.stop())
      return 'granted'
    } catch {
      return 'denied'
    }
  },
}

export function useMicPermission(api: MicPermissionAPI = defaultMicPermissionAPI) {
  const [state, setState] = useState<MicPermissionState>('unknown')

  const requestPermission = useCallback(async () => {
    const result = await api.requestPermission()
    setState(result)
    return result
  }, [api])

  return { state, requestPermission }
}
