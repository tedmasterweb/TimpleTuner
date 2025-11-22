import { useState, useEffect, useRef } from 'react'
import { TIMPLE_TUNING } from '../tuning'
import { TuningStatus } from '../tuningReading'

interface UseAutoAdvanceOptions {
  enabled: boolean
  currentStringId: string
  tuningStatus: TuningStatus | undefined
  onAdvance: (nextStringId: string) => void
}

export function useAutoAdvance({
  enabled,
  currentStringId,
  tuningStatus,
  onAdvance,
}: UseAutoAdvanceOptions) {
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(enabled)
  const previousStatusRef = useRef<TuningStatus | undefined>(undefined)

  useEffect(() => {
    // Only advance if:
    // 1. Auto-advance is enabled
    // 2. Status just became 'in_tune' (wasn't in_tune before)
    if (
      autoAdvanceEnabled &&
      tuningStatus === 'in_tune' &&
      previousStatusRef.current !== 'in_tune'
    ) {
      const currentIndex = TIMPLE_TUNING.findIndex((s) => s.id === currentStringId)
      const nextIndex = currentIndex + 1

      if (nextIndex < TIMPLE_TUNING.length) {
        onAdvance(TIMPLE_TUNING[nextIndex].id)
      }
    }

    previousStatusRef.current = tuningStatus
  }, [autoAdvanceEnabled, currentStringId, tuningStatus, onAdvance])

  return {
    autoAdvanceEnabled,
    setAutoAdvanceEnabled,
  }
}
