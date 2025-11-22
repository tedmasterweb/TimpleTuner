import { AudioInputSource } from './AudioInputSource'

export class MicrophoneAudioInputSource implements AudioInputSource {
  private callback: ((samples: Float32Array, sampleRate: number) => void) | null = null
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private processorNode: ScriptProcessorNode | null = null

  readonly bufferSize = 2048

  async start(): Promise<void> {
    if (this.audioContext !== null) return

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.audioContext = new AudioContext()
    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream)
    this.processorNode = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1)

    this.processorNode.onaudioprocess = (event: AudioProcessingEvent) => {
      if (this.callback && this.audioContext) {
        const inputData = event.inputBuffer.getChannelData(0)
        const samples = new Float32Array(inputData)
        this.callback(samples, this.audioContext.sampleRate)
      }
    }

    this.sourceNode.connect(this.processorNode)
    this.processorNode.connect(this.audioContext.destination)
  }

  stop(): void {
    if (this.processorNode) {
      this.processorNode.disconnect()
      this.processorNode = null
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }
  }

  onFrame(callback: (samples: Float32Array, sampleRate: number) => void): void {
    this.callback = callback
  }
}
