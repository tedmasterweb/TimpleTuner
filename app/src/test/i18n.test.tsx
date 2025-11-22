import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import App from '../App'

describe('i18n integration', () => {
  beforeEach(() => {
    i18n.changeLanguage('en')
  })

  it('should render English texts from translation files', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MantineProvider>
          <App />
        </MantineProvider>
      </I18nextProvider>
    )

    expect(screen.getByText('Timple Tuner')).toBeInTheDocument()
    expect(screen.getByText('Tune all 5 strings of your timple')).toBeInTheDocument()
  })

  it('should have EN/ES toggle buttons', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MantineProvider>
          <App />
        </MantineProvider>
      </I18nextProvider>
    )

    expect(screen.getByTestId('lang-en')).toBeInTheDocument()
    expect(screen.getByTestId('lang-es')).toBeInTheDocument()
  })

  it('should switch to Spanish when ES button is clicked', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MantineProvider>
          <App />
        </MantineProvider>
      </I18nextProvider>
    )

    expect(screen.getByText('Timple Tuner')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lang-es'))

    expect(screen.getByText('Afinador de Timple')).toBeInTheDocument()
    expect(screen.getByText('Afina las 5 cuerdas de tu timple')).toBeInTheDocument()
  })

  it('should switch back to English when EN button is clicked', () => {
    i18n.changeLanguage('es')

    render(
      <I18nextProvider i18n={i18n}>
        <MantineProvider>
          <App />
        </MantineProvider>
      </I18nextProvider>
    )

    expect(screen.getByText('Afinador de Timple')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lang-en'))

    expect(screen.getByText('Timple Tuner')).toBeInTheDocument()
    expect(screen.getByText('Tune all 5 strings of your timple')).toBeInTheDocument()
  })
})
