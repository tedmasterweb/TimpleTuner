import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
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

describe('App', () => {
  beforeEach(() => {
    i18n.changeLanguage('en')
  })

  it('should render with Timple Tuner text', async () => {
    await renderApp()

    expect(screen.getByText('Timple Tuner')).toBeInTheDocument()
  })

  it('should run in jsdom environment', () => {
    expect(typeof window).not.toBe('undefined')
  })

  it('should have sections in correct DOM order', async () => {
    await renderApp()

    const expectedOrder = [
      'header-section',
      'tuning-panel-section',
      'banner-ad-section',
      'status-panel-section',
    ]

    // Verify all sections exist
    const sections = expectedOrder.map((testId) => screen.getByTestId(testId))
    expect(sections).toHaveLength(4)

    // Verify DOM order by comparing document positions
    for (let i = 0; i < sections.length - 1; i++) {
      const position = sections[i].compareDocumentPosition(sections[i + 1])
      // DOCUMENT_POSITION_FOLLOWING = 4
      expect(position & 4).toBe(4)
    }
  })
})
