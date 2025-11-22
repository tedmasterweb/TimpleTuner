import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { StringSelection } from '../components/StringSelection'
import { TIMPLE_TUNING } from '../tuning'

const defaultProps = {
  selectedStringId: TIMPLE_TUNING[0].id,
  onSelectString: vi.fn(),
}

describe('StringSelection', () => {
  it('should render exactly 5 string rows', () => {
    render(
      <MantineProvider>
        <StringSelection {...defaultProps} />
      </MantineProvider>
    )

    const rows = screen.getAllByTestId('string-row')
    expect(rows).toHaveLength(5)
  })

  it('should display labels matching the tuning constant', () => {
    render(
      <MantineProvider>
        <StringSelection {...defaultProps} />
      </MantineProvider>
    )

    TIMPLE_TUNING.forEach((string) => {
      expect(screen.getByText(string.label)).toBeInTheDocument()
    })
  })

  it('should mark the selected row with aria-selected=true', () => {
    render(
      <MantineProvider>
        <StringSelection selectedStringId={TIMPLE_TUNING[1].id} onSelectString={vi.fn()} />
      </MantineProvider>
    )

    const rows = screen.getAllByTestId('string-row')
    rows.forEach((row, index) => {
      if (index === 1) {
        expect(row).toHaveAttribute('aria-selected', 'true')
      } else {
        expect(row).toHaveAttribute('aria-selected', 'false')
      }
    })
  })

  it('should call onSelectString with the correct id when a row is clicked', async () => {
    const onSelectString = vi.fn()
    const user = userEvent.setup()

    render(
      <MantineProvider>
        <StringSelection selectedStringId={TIMPLE_TUNING[0].id} onSelectString={onSelectString} />
      </MantineProvider>
    )

    const rows = screen.getAllByTestId('string-row')
    await user.click(rows[2])

    expect(onSelectString).toHaveBeenCalledTimes(1)
    expect(onSelectString).toHaveBeenCalledWith(TIMPLE_TUNING[2].id)
  })

  it('should mark tuned strings with data-tuned=true', () => {
    const tunedStrings = {
      [TIMPLE_TUNING[0].id]: 'tuned' as const,
      [TIMPLE_TUNING[2].id]: 'tuned' as const,
    }

    render(
      <MantineProvider>
        <StringSelection
          selectedStringId={TIMPLE_TUNING[0].id}
          onSelectString={vi.fn()}
          tunedStrings={tunedStrings}
        />
      </MantineProvider>
    )

    const rows = screen.getAllByTestId('string-row')

    expect(rows[0]).toHaveAttribute('data-tuned', 'true')
    expect(rows[1]).toHaveAttribute('data-tuned', 'false')
    expect(rows[2]).toHaveAttribute('data-tuned', 'true')
    expect(rows[3]).toHaveAttribute('data-tuned', 'false')
    expect(rows[4]).toHaveAttribute('data-tuned', 'false')
  })

  it('should show all strings as untuned when tunedStrings is empty', () => {
    render(
      <MantineProvider>
        <StringSelection
          selectedStringId={TIMPLE_TUNING[0].id}
          onSelectString={vi.fn()}
          tunedStrings={{}}
        />
      </MantineProvider>
    )

    const rows = screen.getAllByTestId('string-row')
    rows.forEach((row) => {
      expect(row).toHaveAttribute('data-tuned', 'false')
    })
  })
})
