import { useEffect, useRef, useState } from 'react'
import { Stack, Text, Title } from '@mantine/core'
import { TimpleString } from '../tuning'
import { TuningReading } from '../tuningReading'
import { TuningBar } from './TuningBar'

export const STICKY_TIMEOUT_MS = 5000
export const FREQUENCY_THROTTLE_MS = 200

interface TuningPanelProps {
  reading?: TuningReading
  micPermissionDenied?: boolean
}

export function TuningPanel({
  reading,
  micPermissionDenied = false,
}: TuningPanelProps) {
  const [stickyString, setStickyString] = useState<TimpleString | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [stickyFrequency, setStickyFrequency] = useState<number | null>(null)
  const frequencyUpdateRef = useRef<number>(0)
  const frequencyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (reading?.detectedString) {
      setStickyString(reading.detectedString)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    } else if (stickyString) {
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          setStickyString(null)
          timeoutRef.current = null
        }, STICKY_TIMEOUT_MS)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [reading?.detectedString])

  useEffect(() => {
    if (reading?.frequencyHz != null) {
      const now = Date.now()
      if (now - frequencyUpdateRef.current >= FREQUENCY_THROTTLE_MS) {
        setStickyFrequency(reading.frequencyHz)
        frequencyUpdateRef.current = now
      }
      if (frequencyTimeoutRef.current) {
        clearTimeout(frequencyTimeoutRef.current)
        frequencyTimeoutRef.current = null
      }
    } else if (stickyFrequency != null) {
      if (!frequencyTimeoutRef.current) {
        frequencyTimeoutRef.current = setTimeout(() => {
          setStickyFrequency(null)
          frequencyTimeoutRef.current = null
        }, STICKY_TIMEOUT_MS)
      }
    }

    return () => {
      if (frequencyTimeoutRef.current) {
        clearTimeout(frequencyTimeoutRef.current)
        frequencyTimeoutRef.current = null
      }
    }
  }, [reading?.frequencyHz])

  const displayString = reading?.detectedString ?? stickyString
  const detectedNote = displayString?.note?.replace(/\d+$/, '') ?? '—'
  const targetFrequency = displayString?.frequencyHz
    ? `${displayString.frequencyHz} Hz`
    : '—'
  const currentFrequency = stickyFrequency != null
    ? `${stickyFrequency.toFixed(1)} Hz`
    : '—'

  return (
    <Stack gap="xs">
      <Title order={3} data-testid="detected-note">Detected: {detectedNote}</Title>
      <Text data-testid="target-frequency">Target: {targetFrequency}</Text>
      <Text>Current: {currentFrequency}</Text>
      {micPermissionDenied && (
        <Text c="red" data-testid="mic-denied-message">Microphone access denied</Text>
      )}
      <TuningBar
        centsOff={reading?.centsOff ?? null}
        isInTune={reading?.status === 'in_tune'}
      />
    </Stack>
  )
}
