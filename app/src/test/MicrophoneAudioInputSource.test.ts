import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MicrophoneAudioInputSource } from '../audio/MicrophoneAudioInputSource'

describe('MicrophoneAudioInputSource', () => {
  let mockAudioContext: {
    sampleRate: number
    createMediaStreamSource: ReturnType<typeof vi.fn>
    createScriptProcessor: ReturnType<typeof vi.fn>
    destination: AudioDestinationNode
    close: ReturnType<typeof vi.fn>
  }
  let mockSourceNode: { connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }
  let mockProcessorNode: {
    connect: ReturnType<typeof vi.fn>
    disconnect: ReturnType<typeof vi.fn>
    onaudioprocess: ((event: AudioProcessingEvent) => void) | null
  }
  let mockMediaStream: { getTracks: ReturnType<typeof vi.fn> }
  let mockTrack: { stop: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockTrack = { stop: vi.fn() }
    mockMediaStream = { getTracks: vi.fn(() => [mockTrack]) }
    mockSourceNode = { connect: vi.fn(), disconnect: vi.fn() }
    mockProcessorNode = { connect: vi.fn(), disconnect: vi.fn(), onaudioprocess: null }
    mockAudioContext = {
      sampleRate: 44100,
      createMediaStreamSource: vi.fn(() => mockSourceNode),
      createScriptProcessor: vi.fn(() => mockProcessorNode),
      destination: {} as AudioDestinationNode,
      close: vi.fn(),
    }

    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn(() => Promise.resolve(mockMediaStream)),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('implements AudioInputSource interface', () => {
    const source = new MicrophoneAudioInputSource()
    expect(typeof source.start).toBe('function')
    expect(typeof source.stop).toBe('function')
    expect(typeof source.onFrame).toBe('function')
  })

  it('requests microphone access on start', async () => {
    const source = new MicrophoneAudioInputSource()
    await source.start()

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })
  })

  it('creates audio context and connects nodes on start', async () => {
    const source = new MicrophoneAudioInputSource()
    await source.start()

    expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(mockMediaStream)
    expect(mockAudioContext.createScriptProcessor).toHaveBeenCalledWith(2048, 1, 1)
    expect(mockSourceNode.connect).toHaveBeenCalledWith(mockProcessorNode)
    expect(mockProcessorNode.connect).toHaveBeenCalledWith(mockAudioContext.destination)
  })

  it('does not start twice if already running', async () => {
    const source = new MicrophoneAudioInputSource()
    await source.start()
    await source.start()

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1)
  })

  it('passes audio frames to callback via onaudioprocess', async () => {
    const source = new MicrophoneAudioInputSource()
    const callback = vi.fn()
    source.onFrame(callback)

    await source.start()

    const mockInputData = new Float32Array([0.1, 0.2, 0.3])
    const mockEvent = {
      inputBuffer: {
        getChannelData: vi.fn(() => mockInputData),
      },
    } as unknown as AudioProcessingEvent

    mockProcessorNode.onaudioprocess!(mockEvent)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(expect.any(Float32Array), 44100)
    const receivedSamples = callback.mock.calls[0][0] as Float32Array
    expect(receivedSamples.length).toBe(3)
    expect(receivedSamples[0]).toBeCloseTo(0.1)
    expect(receivedSamples[1]).toBeCloseTo(0.2)
    expect(receivedSamples[2]).toBeCloseTo(0.3)
  })

  it('disconnects and cleans up on stop', async () => {
    const source = new MicrophoneAudioInputSource()
    await source.start()
    source.stop()

    expect(mockProcessorNode.disconnect).toHaveBeenCalled()
    expect(mockSourceNode.disconnect).toHaveBeenCalled()
    expect(mockAudioContext.close).toHaveBeenCalled()
    expect(mockTrack.stop).toHaveBeenCalled()
  })

  it('does nothing on stop if not started', () => {
    const source = new MicrophoneAudioInputSource()
    expect(() => source.stop()).not.toThrow()
  })
})
