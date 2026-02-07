import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { TuningBar } from '../components/TuningBar'

describe('TuningBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render the tuning bar', () => {
    render(
      <MantineProvider>
        <TuningBar centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-bar')).toBeInTheDocument()
  })

  it('should render FLAT and SHARP labels', () => {
    render(
      <MantineProvider>
        <TuningBar centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByText('FLAT')).toBeInTheDocument()
    expect(screen.getByText('SHARP')).toBeInTheDocument()
  })

  it('should render with null centsOff', () => {
    render(
      <MantineProvider>
        <TuningBar centsOff={null} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-bar')).toBeInTheDocument()
  })

  it('should fill full width of its container', () => {
    render(
      <MantineProvider>
        <TuningBar centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    const bar = screen.getByTestId('tuning-bar')
    expect(bar).toHaveStyle({ width: '100%' })
  })

  it('should render the indicator line', () => {
    render(
      <MantineProvider>
        <TuningBar centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('indicator-line')).toBeInTheDocument()
  })

  it('should handle extreme positive centsOff values', () => {
    render(
      <MantineProvider>
        <TuningBar centsOff={100} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-bar')).toBeInTheDocument()
  })

  it('should handle extreme negative centsOff values', () => {
    render(
      <MantineProvider>
        <TuningBar centsOff={-100} isInTune={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-bar')).toBeInTheDocument()
  })

  it('should animate indicator position over time', async () => {
    const { rerender } = render(
      <MantineProvider>
        <TuningBar centsOff={0} isInTune={false} />
      </MantineProvider>
    )

    rerender(
      <MantineProvider>
        <TuningBar centsOff={30} isInTune={false} />
      </MantineProvider>
    )

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    expect(screen.getByTestId('tuning-bar')).toBeInTheDocument()
  })

  it('should use green color when in tune', () => {
    render(
      <MantineProvider>
        <TuningBar centsOff={0} isInTune={true} />
      </MantineProvider>
    )

    const indicator = screen.getByTestId('indicator-line')
    expect(indicator).toHaveAttribute('stroke', '#00ff00')
  })

  it('should use red color when out of tune', () => {
    render(
      <MantineProvider>
        <TuningBar centsOff={20} isInTune={false} />
      </MantineProvider>
    )

    const indicator = screen.getByTestId('indicator-line')
    expect(indicator).toHaveAttribute('stroke', '#ff4444')
  })
})
