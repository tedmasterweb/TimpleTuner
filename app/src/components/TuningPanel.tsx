import { Stack, Text, Title, Button, Switch } from '@mantine/core'
import { TimpleString } from '../tuning'
import { TuningReading, TuningStatus } from '../tuningReading'
import { AnalogMeter } from './AnalogMeter'

interface TuningPanelProps {
  selectedString: TimpleString
  reading?: TuningReading
  isRunning?: boolean
  onStart?: () => void
  onStop?: () => void
  micPermissionDenied?: boolean
  autoAdvanceEnabled?: boolean
  onAutoAdvanceChange?: (enabled: boolean) => void
}

const STATUS_TEXT: Record<TuningStatus, string> = {
  awaiting: 'Awaiting input',
  in_tune: 'In tune',
  sharp: 'Too sharp',
  flat: 'Too flat',
  noisy: 'Too noisy',
}

export function TuningPanel({
  selectedString,
  reading,
  isRunning = false,
  onStart,
  onStop,
  micPermissionDenied = false,
  autoAdvanceEnabled = false,
  onAutoAdvanceChange,
}: TuningPanelProps) {
  const currentFrequency = reading?.frequencyHz != null
    ? `${reading.frequencyHz.toFixed(1)} Hz`
    : '—'
  const statusText = reading ? STATUS_TEXT[reading.status] : 'Awaiting input'

  const handleButtonClick = () => {
    if (isRunning) {
      onStop?.()
    } else {
      onStart?.()
    }
  }

  return (
    <Stack gap="xs">
      <Title order={3}>Selected: {selectedString.label}</Title>
      <Text>Target: {selectedString.note} – {selectedString.frequencyHz} Hz</Text>
      <Text>Current: {currentFrequency}</Text>
      <Text>Status: {statusText}</Text>
      <AnalogMeter
        centsOff={reading?.centsOff ?? null}
        isInTune={reading?.status === 'in_tune'}
      />
      <Button
        onClick={handleButtonClick}
        disabled={micPermissionDenied}
        data-testid="tuning-button"
      >
        {isRunning ? 'Stop tuning' : 'Start tuning'}
      </Button>
      <Switch
        label="Auto-advance to next string when tuned"
        checked={autoAdvanceEnabled}
        onChange={(event) => onAutoAdvanceChange?.(event.currentTarget.checked)}
        data-testid="auto-advance-toggle"
      />
    </Stack>
  )
}
