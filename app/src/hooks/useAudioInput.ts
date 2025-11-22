import { useState, useCallback } from 'react'
import { AudioInputSource } from '../audio/AudioInputSource'

export function useAudioInput(source: AudioInputSource) {
  const [isRunning, setIsRunning] = useState(false)

  const start = useCallback(async () => {
    await source.start()
    setIsRunning(true)
  }, [source])

  const stop = useCallback(() => {
    source.stop()
    setIsRunning(false)
  }, [source])

  return { isRunning, start, stop }
}
