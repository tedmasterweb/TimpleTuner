import { describe, it, expect } from 'vitest'
import { AudioInputSource } from '../audio/AudioInputSource'

class MockAudioInputSource implements AudioInputSource {
  async start(): Promise<void> {
    // Mock implementation
  }

  stop(): void {
    // Mock implementation
  }

  onFrame(callback: (samples: Float32Array, sampleRate: number) => void): void {
    void callback
  }
}

describe('AudioInputSource', () => {
  it('should be instantiable and methods callable without throwing', () => {
    const source = new MockAudioInputSource()

    expect(() => source.onFrame(() => {})).not.toThrow()
    expect(() => source.start()).not.toThrow()
    expect(() => source.stop()).not.toThrow()
  })

  it('should allow start to be awaited', async () => {
    const source = new MockAudioInputSource()

    await expect(source.start()).resolves.toBeUndefined()
  })
})
