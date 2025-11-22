import { useState, useCallback, useRef, useEffect } from 'react'
import { AudioInputSource } from '../audio/AudioInputSource'
import { detectPitch } from '../audio/detectPitch'
import { createTuningReading } from '../audio/createTuningReading'
import { calculateVolume, estimateConfidence } from '../audio/audioAnalysis'
import { TuningReading } from '../tuningReading'
import { NoiseHandlingConfig, defaultNoiseHandlingConfig } from '../noiseConfig'

interface UseTuningOptions {
  targetFrequencyHz: number
  noiseConfig?: NoiseHandlingConfig
}

export function useTuning(source: AudioInputSource, options: UseTuningOptions) {
  const { targetFrequencyHz, noiseConfig = defaultNoiseHandlingConfig } = options

  const [isRunning, setIsRunning] = useState(false)
  const [reading, setReading] = useState<TuningReading | null>(null)
  const targetFrequencyRef = useRef(targetFrequencyHz)

  // Keep target frequency ref in sync
  useEffect(() => {
    targetFrequencyRef.current = targetFrequencyHz
  }, [targetFrequencyHz])

  // Set up frame callback
  useEffect(() => {
    source.onFrame((samples, sampleRate) => {
      const detectedFrequency = detectPitch(samples, sampleRate)
      const volume = calculateVolume(samples)
      const confidence = estimateConfidence(samples, detectedFrequency)

      const newReading = createTuningReading(
        detectedFrequency,
        targetFrequencyRef.current,
        noiseConfig,
        confidence,
        volume
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
