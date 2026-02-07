import { useState, useRef, useCallback } from 'react'
import { Group, Button } from '@mantine/core'
import { TIMPLE_TUNING } from '../tuning'

const TONE_DURATION = 2
const FADE_OUT_MS = 0.05

export function ReferenceTones() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const stopCurrent = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop()
      } catch {
        // already stopped
      }
      oscillatorRef.current = null
    }
    gainRef.current = null
    setPlayingId(null)
  }, [])

  const playTone = useCallback(
    (stringId: string, frequencyHz: number) => {
      stopCurrent()

      const ctx = audioCtxRef.current ?? new AudioContext()
      audioCtxRef.current = ctx

      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequencyHz, ctx.currentTime)

      gain.gain.setValueAtTime(1, ctx.currentTime)
      gain.gain.setValueAtTime(1, ctx.currentTime + TONE_DURATION - FADE_OUT_MS)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + TONE_DURATION)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start()
      oscillator.stop(ctx.currentTime + TONE_DURATION)

      oscillator.onended = () => {
        setPlayingId((current) => (current === stringId ? null : current))
      }

      oscillatorRef.current = oscillator
      gainRef.current = gain
      setPlayingId(stringId)
    },
    [stopCurrent],
  )

  return (
    <Group gap="xs" justify="center" data-testid="reference-tones">
      {TIMPLE_TUNING.map((s) => (
        <Button
          key={s.id}
          size="sm"
          variant={playingId === s.id ? 'filled' : 'outline'}
          onClick={() => playTone(s.id, s.frequencyHz)}
          data-testid={`ref-tone-${s.id}`}
        >
          {s.note.replace(/\d+$/, '')}
        </Button>
      ))}
    </Group>
  )
}
