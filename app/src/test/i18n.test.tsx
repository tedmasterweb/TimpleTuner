import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import App from '../App'

// Mock useMicPermission so the auto-start doesn't hit real getUserMedia
vi.mock('../hooks/useMicPermission', () => ({
  useMicPermission: vi.fn(() => ({
    state: 'unknown',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  })),
}))

// Mock MicrophoneAudioInputSource
vi.mock('../audio/MicrophoneAudioInputSource', () => ({
  MicrophoneAudioInputSource: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    onFrame: vi.fn(),
  })),
}))

const renderApp = async () => {
  await act(async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MantineProvider>
          <App />
        </MantineProvider>
      </I18nextProvider>
    )
  })
}

describe('i18n integration', () => {
  beforeEach(() => {
    i18n.changeLanguage('en')
  })

  it('should render English texts from translation files', async () => {
    await renderApp()

    expect(screen.getByText('Timple Tuner')).toBeInTheDocument()
  })

  it('should have EN/ES toggle buttons', async () => {
    await renderApp()

    expect(screen.getByTestId('lang-en')).toBeInTheDocument()
    expect(screen.getByTestId('lang-es')).toBeInTheDocument()
  })

  it('should switch to Spanish when ES button is clicked', async () => {
    await renderApp()

    expect(screen.getByText('Timple Tuner')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lang-es'))

    expect(screen.getByText('Afinador de Timple')).toBeInTheDocument()
  })

  it('should switch back to English when EN button is clicked', async () => {
    i18n.changeLanguage('es')

    await renderApp()

    expect(screen.getByText('Afinador de Timple')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lang-en'))

    expect(screen.getByText('Timple Tuner')).toBeInTheDocument()
  })
})
