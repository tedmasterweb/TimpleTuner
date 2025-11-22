import { AudioInputSource } from './AudioInputSource'

export class MockAudioInputSource implements AudioInputSource {
  private callback: ((samples: Float32Array, sampleRate: number) => void) | null = null
  private intervalId: ReturnType<typeof setInterval> | null = null
  private phase = 0

  readonly sampleRate = 44100
  readonly bufferSize = 2048
  readonly frequency: number

  constructor(frequency = 440) {
    this.frequency = frequency
  }

  async start(): Promise<void> {
    if (this.intervalId !== null) return

    const intervalMs = (this.bufferSize / this.sampleRate) * 1000

    this.intervalId = setInterval(() => {
      if (this.callback) {
        const samples = this.generateSineWave()
        this.callback(samples, this.sampleRate)
      }
    }, intervalMs)
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  onFrame(callback: (samples: Float32Array, sampleRate: number) => void): void {
    this.callback = callback
  }

  private generateSineWave(): Float32Array {
    const samples = new Float32Array(this.bufferSize)
    const angularFrequency = (2 * Math.PI * this.frequency) / this.sampleRate

    for (let i = 0; i < this.bufferSize; i++) {
      samples[i] = Math.sin(this.phase)
      this.phase += angularFrequency
    }

    // Keep phase in reasonable range to avoid precision issues
    this.phase = this.phase % (2 * Math.PI)

    return samples
  }
}
