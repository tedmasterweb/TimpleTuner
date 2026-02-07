import { useState, useCallback, useEffect } from 'react'
import { AudioInputSource } from '../audio/AudioInputSource'
import { detectPitch } from '../audio/detectPitch'
import { createTuningReading } from '../audio/createTuningReading'
import { calculateVolume, estimateConfidence } from '../audio/audioAnalysis'
import { closestTimpleString } from '../audio/closestTimpleString'
import { TuningReading } from '../tuningReading'
import { NoiseHandlingConfig, defaultNoiseHandlingConfig } from '../noiseConfig'
import { TIMPLE_TUNING } from '../tuning'

interface UseTuningOptions {
  noiseConfig?: NoiseHandlingConfig
}

export function useTuning(source: AudioInputSource, options: UseTuningOptions = {}) {
  const { noiseConfig = defaultNoiseHandlingConfig } = options

  const [isRunning, setIsRunning] = useState(false)
  const [reading, setReading] = useState<TuningReading | null>(null)

  // Set up frame callback
  useEffect(() => {
    source.onFrame((samples, sampleRate) => {
      const detectedFrequency = detectPitch(samples, sampleRate)
      const volume = calculateVolume(samples)
      const confidence = estimateConfidence(samples, detectedFrequency)

      // Auto-detect closest string when we have a valid frequency
      const matched = detectedFrequency !== null
        ? closestTimpleString(detectedFrequency, TIMPLE_TUNING)
        : null
      const targetFrequencyHz = matched?.frequencyHz ?? 440

      const newReading = createTuningReading(
        detectedFrequency,
        targetFrequencyHz,
        noiseConfig,
        confidence,
        volume,
        matched
      )

      setReading(newReading)
    })
  }, [source, noiseConfig])

  const start = useCallback(async () => {
    await source.start()
    setIsRunning(true)
  }, [source])

  const stop = useCallback(() => {
    source.stop()
    setIsRunning(false)
    setReading(null)
  }, [source])

  return { isRunning, reading, start, stop }
}
