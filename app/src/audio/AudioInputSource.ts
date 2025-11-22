export interface AudioInputSource {
  start(): Promise<void>
  stop(): void
  onFrame(callback: (samples: Float32Array, sampleRate: number) => void): void
}
