import { useState, useCallback, useMemo } from 'react'
import { TIMPLE_TUNING, TimpleString } from '../tuning'

export function useSelectedString() {
  const [selectedStringId, setSelectedStringId] = useState(TIMPLE_TUNING[0].id)

  const selectedString = useMemo(
    () => TIMPLE_TUNING.find((s) => s.id === selectedStringId) ?? TIMPLE_TUNING[0],
    [selectedStringId]
  )

  const setSelectedString = useCallback((id: string) => {
    const exists = TIMPLE_TUNING.some((s) => s.id === id)
    if (exists) {
      setSelectedStringId(id)
    }
  }, [])

  return { selectedString, setSelectedString }
}
