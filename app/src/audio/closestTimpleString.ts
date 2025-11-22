import { TimpleString } from '../tuning'

/**
 * Find the closest timple string to a given frequency
 * Uses cents distance for comparison (logarithmic scale)
 */
export function closestTimpleString(frequencyHz: number, tuning: TimpleString[]): TimpleString {
  let closest = tuning[0]
  let minCentsDistance = Infinity

  for (const string of tuning) {
    const centsDistance = Math.abs(1200 * Math.log2(frequencyHz / string.frequencyHz))
    if (centsDistance < minCentsDistance) {
      minCentsDistance = centsDistance
      closest = string
    }
  }

  return closest
}
