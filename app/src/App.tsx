import { useState, useEffect, useMemo } from 'react'
import { Container, Stack, Box, Group, Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useMicPermission } from './hooks/useMicPermission'
import { useTuning } from './hooks/useTuning'
import { MicrophoneAudioInputSource } from './audio/MicrophoneAudioInputSource'
import { NoiseHandlingConfig, defaultNoiseHandlingConfig } from './noiseConfig'
import { TuningPanel } from './components/TuningPanel'
import { StatusPanel } from './components/StatusPanel'
import { BannerAd } from './components/BannerAd'
import { ReferenceTones } from './components/ReferenceTones'

function App() {
  const { t, i18n } = useTranslation()
  const { state: micStatus, requestPermission } = useMicPermission()
  const [noiseConfig, setNoiseConfig] = useState<NoiseHandlingConfig>(defaultNoiseHandlingConfig)
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  const audioSource = useMemo(() => new MicrophoneAudioInputSource(), [])
  const { reading, start } = useTuning(audioSource, {
    noiseConfig,
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

  // Auto-start tuning on mount
  useEffect(() => {
    const autoStart = async () => {
      const result = await requestPermission()
      if (result === 'granted') {
        start()
      }
    }
    autoStart()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNoiseConfigChange = (config: NoiseHandlingConfig) => {
    setNoiseConfig(config)
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <Container size="xs" p="md">
      <Stack gap="md">
        <Box data-testid="header-section">
          <Group justify="space-between" align="flex-start">
            <h1 style={{ margin: 0 }}>{t('app.title')}</h1>
          </Group>
        </Box>
        <Box data-testid="tuning-panel-section">
          <TuningPanel
            reading={reading ?? undefined}
            micPermissionDenied={micStatus === 'denied'}
          />
        </Box>
        <Box data-testid="banner-ad-section">
          <BannerAd />
        </Box>
        <Box data-testid="reference-tones-section">
          <ReferenceTones />
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
      </Stack>
    </Container>
  )
}

export default App
