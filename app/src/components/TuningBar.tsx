import { Box } from '@mantine/core'
import { useRef, useEffect, useState, useCallback } from 'react'

interface TuningBarProps {
  /** Cents offset from target frequency (-50 to +50) */
  centsOff: number | null
  /** Whether the note is in tune */
  isInTune: boolean
}

/**
 * Horizontal tuning bar with animated indicator.
 *
 * A fixed center line marks the target note. A moving vertical indicator
 * slides left/right based on centsOff. Uses damped spring animation
 * for smooth movement.
 */
export function TuningBar({ centsOff, isInTune }: TuningBarProps) {
  const [smoothedCents, setSmoothedCents] = useState(0)
  const [width, setWidth] = useState(280)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const targetRef = useRef(0)
  const velocityRef = useRef(0)

  // Measure container width and track resizes
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
    if (node) setWidth(node.clientWidth)
  }, [])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Damped spring physics for smooth indicator movement
  useEffect(() => {
    const targetCents = centsOff ?? 0
    const clamped = Math.max(-50, Math.min(50, targetCents))
    const alpha = 0.15
    targetRef.current = targetRef.current + alpha * (clamped - targetRef.current)

    const animate = () => {
      const target = targetRef.current
      const current = smoothedCents
      const velocity = velocityRef.current

      const stiffness = 0.06
      const damping = 0.55
      const force = (target - current) * stiffness
      const newVelocity = (velocity + force) * damping
      const newValue = current + newVelocity

      velocityRef.current = newVelocity
      setSmoothedCents(newValue)

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

  const height = 60
  const barY = height / 2
  const padding = 40 // space for FLAT/SHARP labels
  const barLeft = padding
  const barRight = width - padding
  const barWidth = barRight - barLeft
  const centerX = width / 2

  // Map centsOff (-50..+50) to x position across the bar
  const currentCents = isInTune ? 0 : smoothedCents
  const indicatorX = centerX + (currentCents / 50) * (barWidth / 2)

  const color = isInTune ? '#00ff00' : '#ff4444'

  return (
    <Box
      ref={measureRef}
      data-testid="tuning-bar"
      style={{
        position: 'relative',
        width: '100%',
        height,
      }}
    >
      <svg width={width} height={height}>
        {/* Background bar track */}
        <rect
          x={barLeft}
          y={barY - 4}
          width={barWidth}
          height={8}
          rx={4}
          fill="#1a1a1a"
        />

        {/* Center target line */}
        <line
          x1={centerX}
          y1={barY - 16}
          x2={centerX}
          y2={barY + 16}
          stroke="#555"
          strokeWidth={2}
        />

        {/* Moving indicator line */}
        <line
          data-testid="indicator-line"
          x1={indicatorX}
          y1={barY - 20}
          x2={indicatorX}
          y2={barY + 20}
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />

        {/* FLAT label */}
        <text
          x={barLeft - 4}
          y={barY + 5}
          fill="#666"
          fontSize={12}
          textAnchor="end"
        >
          FLAT
        </text>

        {/* SHARP label */}
        <text
          x={barRight + 4}
          y={barY + 5}
          fill="#666"
          fontSize={12}
          textAnchor="start"
        >
          SHARP
        </text>
      </svg>
    </Box>
  )
}
