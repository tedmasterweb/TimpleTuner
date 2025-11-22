import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import App from '../App'
import { TIMPLE_TUNING } from '../tuning'

const renderApp = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <MantineProvider>
        <App />
      </MantineProvider>
    </I18nextProvider>
  )
}

describe('App', () => {
  beforeEach(() => {
    i18n.changeLanguage('en')
  })

  it('should render with Timple Tuner text', () => {
    renderApp()

    expect(screen.getByText('Timple Tuner')).toBeInTheDocument()
    expect(screen.getByText('Tune all 5 strings of your timple')).toBeInTheDocument()
  })

  it('should run in jsdom environment', () => {
    expect(typeof window).not.toBe('undefined')
  })

  it('should have 5 sections in correct DOM order', () => {
    renderApp()

    const expectedOrder = [
      'header-section',
      'tuning-panel-section',
      'string-selection-section',
      'banner-ad-section',
      'status-panel-section',
    ]

    // Verify all sections exist
    const sections = expectedOrder.map((testId) => screen.getByTestId(testId))
    expect(sections).toHaveLength(5)

    // Verify DOM order by comparing document positions
    for (let i = 0; i < sections.length - 1; i++) {
      const position = sections[i].compareDocumentPosition(sections[i + 1])
      // DOCUMENT_POSITION_FOLLOWING = 4
      expect(position & 4).toBe(4)
    }
  })

  it('should highlight first string initially and update on click', async () => {
    const user = userEvent.setup()

    renderApp()

    const rows = screen.getAllByTestId('string-row')

    // Initially first string is highlighted
    expect(rows[0]).toHaveAttribute('aria-selected', 'true')
    expect(rows[1]).toHaveAttribute('aria-selected', 'false')

    // Click the third string
    await user.click(rows[2])

    // Now third string is highlighted, first is not
    expect(rows[0]).toHaveAttribute('aria-selected', 'false')
    expect(rows[2]).toHaveAttribute('aria-selected', 'true')
  })

  it('should update TuningPanel when a different string is selected', async () => {
    const user = userEvent.setup()

    renderApp()

    const tuningPanel = screen.getByTestId('tuning-panel-section')

    // Initially shows first string's label in TuningPanel
    expect(tuningPanel).toHaveTextContent(TIMPLE_TUNING[0].label)

    // Click the third string
    const rows = screen.getAllByTestId('string-row')
    await user.click(rows[2])

    // TuningPanel now shows third string's label
    expect(tuningPanel).toHaveTextContent(TIMPLE_TUNING[2].label)
  })

  it('should show mic status in StatusPanel', () => {
    renderApp()

    const statusPanel = screen.getByTestId('status-panel-section')

    // Initially mic status is unknown, so should show "Not requested"
    expect(statusPanel).toHaveTextContent('Mic: Not requested')
  })
})
