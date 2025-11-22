export type TuningStatus = 'awaiting' | 'in_tune' | 'sharp' | 'flat' | 'noisy'

export interface TuningReading {
  frequencyHz: number | null
  centsOff: number | null
  status: TuningStatus
  confidence: number // range 0–1
  volume: number // range 0–1
}
