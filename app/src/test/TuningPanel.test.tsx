import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { TuningPanel, STICKY_TIMEOUT_MS, FREQUENCY_THROTTLE_MS } from '../components/TuningPanel'
import { TuningReading } from '../tuningReading'

const fakeString = {
  id: 'string-1',
  label: 'String 1 (G)',
  note: 'G4',
  frequencyHz: 392,
}

describe('TuningPanel', () => {
  it('should display placeholder detected note when no reading', () => {
    render(
      <MantineProvider>
        <TuningPanel />
      </MantineProvider>
    )

    expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: —')
  })

  it('should display detected note from reading', () => {
    const reading: TuningReading = {
      frequencyHz: 391.5,
      centsOff: -2,
      status: 'in_tune',
      confidence: 0.9,
      volume: 0.5,
      detectedString: fakeString,
    }

    render(
      <MantineProvider>
        <TuningPanel reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: G')
  })

  it('should display target frequency from detected string', () => {
    const reading: TuningReading = {
      frequencyHz: 391.5,
      centsOff: -2,
      status: 'in_tune',
      confidence: 0.9,
      volume: 0.5,
      detectedString: fakeString,
    }

    render(
      <MantineProvider>
        <TuningPanel reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByTestId('target-frequency')).toHaveTextContent('Target: 392 Hz')
  })

  it('should display placeholder current frequency when no reading', () => {
    render(
      <MantineProvider>
        <TuningPanel />
      </MantineProvider>
    )

    expect(screen.getByText(/Current: —/)).toBeInTheDocument()
  })

  it('should display "—" when frequencyHz is null', () => {
    const reading: TuningReading = {
      frequencyHz: null,
      centsOff: null,
      status: 'awaiting',
      confidence: 0,
      volume: 0,
      detectedString: null,
    }

    render(
      <MantineProvider>
        <TuningPanel reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByText(/Current: —/)).toBeInTheDocument()
  })

  it('should display current frequency when frequencyHz is present', () => {
    const reading: TuningReading = {
      frequencyHz: 391.5,
      centsOff: -2,
      status: 'in_tune',
      confidence: 0.9,
      volume: 0.5,
      detectedString: fakeString,
    }

    render(
      <MantineProvider>
        <TuningPanel reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByText(/Current: 391.5 Hz/)).toBeInTheDocument()
  })

  it('should render the analog meter', () => {
    const reading: TuningReading = {
      frequencyHz: 392,
      centsOff: 0,
      status: 'in_tune',
      confidence: 0.9,
      volume: 0.5,
      detectedString: fakeString,
    }

    render(
      <MantineProvider>
        <TuningPanel reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-bar')).toBeInTheDocument()
  })

  it('should show mic denied message when mic permission is denied', () => {
    render(
      <MantineProvider>
        <TuningPanel micPermissionDenied={true} />
      </MantineProvider>
    )

    expect(screen.getByTestId('mic-denied-message')).toHaveTextContent('Microphone access denied')
  })

  it('should not show mic denied message when mic permission is not denied', () => {
    render(
      <MantineProvider>
        <TuningPanel micPermissionDenied={false} />
      </MantineProvider>
    )

    expect(screen.queryByTestId('mic-denied-message')).not.toBeInTheDocument()
  })

  describe('sticky detected note', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('should persist detected note when reading transitions to null detectedString', () => {
      const readingWithNote: TuningReading = {
        frequencyHz: 391.5,
        centsOff: -2,
        status: 'in_tune',
        confidence: 0.9,
        volume: 0.5,
        detectedString: fakeString,
      }
      const readingWithoutNote: TuningReading = {
        frequencyHz: null,
        centsOff: null,
        status: 'awaiting',
        confidence: 0,
        volume: 0,
        detectedString: null,
      }

      const { rerender } = render(
        <MantineProvider>
          <TuningPanel reading={readingWithNote} />
        </MantineProvider>
      )

      expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: G')

      rerender(
        <MantineProvider>
          <TuningPanel reading={readingWithoutNote} />
        </MantineProvider>
      )

      expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: G')
      expect(screen.getByTestId('target-frequency')).toHaveTextContent('Target: 392 Hz')
    })

    it('should clear sticky note after 5 seconds of no detection', () => {
      vi.useFakeTimers({ now: 1000 })

      const readingWithNote: TuningReading = {
        frequencyHz: 391.5,
        centsOff: -2,
        status: 'in_tune',
        confidence: 0.9,
        volume: 0.5,
        detectedString: fakeString,
      }
      const readingWithoutNote: TuningReading = {
        frequencyHz: null,
        centsOff: null,
        status: 'awaiting',
        confidence: 0,
        volume: 0,
        detectedString: null,
      }

      const { rerender } = render(
        <MantineProvider>
          <TuningPanel reading={readingWithNote} />
        </MantineProvider>
      )

      rerender(
        <MantineProvider>
          <TuningPanel reading={readingWithoutNote} />
        </MantineProvider>
      )

      expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: G')

      act(() => {
        vi.advanceTimersByTime(STICKY_TIMEOUT_MS)
      })

      expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: —')
      expect(screen.getByTestId('target-frequency')).toHaveTextContent('Target: —')
    })
  })

  describe('throttled current frequency', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('should not update current frequency faster than the throttle interval', () => {
      vi.useFakeTimers({ now: 1000 })

      const reading1: TuningReading = {
        frequencyHz: 391.5,
        centsOff: -2,
        status: 'in_tune',
        confidence: 0.9,
        volume: 0.5,
        detectedString: fakeString,
      }

      const { rerender } = render(
        <MantineProvider>
          <TuningPanel reading={reading1} />
        </MantineProvider>
      )

      expect(screen.getByText(/Current: 391.5 Hz/)).toBeInTheDocument()

      // Advance less than throttle interval and rerender with new frequency
      act(() => {
        vi.advanceTimersByTime(50)
      })

      const reading2: TuningReading = {
        ...reading1,
        frequencyHz: 395.0,
      }

      rerender(
        <MantineProvider>
          <TuningPanel reading={reading2} />
        </MantineProvider>
      )

      // Should still show old frequency (throttled)
      expect(screen.getByText(/Current: 391.5 Hz/)).toBeInTheDocument()

      // Advance past the throttle interval
      act(() => {
        vi.advanceTimersByTime(FREQUENCY_THROTTLE_MS)
      })

      const reading3: TuningReading = {
        ...reading1,
        frequencyHz: 393.0,
      }

      rerender(
        <MantineProvider>
          <TuningPanel reading={reading3} />
        </MantineProvider>
      )

      // Now it should update
      expect(screen.getByText(/Current: 393.0 Hz/)).toBeInTheDocument()
    })

    it('should persist current frequency after signal drops, then clear after timeout', () => {
      vi.useFakeTimers({ now: 1000 })

      const readingWithFreq: TuningReading = {
        frequencyHz: 391.5,
        centsOff: -2,
        status: 'in_tune',
        confidence: 0.9,
        volume: 0.5,
        detectedString: fakeString,
      }
      const readingWithout: TuningReading = {
        frequencyHz: null,
        centsOff: null,
        status: 'awaiting',
        confidence: 0,
        volume: 0,
        detectedString: null,
      }

      const { rerender } = render(
        <MantineProvider>
          <TuningPanel reading={readingWithFreq} />
        </MantineProvider>
      )

      expect(screen.getByText(/Current: 391.5 Hz/)).toBeInTheDocument()

      // Signal drops
      rerender(
        <MantineProvider>
          <TuningPanel reading={readingWithout} />
        </MantineProvider>
      )

      // Should still show last frequency (sticky)
      expect(screen.getByText(/Current: 391.5 Hz/)).toBeInTheDocument()

      // After sticky timeout, should clear
      act(() => {
        vi.advanceTimersByTime(STICKY_TIMEOUT_MS)
      })

      expect(screen.getByText(/Current: —/)).toBeInTheDocument()
    })
  })
})
