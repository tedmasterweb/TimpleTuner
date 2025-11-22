export interface TimpleString {
  id: string
  label: string
  note: string
  frequencyHz: number
}

// Standard timple tuning (5 strings)
// String numbering: 1st is highest pitched, 5th is lowest
export const TIMPLE_TUNING: TimpleString[] = [
  { id: 'string-1', label: 'String 1 (G)', note: 'G4', frequencyHz: 392.0 },
  { id: 'string-2', label: 'String 2 (C)', note: 'C4', frequencyHz: 261.63 },
  { id: 'string-3', label: 'String 3 (E)', note: 'E4', frequencyHz: 329.63 },
  { id: 'string-4', label: 'String 4 (A)', note: 'A3', frequencyHz: 220.0 },
  { id: 'string-5', label: 'String 5 (D)', note: 'D4', frequencyHz: 293.66 },
]
