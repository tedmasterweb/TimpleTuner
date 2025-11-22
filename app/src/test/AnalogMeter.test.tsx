import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { AnalogMeter } from '../components/AnalogMeter'

describe('AnalogMeter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render the meter', () => {
    render(
      <MantineProvider>
        <AnalogMeter centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('analog-meter')).toBeInTheDocument()
  })

  it('should render FLAT and SHARP labels', () => {
    render(
      <MantineProvider>
        <AnalogMeter centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByText('FLAT')).toBeInTheDocument()
    expect(screen.getByText('SHARP')).toBeInTheDocument()
  })

  it('should render with null centsOff', () => {
    render(
      <MantineProvider>
        <AnalogMeter centsOff={null} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('analog-meter')).toBeInTheDocument()
  })

  it('should render with custom size', () => {
    render(
      <MantineProvider>
        <AnalogMeter centsOff={0} isInTune={false} size={200} />
      </MantineProvider>
    )

    const meter = screen.getByTestId('analog-meter')
    expect(meter).toHaveStyle({ width: '200px' })
  })

  it('should use default size of 280', () => {
    render(
      <MantineProvider>
        <AnalogMeter centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    const meter = screen.getByTestId('analog-meter')
    expect(meter).toHaveStyle({ width: '280px' })
  })

  it('should render LED markers', () => {
    const { container } = render(
      <MantineProvider>
        <AnalogMeter centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    // Should have 11 markers (-50 to +50 in steps of 10)
    const circles = container.querySelectorAll('circle')
    // Multiple circles per marker (glow + main) plus pivot point
    expect(circles.length).toBeGreaterThan(10)
  })

  it('should render the main needle line', () => {
    const { container } = render(
      <MantineProvider>
        <AnalogMeter centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    const lines = container.querySelectorAll('line')
    // 3 trail lines + 1 main needle
    expect(lines.length).toBe(4)
  })

  it('should handle extreme positive centsOff values', () => {
    render(
      <MantineProvider>
        <AnalogMeter centsOff={100} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('analog-meter')).toBeInTheDocument()
  })

  it('should handle extreme negative centsOff values', () => {
    render(
      <MantineProvider>
        <AnalogMeter centsOff={-100} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('analog-meter')).toBeInTheDocument()
  })

  it('should animate needle position over time', async () => {
    const { rerender } = render(
      <MantineProvider>
        <AnalogMeter centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    // Change centsOff value
    rerender(
      <MantineProvider>
        <AnalogMeter centsOff={30} isInTune={false} />
      </MantineProvider>
    )

    // Advance animation frames
    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    expect(screen.getByTestId('analog-meter')).toBeInTheDocument()
  })
})
