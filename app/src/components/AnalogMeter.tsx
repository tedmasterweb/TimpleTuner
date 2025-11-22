import { Box } from '@mantine/core'
import { useRef, useEffect, useState } from 'react'

interface AnalogMeterProps {
  /** Cents offset from target frequency (-50 to +50) */
  centsOff: number | null
  /** Whether the note is in tune */
  isInTune: boolean
  /** Size of the meter in pixels */
  size?: number
}

/**
 * Analog-style tuning meter with animated needle and LED markers.
 *
 * The needle uses damped oscillation for smooth movement, with a trail
 * effect showing recent motion direction.
 */
export function AnalogMeter({ centsOff, isInTune, size = 280 }: AnalogMeterProps) {
  // Smoothed value for damped oscillation
  const [smoothedCents, setSmoothedCents] = useState(0)
  const [trailCents, setTrailCents] = useState<number[]>([0, 0, 0])
  const animationRef = useRef<number | null>(null)
  const targetRef = useRef(0)
  const velocityRef = useRef(0)

  // Damped spring physics for smooth needle movement
  useEffect(() => {
    const targetCents = centsOff ?? 0
    targetRef.current = Math.max(-50, Math.min(50, targetCents))

    const animate = () => {
      const target = targetRef.current
      const current = smoothedCents
      const velocity = velocityRef.current

      // Spring physics: F = -k(x - target) - damping * velocity
      const stiffness = 0.15
      const damping = 0.7
      const force = (target - current) * stiffness
      const newVelocity = (velocity + force) * damping
      const newValue = current + newVelocity

      velocityRef.current = newVelocity

      // Update trail (previous positions for motion blur effect)
      setTrailCents(prev => [prev[1], prev[2], current])
      setSmoothedCents(newValue)

      // Continue animation if still moving significantly
      if (Math.abs(newVelocity) > 0.01 || Math.abs(target - newValue) > 0.1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [centsOff, smoothedCents])

  // Convert cents to angle: -50 cents = -60°, 0 = 0°, +50 cents = +60°
  const centsToAngle = (cents: number) => (cents / 50) * 60
  const needleAngle = centsToAngle(smoothedCents)
  const trailAngles = trailCents.map(centsToAngle)

  // LED marker positions (every 10 cents)
  const markers = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50]

  // Determine marker colors based on current position
  const getMarkerColor = (markerCents: number) => {
    if (markerCents === 0) return isInTune ? '#00ff00' : '#00aa00'
    const distance = Math.abs(smoothedCents - markerCents)
    if (distance < 8) {
      return isInTune ? '#00ff00' : '#ff4444'
    }
    return '#333'
  }

  const centerX = size / 2
  const centerY = size * 0.85
  const needleLength = size * 0.7
  const markerRadius = size * 0.4

  return (
    <Box
      data-testid="analog-meter"
      style={{
        position: 'relative',
        width: size,
        height: size * 0.6,
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      {/* Background arc */}
      <svg
        width={size}
        height={size * 0.6}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Dial background */}
        <path
          d={describeArc(centerX, centerY, markerRadius + 20, -60, 60)}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={40}
        />

        {/* Zone indicators */}
        <path
          d={describeArc(centerX, centerY, markerRadius + 20, -12, 12)}
          fill="none"
          stroke={isInTune ? '#004400' : '#003300'}
          strokeWidth={40}
        />

        {/* LED markers */}
        {markers.map((cents) => {
          const angle = centsToAngle(cents) - 90
          const rad = (angle * Math.PI) / 180
          const x = centerX + markerRadius * Math.cos(rad)
          const y = centerY + markerRadius * Math.sin(rad)
          const color = getMarkerColor(cents)
          const isCenter = cents === 0

          return (
            <g key={cents}>
              {/* Glow effect for lit markers */}
              {color !== '#333' && (
                <circle
                  cx={x}
                  cy={y}
                  r={isCenter ? 12 : 8}
                  fill={color}
                  opacity={0.4}
                  filter="blur(4px)"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={isCenter ? 8 : 5}
                fill={color}
                style={{
                  transition: 'fill 0.1s ease',
                  filter: color !== '#333' ? `drop-shadow(0 0 6px ${color})` : 'none',
                }}
              />
            </g>
          )
        })}

        {/* Needle trail (motion blur effect) */}
        {trailAngles.map((angle, i) => (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={centerX + needleLength * Math.sin((angle * Math.PI) / 180)}
            y2={centerY - needleLength * Math.cos((angle * Math.PI) / 180)}
            stroke={isInTune ? '#00ff00' : '#ff4444'}
            strokeWidth={3 - i}
            opacity={0.15 + i * 0.1}
            strokeLinecap="round"
          />
        ))}

        {/* Main needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + needleLength * Math.sin((needleAngle * Math.PI) / 180)}
          y2={centerY - needleLength * Math.cos((needleAngle * Math.PI) / 180)}
          stroke={isInTune ? '#00ff00' : '#ff4444'}
          strokeWidth={4}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${isInTune ? '#00ff00' : '#ff4444'})`,
          }}
        />

        {/* Needle pivot point */}
        <circle
          cx={centerX}
          cy={centerY}
          r={10}
          fill="#222"
          stroke={isInTune ? '#00ff00' : '#ff4444'}
          strokeWidth={2}
        />

        {/* Labels */}
        <text
          x={centerX - markerRadius - 15}
          y={centerY - 10}
          fill="#666"
          fontSize={14}
          textAnchor="end"
        >
          FLAT
        </text>
        <text
          x={centerX + markerRadius + 15}
          y={centerY - 10}
          fill="#666"
          fontSize={14}
          textAnchor="start"
        >
          SHARP
        </text>
      </svg>
    </Box>
  )
}

/**
 * Generate SVG arc path
 */
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle - 90)
  const end = polarToCartesian(x, y, radius, startAngle - 90)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ')
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = (angleInDegrees * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}
