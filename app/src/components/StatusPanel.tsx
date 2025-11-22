import { Stack, Text, Slider } from '@mantine/core'
import { NoiseHandlingConfig } from '../noiseConfig'

export type MicPermissionStatus = 'unknown' | 'granted' | 'denied'

export interface SignalQuality {
  volume: number
  confidence: number
}

interface StatusPanelProps {
  micStatus: MicPermissionStatus
  noiseConfig?: NoiseHandlingConfig
  isOnline?: boolean
  signalQuality?: SignalQuality
  onNoiseConfigChange?: (config: NoiseHandlingConfig) => void
}

const MIC_STATUS_TEXT: Record<MicPermissionStatus, string> = {
  unknown: 'Mic: Not requested',
  granted: 'Mic: Granted',
  denied: 'Mic: Denied',
}

function getSignalStatusText(
  signalQuality: SignalQuality | undefined,
  noiseConfig: NoiseHandlingConfig | undefined
): string {
  if (!signalQuality || !noiseConfig) return '—'

  if (signalQuality.volume < noiseConfig.minVolumeThreshold) {
    return 'Signal too weak'
  }

  if (signalQuality.confidence < noiseConfig.minConfidenceThreshold) {
    return 'Noisy environment'
  }

  return 'Good signal'
}

export function StatusPanel({
  micStatus,
  noiseConfig,
  isOnline = true,
  signalQuality,
  onNoiseConfigChange,
}: StatusPanelProps) {
  const signalStatusText = getSignalStatusText(signalQuality, noiseConfig)

  const handleVolumeChange = (value: number) => {
    if (noiseConfig && onNoiseConfigChange) {
      onNoiseConfigChange({ ...noiseConfig, minVolumeThreshold: value })
    }
  }

  const handleConfidenceChange = (value: number) => {
    if (noiseConfig && onNoiseConfigChange) {
      onNoiseConfigChange({ ...noiseConfig, minConfidenceThreshold: value })
    }
  }

  return (
    <Stack gap="xs">
      <Text size="sm">{MIC_STATUS_TEXT[micStatus]}</Text>
      <Text size="sm" data-testid="signal-status">Signal: {signalStatusText}</Text>
      <Text size="sm" data-testid="online-status">
        {isOnline ? 'Online' : 'Offline - Basic tuning works offline once loaded.'}
      </Text>
      {noiseConfig && (
        <>
          <Text size="sm">Volume threshold: {noiseConfig.minVolumeThreshold}</Text>
          {onNoiseConfigChange && (
            <Slider
              data-testid="volume-threshold-slider"
              value={noiseConfig.minVolumeThreshold}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
              aria-label="Volume threshold"
            />
          )}
          <Text size="sm">Confidence threshold: {noiseConfig.minConfidenceThreshold}</Text>
          {onNoiseConfigChange && (
            <Slider
              data-testid="confidence-threshold-slider"
              value={noiseConfig.minConfidenceThreshold}
              onChange={handleConfidenceChange}
              min={0}
              max={1}
              step={0.01}
              aria-label="Confidence threshold"
            />
          )}
        </>
      )}
    </Stack>
  )
}
