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

  it('should render the analog meter', () => {
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

    expect(screen.getByTestId('analog-meter')).toBeInTheDocument()
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
