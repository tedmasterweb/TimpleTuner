import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { TuningPanel } from '../components/TuningPanel'
import { TimpleString } from '../tuning'
import { TuningReading } from '../tuningReading'

const fakeString: TimpleString = {
  id: 'string-1',
  label: 'String 1 (G)',
  note: 'G4',
  frequencyHz: 392,
}

describe('TuningPanel', () => {
  it('should display the selected string label', () => {
    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} />
      </MantineProvider>
    )

    expect(screen.getByText(/String 1 \(G\)/)).toBeInTheDocument()
  })

  it('should display the target note and frequency', () => {
    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} />
      </MantineProvider>
    )

    expect(screen.getByText(/G4/)).toBeInTheDocument()
    expect(screen.getByText(/392 Hz/)).toBeInTheDocument()
  })

  it('should display placeholder current frequency and status when no reading', () => {
    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} />
      </MantineProvider>
    )

    expect(screen.getByText(/Current: —/)).toBeInTheDocument()
    expect(screen.getByText(/Awaiting input/)).toBeInTheDocument()
  })

  it('should show "Awaiting input" for awaiting status', () => {
    const reading: TuningReading = {
      frequencyHz: null,
      centsOff: null,
      status: 'awaiting',
      confidence: 0,
      volume: 0,
    }

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByText(/Awaiting input/)).toBeInTheDocument()
  })

  it('should show "In tune" for in_tune status', () => {
    const reading: TuningReading = {
      frequencyHz: 392,
      centsOff: 0,
      status: 'in_tune',
      confidence: 0.9,
      volume: 0.5,
    }

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByText(/In tune/)).toBeInTheDocument()
  })

  it('should show "Too sharp" for sharp status', () => {
    const reading: TuningReading = {
      frequencyHz: 400,
      centsOff: 15,
      status: 'sharp',
      confidence: 0.9,
      volume: 0.5,
    }

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByText(/Too sharp/)).toBeInTheDocument()
  })

  it('should show "Too flat" for flat status', () => {
    const reading: TuningReading = {
      frequencyHz: 385,
      centsOff: -15,
      status: 'flat',
      confidence: 0.9,
      volume: 0.5,
    }

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByText(/Too flat/)).toBeInTheDocument()
  })

  it('should show "Too noisy" for noisy status', () => {
    const reading: TuningReading = {
      frequencyHz: 390,
      centsOff: -5,
      status: 'noisy',
      confidence: 0.3,
      volume: 0.5,
    }

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByText(/Too noisy/)).toBeInTheDocument()
  })

  it('should display "—" when frequencyHz is null', () => {
    const reading: TuningReading = {
      frequencyHz: null,
      centsOff: null,
      status: 'awaiting',
      confidence: 0,
      volume: 0,
    }

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} reading={reading} />
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
    }

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByText(/Current: 391.5 Hz/)).toBeInTheDocument()
  })

  it('should show tuning-position="center" when centsOff is 0', () => {
    const reading: TuningReading = {
      frequencyHz: 392,
      centsOff: 0,
      status: 'in_tune',
      confidence: 0.9,
      volume: 0.5,
    }

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-indicator')).toHaveAttribute('data-tuning-position', 'center')
  })

  it('should show tuning-position="flat" when centsOff is negative', () => {
    const reading: TuningReading = {
      frequencyHz: 385,
      centsOff: -15,
      status: 'flat',
      confidence: 0.9,
      volume: 0.5,
    }

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-indicator')).toHaveAttribute('data-tuning-position', 'flat')
  })

  it('should show tuning-position="sharp" when centsOff is positive', () => {
    const reading: TuningReading = {
      frequencyHz: 400,
      centsOff: 15,
      status: 'sharp',
      confidence: 0.9,
      volume: 0.5,
    }

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} reading={reading} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-indicator')).toHaveAttribute('data-tuning-position', 'sharp')
  })

  it('should show "Start tuning" button when not running', () => {
    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} isRunning={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-button')).toHaveTextContent('Start tuning')
  })

  it('should show "Stop tuning" button when running', () => {
    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} isRunning={true} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-button')).toHaveTextContent('Stop tuning')
  })

  it('should call onStart when clicking Start tuning button', async () => {
    const onStart = vi.fn()
    const user = userEvent.setup()

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} isRunning={false} onStart={onStart} />
      </MantineProvider>
    )

    await user.click(screen.getByTestId('tuning-button'))

    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('should call onStop when clicking Stop tuning button', async () => {
    const onStop = vi.fn()
    const user = userEvent.setup()

    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} isRunning={true} onStop={onStop} />
      </MantineProvider>
    )

    await user.click(screen.getByTestId('tuning-button'))

    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('should disable button when mic permission is denied', () => {
    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} micPermissionDenied={true} />
      </MantineProvider>
    )

    expect(screen.getByTestId('tuning-button')).toBeDisabled()
  })

  it('should show auto-advance toggle', () => {
    render(
      <MantineProvider>
        <TuningPanel selectedString={fakeString} />
      </MantineProvider>
    )

    expect(screen.getByTestId('auto-advance-toggle')).toBeInTheDocument()
  })

  it('should call onAutoAdvanceChange when toggle is clicked', async () => {
    const onAutoAdvanceChange = vi.fn()
    const user = userEvent.setup()

    render(
      <MantineProvider>
        <TuningPanel
          selectedString={fakeString}
          autoAdvanceEnabled={false}
          onAutoAdvanceChange={onAutoAdvanceChange}
        />
      </MantineProvider>
    )

    await user.click(screen.getByTestId('auto-advance-toggle'))

    expect(onAutoAdvanceChange).toHaveBeenCalledWith(true)
  })
})
