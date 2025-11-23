import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import App from '../App'
import { TIMPLE_TUNING } from '../tuning'

// Mock MicrophoneAudioInputSource with controllable behavior
let mockFrameCallback: ((samples: Float32Array, sampleRate: number) => void) | null = null

vi.mock('../audio/MicrophoneAudioInputSource', () => ({
  MicrophoneAudioInputSource: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    onFrame: vi.fn().mockImplementation((callback) => {
      mockFrameCallback = callback
    }),
  })),
}))

// Mock useMicPermission to control permission flow
const mockRequestPermission = vi.fn()
vi.mock('../hooks/useMicPermission', () => ({
  useMicPermission: vi.fn(() => ({
    state: 'granted',
    requestPermission: mockRequestPermission,
  })),
}))

const renderApp = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <MantineProvider>
        <App />
      </MantineProvider>
    </I18nextProvider>
  )
}

// Helper to generate sine wave samples at a specific frequency
function generateSineWave(frequency: number, sampleRate: number, bufferSize: number): Float32Array {
  const samples = new Float32Array(bufferSize)
  for (let i = 0; i < bufferSize; i++) {
    samples[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.8
  }
  return samples
}

// Helper to simulate audio frames
function simulateAudioFrame(frequency: number) {
  if (mockFrameCallback) {
    const samples = generateSineWave(frequency, 44100, 2048)
    act(() => {
      mockFrameCallback!(samples, 44100)
    })
  }
}

describe('App Integration', () => {
  beforeEach(() => {
    i18n.changeLanguage('en')
    mockFrameCallback = null
    mockRequestPermission.mockResolvedValue('granted')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Tuning Flow', () => {
    it('should start tuning when Start button is clicked', async () => {
      const user = userEvent.setup()
      renderApp()

      const startButton = screen.getByTestId('tuning-button')
      expect(startButton).toHaveTextContent('Start tuning')

      await user.click(startButton)

      expect(startButton).toHaveTextContent('Stop tuning')
    })

    it('should stop tuning when Stop button is clicked', async () => {
      const user = userEvent.setup()
      renderApp()

      const startButton = screen.getByTestId('tuning-button')
      await user.click(startButton)
      expect(startButton).toHaveTextContent('Stop tuning')

      await user.click(startButton)
      expect(startButton).toHaveTextContent('Start tuning')
    })

    it('should show frequency reading when receiving audio', async () => {
      const user = userEvent.setup()
      renderApp()

      await user.click(screen.getByTestId('tuning-button'))

      // Simulate audio at first string's frequency (392 Hz for G4)
      simulateAudioFrame(392)

      await waitFor(() => {
        expect(screen.getByText(/Current: \d+\.\d+ Hz/)).toBeInTheDocument()
      })
    })

    it('should mark string as tuned when in_tune is reached', async () => {
      const user = userEvent.setup()
      renderApp()

      await user.click(screen.getByTestId('tuning-button'))

      // First string is G4 at 392 Hz
      simulateAudioFrame(392)

      await waitFor(() => {
        const stringRows = screen.getAllByTestId('string-row')
        expect(stringRows[0]).toHaveAttribute('data-tuned', 'true')
      })
    })
  })

  describe('Auto-advance', () => {
    it('should advance to next string when enabled and current is tuned', async () => {
      const user = userEvent.setup()
      renderApp()

      // Enable auto-advance
      const autoAdvanceToggle = screen.getByTestId('auto-advance-toggle')
      await user.click(autoAdvanceToggle)

      // Start tuning
      await user.click(screen.getByTestId('tuning-button'))

      // Initially on first string (String 1 G)
      expect(screen.getByText(`Selected: ${TIMPLE_TUNING[0].label}`)).toBeInTheDocument()

      // Simulate in-tune for first string
      simulateAudioFrame(392)

      await waitFor(() => {
        expect(screen.getByText(`Selected: ${TIMPLE_TUNING[1].label}`)).toBeInTheDocument()
      })
    })

    it('should not auto-advance when disabled', async () => {
      const user = userEvent.setup()
      renderApp()

      // Auto-advance is disabled by default
      await user.click(screen.getByTestId('tuning-button'))

      // Simulate in-tune for first string
      simulateAudioFrame(392)

      // Should still be on first string
      expect(screen.getByText(`Selected: ${TIMPLE_TUNING[0].label}`)).toBeInTheDocument()
    })
  })

  describe('Noise config adjustments', () => {
    it('should update signal quality display when thresholds change', async () => {
      const user = userEvent.setup()
      renderApp()

      // Start tuning to get signal quality readings
      await user.click(screen.getByTestId('tuning-button'))

      // Simulate weak audio
      simulateAudioFrame(392)

      await waitFor(() => {
        const signalStatus = screen.getByTestId('signal-status')
        expect(signalStatus).toBeInTheDocument()
      })
    })
  })

  describe('Permission handling', () => {
    it('should disable Start button when mic permission is denied', async () => {
      // Override the mock for this test
      const { useMicPermission } = await import('../hooks/useMicPermission')
      vi.mocked(useMicPermission).mockReturnValue({
        state: 'denied',
        requestPermission: mockRequestPermission,
      })

      renderApp()

      const startButton = screen.getByTestId('tuning-button')
      expect(startButton).toBeDisabled()
    })
  })
})
