export interface NoiseHandlingConfig {
  minVolumeThreshold: number // 0–1
  minConfidenceThreshold: number // 0–1
}

export const defaultNoiseHandlingConfig: NoiseHandlingConfig = {
  minVolumeThreshold: 0.1,
  minConfidenceThreshold: 0.7,
}
