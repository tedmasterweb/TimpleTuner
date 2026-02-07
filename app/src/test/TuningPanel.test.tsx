import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { TuningPanel, STICKY_TIMEOUT_MS } from '../components/TuningPanel'
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

    expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: G4')
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

    expect(screen.getByTestId('analog-meter')).toBeInTheDocument()
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

      expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: G4')

      rerender(
        <MantineProvider>
          <TuningPanel reading={readingWithoutNote} />
        </MantineProvider>
      )

      expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: G4')
      expect(screen.getByTestId('target-frequency')).toHaveTextContent('Target: 392 Hz')
    })

    it('should clear sticky note after 5 seconds of no detection', () => {
      vi.useFakeTimers()

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

      expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: G4')

      act(() => {
        vi.advanceTimersByTime(STICKY_TIMEOUT_MS)
      })

      expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: —')
      expect(screen.getByTestId('target-frequency')).toHaveTextContent('Target: —')
    })
  })
})
