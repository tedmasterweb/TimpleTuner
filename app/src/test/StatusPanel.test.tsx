import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { StatusPanel, MicPermissionStatus } from '../components/StatusPanel'
import { NoiseHandlingConfig } from '../noiseConfig'

describe('StatusPanel', () => {
  it('should show "Mic: Not requested" for unknown status', () => {
    render(
      <MantineProvider>
        <StatusPanel micStatus="unknown" />
      </MantineProvider>
    )

    expect(screen.getByText('Mic: Not requested')).toBeInTheDocument()
  })

  it('should show "Mic: Granted" for granted status', () => {
    render(
      <MantineProvider>
        <StatusPanel micStatus="granted" />
      </MantineProvider>
    )

    expect(screen.getByText('Mic: Granted')).toBeInTheDocument()
  })

  it('should show "Mic: Denied" for denied status', () => {
    render(
      <MantineProvider>
        <StatusPanel micStatus="denied" />
      </MantineProvider>
    )

    expect(screen.getByText('Mic: Denied')).toBeInTheDocument()
  })

  it('should render all mic statuses correctly', () => {
    const statuses: MicPermissionStatus[] = ['unknown', 'granted', 'denied']
    const expectedTexts = ['Mic: Not requested', 'Mic: Granted', 'Mic: Denied']

    statuses.forEach((status, index) => {
      const { unmount } = render(
        <MantineProvider>
          <StatusPanel micStatus={status} />
        </MantineProvider>
      )

      expect(screen.getByText(expectedTexts[index])).toBeInTheDocument()
      unmount()
    })
  })

  it('should display noise config thresholds when provided', () => {
    const noiseConfig: NoiseHandlingConfig = {
      minVolumeThreshold: 0.15,
      minConfidenceThreshold: 0.8,
    }

    render(
      <MantineProvider>
        <StatusPanel micStatus="granted" noiseConfig={noiseConfig} />
      </MantineProvider>
    )

    expect(screen.getByText('Volume threshold: 0.15')).toBeInTheDocument()
    expect(screen.getByText('Confidence threshold: 0.8')).toBeInTheDocument()
  })

  it('should show "Online" when isOnline is true', () => {
    render(
      <MantineProvider>
        <StatusPanel micStatus="granted" isOnline={true} />
      </MantineProvider>
    )

    expect(screen.getByTestId('online-status')).toHaveTextContent('Online')
    expect(screen.getByTestId('online-status')).not.toHaveTextContent('offline')
  })

  it('should show offline message when isOnline is false', () => {
    render(
      <MantineProvider>
        <StatusPanel micStatus="granted" isOnline={false} />
      </MantineProvider>
    )

    expect(screen.getByTestId('online-status')).toHaveTextContent('Offline')
    expect(screen.getByTestId('online-status')).toHaveTextContent('Basic tuning works offline once loaded.')
  })

  it('should show "Signal too weak" when volume is below threshold', () => {
    const noiseConfig: NoiseHandlingConfig = {
      minVolumeThreshold: 0.1,
      minConfidenceThreshold: 0.7,
    }
    const signalQuality = { volume: 0.05, confidence: 0.9 }

    render(
      <MantineProvider>
        <StatusPanel
          micStatus="granted"
          noiseConfig={noiseConfig}
          signalQuality={signalQuality}
        />
      </MantineProvider>
    )

    expect(screen.getByTestId('signal-status')).toHaveTextContent('Signal too weak')
  })

  it('should show "Noisy environment" when confidence is below threshold', () => {
    const noiseConfig: NoiseHandlingConfig = {
      minVolumeThreshold: 0.1,
      minConfidenceThreshold: 0.7,
    }
    const signalQuality = { volume: 0.5, confidence: 0.5 }

    render(
      <MantineProvider>
        <StatusPanel
          micStatus="granted"
          noiseConfig={noiseConfig}
          signalQuality={signalQuality}
        />
      </MantineProvider>
    )

    expect(screen.getByTestId('signal-status')).toHaveTextContent('Noisy environment')
  })

  it('should show "Good signal" when volume and confidence are above thresholds', () => {
    const noiseConfig: NoiseHandlingConfig = {
      minVolumeThreshold: 0.1,
      minConfidenceThreshold: 0.7,
    }
    const signalQuality = { volume: 0.5, confidence: 0.9 }

    render(
      <MantineProvider>
        <StatusPanel
          micStatus="granted"
          noiseConfig={noiseConfig}
          signalQuality={signalQuality}
        />
      </MantineProvider>
    )

    expect(screen.getByTestId('signal-status')).toHaveTextContent('Good signal')
  })

  it('should render sliders when onNoiseConfigChange is provided', () => {
    const noiseConfig: NoiseHandlingConfig = {
      minVolumeThreshold: 0.1,
      minConfidenceThreshold: 0.7,
    }
    const onNoiseConfigChange = vi.fn()

    render(
      <MantineProvider>
        <StatusPanel
          micStatus="granted"
          noiseConfig={noiseConfig}
          onNoiseConfigChange={onNoiseConfigChange}
        />
      </MantineProvider>
    )

    expect(screen.getByTestId('volume-threshold-slider')).toBeInTheDocument()
    expect(screen.getByTestId('confidence-threshold-slider')).toBeInTheDocument()
  })

  it('should not render sliders when onNoiseConfigChange is not provided', () => {
    const noiseConfig: NoiseHandlingConfig = {
      minVolumeThreshold: 0.1,
      minConfidenceThreshold: 0.7,
    }

    render(
      <MantineProvider>
        <StatusPanel micStatus="granted" noiseConfig={noiseConfig} />
      </MantineProvider>
    )

    expect(screen.queryByTestId('volume-threshold-slider')).not.toBeInTheDocument()
    expect(screen.queryByTestId('confidence-threshold-slider')).not.toBeInTheDocument()
  })

  it('should call onNoiseConfigChange with updated volume threshold', () => {
    const noiseConfig: NoiseHandlingConfig = {
      minVolumeThreshold: 0.1,
      minConfidenceThreshold: 0.7,
    }
    const onNoiseConfigChange = vi.fn()

    render(
      <MantineProvider>
        <StatusPanel
          micStatus="granted"
          noiseConfig={noiseConfig}
          onNoiseConfigChange={onNoiseConfigChange}
        />
      </MantineProvider>
    )

    const volumeSliderContainer = screen.getByTestId('volume-threshold-slider')
    const volumeSlider = volumeSliderContainer.querySelector('[role="slider"]')!
    fireEvent.keyDown(volumeSlider, { key: 'ArrowRight' })

    expect(onNoiseConfigChange).toHaveBeenCalled()
    const call = onNoiseConfigChange.mock.calls[0][0]
    expect(call.minVolumeThreshold).toBeGreaterThan(0.1)
    expect(call.minConfidenceThreshold).toBe(0.7)
  })

  it('should call onNoiseConfigChange with updated confidence threshold', () => {
    const noiseConfig: NoiseHandlingConfig = {
      minVolumeThreshold: 0.1,
      minConfidenceThreshold: 0.7,
    }
    const onNoiseConfigChange = vi.fn()

    render(
      <MantineProvider>
        <StatusPanel
          micStatus="granted"
          noiseConfig={noiseConfig}
          onNoiseConfigChange={onNoiseConfigChange}
        />
      </MantineProvider>
    )

    const confidenceSliderContainer = screen.getByTestId('confidence-threshold-slider')
    const confidenceSlider = confidenceSliderContainer.querySelector('[role="slider"]')!
    fireEvent.keyDown(confidenceSlider, { key: 'ArrowRight' })

    expect(onNoiseConfigChange).toHaveBeenCalled()
    const call = onNoiseConfigChange.mock.calls[0][0]
    expect(call.minVolumeThreshold).toBe(0.1)
    expect(call.minConfidenceThreshold).toBeGreaterThan(0.7)
  })

  it('should display updated threshold values after prop change', () => {
    const noiseConfig: NoiseHandlingConfig = {
      minVolumeThreshold: 0.25,
      minConfidenceThreshold: 0.85,
    }
    const onNoiseConfigChange = vi.fn()

    render(
      <MantineProvider>
        <StatusPanel
          micStatus="granted"
          noiseConfig={noiseConfig}
          onNoiseConfigChange={onNoiseConfigChange}
        />
      </MantineProvider>
    )

    expect(screen.getByText('Volume threshold: 0.25')).toBeInTheDocument()
    expect(screen.getByText('Confidence threshold: 0.85')).toBeInTheDocument()
  })
})
