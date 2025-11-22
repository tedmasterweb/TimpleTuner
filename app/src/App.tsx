import { useState, useEffect, useMemo, useCallback } from 'react'
import { Container, Stack, Box, Group, Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useSelectedString } from './hooks/useSelectedString'
import { useMicPermission } from './hooks/useMicPermission'
import { useTuning } from './hooks/useTuning'
import { useAutoAdvance } from './hooks/useAutoAdvance'
import { MicrophoneAudioInputSource } from './audio/MicrophoneAudioInputSource'
import { NoiseHandlingConfig, defaultNoiseHandlingConfig } from './noiseConfig'
import { StringSelection, StringTunedState } from './components/StringSelection'
import { TIMPLE_TUNING } from './tuning'
import { TuningPanel } from './components/TuningPanel'
import { StatusPanel } from './components/StatusPanel'
import { BannerAd } from './components/BannerAd'

function App() {
  const { t, i18n } = useTranslation()
  const { selectedString, setSelectedString } = useSelectedString()
  const { state: micStatus, requestPermission } = useMicPermission()
  const [noiseConfig, setNoiseConfig] = useState<NoiseHandlingConfig>(defaultNoiseHandlingConfig)
  const [tunedStrings, setTunedStrings] = useState<Record<string, StringTunedState>>(() =>
    TIMPLE_TUNING.reduce(
      (acc, s) => ({ ...acc, [s.id]: 'untuned' as StringTunedState }),
      {} as Record<string, StringTunedState>
    )
  )
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  const audioSource = useMemo(() => new MicrophoneAudioInputSource(), [])
  const { isRunning, reading, start, stop } = useTuning(audioSource, {
    targetFrequencyHz: selectedString.frequencyHz,
    noiseConfig,
  })

  // Mark string as tuned when in_tune status is reached
  useEffect(() => {
    if (reading?.status === 'in_tune') {
      markStringAsTuned(selectedString.id)
    }
  }, [reading?.status, selectedString.id])

  const handleAutoAdvance = useCallback(
    (nextStringId: string) => setSelectedString(nextStringId),
    [setSelectedString]
  )

  const { autoAdvanceEnabled, setAutoAdvanceEnabled } = useAutoAdvance({
    enabled: false,
    currentStringId: selectedString.id,
    tuningStatus: reading?.status,
    onAdvance: handleAutoAdvance,
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleNoiseConfigChange = (config: NoiseHandlingConfig) => {
    setNoiseConfig(config)
  }

  const markStringAsTuned = (stringId: string) => {
    setTunedStrings((prev) => ({ ...prev, [stringId]: 'tuned' }))
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const handleStart = useCallback(async () => {
    if (micStatus === 'unknown') {
      const result = await requestPermission()
      if (result === 'denied') return
    }
    if (micStatus !== 'denied') {
      start()
    }
  }, [micStatus, requestPermission, start])

  return (
    <Container size="xs" p="md">
      <Stack gap="md">
        <Box data-testid="header-section">
          <Group justify="space-between" align="flex-start">
            <div>
              <h1>{t('app.title')}</h1>
              <p>{t('app.subtitle')}</p>
            </div>
            <Group gap="xs">
              <Button
                size="xs"
                variant={i18n.language === 'en' ? 'filled' : 'outline'}
                onClick={() => changeLanguage('en')}
                data-testid="lang-en"
              >
                EN
              </Button>
              <Button
                size="xs"
                variant={i18n.language === 'es' ? 'filled' : 'outline'}
                onClick={() => changeLanguage('es')}
                data-testid="lang-es"
              >
                ES
              </Button>
            </Group>
          </Group>
        </Box>
        <Box data-testid="tuning-panel-section">
          <TuningPanel
            selectedString={selectedString}
            reading={reading ?? undefined}
            isRunning={isRunning}
            onStart={handleStart}
            onStop={stop}
            micPermissionDenied={micStatus === 'denied'}
            autoAdvanceEnabled={autoAdvanceEnabled}
            onAutoAdvanceChange={setAutoAdvanceEnabled}
          />
        </Box>
        <Box data-testid="string-selection-section">
          <StringSelection
            selectedStringId={selectedString.id}
            onSelectString={setSelectedString}
            tunedStrings={tunedStrings}
          />
        </Box>
        <Box data-testid="banner-ad-section">
          <BannerAd />
        </Box>
        <Box data-testid="status-panel-section">
          <StatusPanel
            micStatus={micStatus}
            noiseConfig={noiseConfig}
            onNoiseConfigChange={handleNoiseConfigChange}
            isOnline={isOnline}
            signalQuality={
              reading ? { volume: reading.volume, confidence: reading.confidence } : undefined
            }
          />
        </Box>
      </Stack>
    </Container>
  )
}

export default App
