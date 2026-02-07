import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { ReferenceTones } from '../components/ReferenceTones'

const mockStop = vi.fn()
const mockStart = vi.fn()
const mockConnect = vi.fn()
const mockSetValueAtTime = vi.fn()
const mockLinearRamp = vi.fn()

let lastOscillator: { onended: (() => void) | null; type: string; frequency: { setValueAtTime: typeof mockSetValueAtTime } }

function createMockAudioContext() {
  return {
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(() => {
      const osc = {
        type: 'sine',
        frequency: { setValueAtTime: mockSetValueAtTime },
        connect: mockConnect,
        start: mockStart,
        stop: mockStop,
        onended: null as (() => void) | null,
      }
      lastOscillator = osc
      return osc
    }),
    createGain: vi.fn(() => ({
      gain: {
        setValueAtTime: mockSetValueAtTime,
        linearRampToValueAtTime: mockLinearRamp,
      },
      connect: mockConnect,
    })),
  }
}

describe('ReferenceTones', () => {
  let MockAudioContext: ReturnType<typeof vi.fn>

  beforeEach(() => {
    MockAudioContext = vi.fn(createMockAudioContext)
    vi.stubGlobal('AudioContext', MockAudioContext)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderComponent = () =>
    render(
      <MantineProvider>
        <ReferenceTones />
      </MantineProvider>,
    )

  it('renders 5 buttons with correct note labels', () => {
    renderComponent()

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)

    expect(screen.getByText('G')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()
  })

  it('creates an OscillatorNode when a button is clicked', () => {
    renderComponent()

    fireEvent.click(screen.getByText('G'))

    expect(MockAudioContext).toHaveBeenCalled()
    const ctx = MockAudioContext.mock.results[0].value
    expect(ctx.createOscillator).toHaveBeenCalled()
    expect(ctx.createGain).toHaveBeenCalled()
    expect(mockStart).toHaveBeenCalled()
    expect(mockStop).toHaveBeenCalled()
  })

  it('sets the correct frequency for the clicked string', () => {
    renderComponent()

    fireEvent.click(screen.getByText('A'))

    expect(mockSetValueAtTime).toHaveBeenCalledWith(440.0, 0)
  })

  it('shows filled variant while playing', () => {
    renderComponent()

    const gButton = screen.getByTestId('ref-tone-string-1')
    expect(gButton).toHaveAttribute('data-variant', 'outline')

    fireEvent.click(gButton)

    expect(gButton).toHaveAttribute('data-variant', 'filled')
  })

  it('resets to outline variant after tone ends', () => {
    renderComponent()

    const gButton = screen.getByTestId('ref-tone-string-1')
    fireEvent.click(gButton)

    expect(gButton).toHaveAttribute('data-variant', 'filled')

    // Simulate oscillator ending
    act(() => {
      lastOscillator.onended?.()
    })

    expect(gButton).toHaveAttribute('data-variant', 'outline')
  })

  it('stops current tone and restarts when same button clicked again', () => {
    renderComponent()

    fireEvent.click(screen.getByText('G'))
    expect(mockStart).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('G'))
    // 3 stops: 1 scheduled from first click, 1 manual stop of first osc, 1 scheduled from second click
    expect(mockStop).toHaveBeenCalledTimes(3)
    expect(mockStart).toHaveBeenCalledTimes(2)
  })
})
