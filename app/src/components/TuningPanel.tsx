import { useEffect, useRef, useState } from 'react'
import { Stack, Text, Title } from '@mantine/core'
import { TimpleString } from '../tuning'
import { TuningReading } from '../tuningReading'
import { AnalogMeter } from './AnalogMeter'

export const STICKY_TIMEOUT_MS = 5000

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

  const displayString = reading?.detectedString ?? stickyString
  const detectedNote = displayString?.note ?? '—'
  const targetFrequency = displayString?.frequencyHz
    ? `${displayString.frequencyHz} Hz`
    : '—'
  const currentFrequency = reading?.frequencyHz != null
    ? `${reading.frequencyHz.toFixed(1)} Hz`
    : '—'

  return (
    <Stack gap="xs">
      <Title order={3} data-testid="detected-note">Detected: {detectedNote}</Title>
      <Text data-testid="target-frequency">Target: {targetFrequency}</Text>
      <Text>Current: {currentFrequency}</Text>
      {micPermissionDenied && (
        <Text c="red" data-testid="mic-denied-message">Microphone access denied</Text>
      )}
      <AnalogMeter
        centsOff={reading?.centsOff ?? null}
        isInTune={reading?.status === 'in_tune'}
      />
    </Stack>
  )
}
