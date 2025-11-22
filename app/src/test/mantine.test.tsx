import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button, MantineProvider } from '@mantine/core'

describe('Mantine integration', () => {
  it('should render a Mantine Button and find it by text', () => {
    render(
      <MantineProvider>
        <Button>Click</Button>
      </MantineProvider>
    )

    expect(screen.getByText('Click')).toBeInTheDocument()
  })
})
