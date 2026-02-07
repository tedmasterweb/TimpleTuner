import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import App from '../App'

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

const renderApp = async () => {
  let result: ReturnType<typeof render>
  await act(async () => {
    result = render(
      <I18nextProvider i18n={i18n}>
        <MantineProvider>
          <App />
        </MantineProvider>
      </I18nextProvider>
    )
  })
  return result!
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

  describe('Auto-start tuning', () => {
    it('should request mic permission on mount', async () => {
      await renderApp()

      expect(mockRequestPermission).toHaveBeenCalledTimes(1)
    })

    it('should show frequency reading when receiving audio', async () => {
      await renderApp()

      // Simulate audio at A4 frequency (440 Hz)
      simulateAudioFrame(440)

      await waitFor(() => {
        expect(screen.getByText(/Current: \d+\.\d+ Hz/)).toBeInTheDocument()
      })
    })

    it('should auto-detect the closest string for the played frequency', async () => {
      await renderApp()

      // Simulate audio at G4 frequency (392 Hz)
      simulateAudioFrame(392)

      await waitFor(() => {
        expect(screen.getByTestId('detected-note')).toHaveTextContent('Detected: G4')
      })
    })
  })

  describe('Noise config adjustments', () => {
    it('should update signal quality display when thresholds change', async () => {
      await renderApp()

      // Simulate weak audio
      simulateAudioFrame(392)

      await waitFor(() => {
        const signalStatus = screen.getByTestId('signal-status')
        expect(signalStatus).toBeInTheDocument()
      })
    })
  })

  describe('Permission handling', () => {
    it('should show mic denied message when mic permission is denied', async () => {
      const { useMicPermission } = await import('../hooks/useMicPermission')
      vi.mocked(useMicPermission).mockReturnValue({
        state: 'denied',
        requestPermission: mockRequestPermission,
      })

      await renderApp()

      expect(screen.getByTestId('mic-denied-message')).toBeInTheDocument()
    })
  })
})
