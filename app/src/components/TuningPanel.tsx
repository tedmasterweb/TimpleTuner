import { Stack, Text, Title, Box, Button, Switch } from '@mantine/core'
import { TimpleString } from '../tuning'
import { TuningReading, TuningStatus } from '../tuningReading'

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

function getTuningPosition(centsOff: number | null | undefined): 'flat' | 'center' | 'sharp' {
  if (centsOff == null || centsOff === 0) return 'center'
  return centsOff < 0 ? 'flat' : 'sharp'
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
  const tuningPosition = getTuningPosition(reading?.centsOff)

  // Calculate indicator position: -50 cents = 0%, 0 cents = 50%, +50 cents = 100%
  const centsOff = reading?.centsOff ?? 0
  const clampedCents = Math.max(-50, Math.min(50, centsOff))
  const indicatorPercent = ((clampedCents + 50) / 100) * 100

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
      <Box
        data-testid="tuning-indicator"
        data-tuning-position={tuningPosition}
        style={{
          position: 'relative',
          height: 24,
          backgroundColor: '#e0e0e0',
          borderRadius: 4,
        }}
      >
        {/* Center marker */}
        <Box
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: '#666',
          }}
        />
        {/* Indicator needle */}
        <Box
          style={{
            position: 'absolute',
            left: `${indicatorPercent}%`,
            top: 2,
            bottom: 2,
            width: 4,
            marginLeft: -2,
            backgroundColor: tuningPosition === 'center' ? '#4caf50' : '#f44336',
            borderRadius: 2,
          }}
        />
      </Box>
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
