import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { BannerAd } from '../components/BannerAd'

describe('BannerAd', () => {
  it('should render with data-testid banner-ad', () => {
    render(
      <MantineProvider>
        <BannerAd />
      </MantineProvider>
    )

    expect(screen.getByTestId('banner-ad')).toBeInTheDocument()
  })

  it('should display Ad Banner text', () => {
    render(
      <MantineProvider>
        <BannerAd />
      </MantineProvider>
    )

    expect(screen.getByText('Ad Banner')).toBeInTheDocument()
  })

  it('should call onAdTap when clicked', () => {
    const onAdTap = vi.fn()

    render(
      <MantineProvider>
        <BannerAd onAdTap={onAdTap} />
      </MantineProvider>
    )

    fireEvent.click(screen.getByTestId('banner-ad'))

    expect(onAdTap).toHaveBeenCalledTimes(1)
  })

  it('should call onAdTap exactly once per click', () => {
    const onAdTap = vi.fn()

    render(
      <MantineProvider>
        <BannerAd onAdTap={onAdTap} />
      </MantineProvider>
    )

    const banner = screen.getByTestId('banner-ad')
    fireEvent.click(banner)
    fireEvent.click(banner)

    expect(onAdTap).toHaveBeenCalledTimes(2)
  })
})
