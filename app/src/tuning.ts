export interface TimpleString {
  id: string
  label: string
  note: string
  frequencyHz: number
}

// Standard timple tuning (5 strings, re-entrant: gcEAD)
// G and C are tuned higher (re-entrant), similar to ukulele
export const TIMPLE_TUNING: TimpleString[] = [
  { id: 'string-1', label: 'String 1 (G)', note: 'G4', frequencyHz: 392.0 },
  { id: 'string-2', label: 'String 2 (C)', note: 'C5', frequencyHz: 523.25 },
  { id: 'string-3', label: 'String 3 (E)', note: 'E4', frequencyHz: 329.63 },
  { id: 'string-4', label: 'String 4 (A)', note: 'A4', frequencyHz: 440.0 },
  { id: 'string-5', label: 'String 5 (D)', note: 'D5', frequencyHz: 587.33 },
]
