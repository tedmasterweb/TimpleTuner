import { Stack, Box, Text, Group } from '@mantine/core'
import { TIMPLE_TUNING } from '../tuning'

export type StringTunedState = 'untuned' | 'tuned'

interface StringSelectionProps {
  selectedStringId: string
  onSelectString: (id: string) => void
  tunedStrings?: Record<string, StringTunedState>
}

export function StringSelection({
  selectedStringId,
  onSelectString,
  tunedStrings = {},
}: StringSelectionProps) {
  return (
    <Stack gap="xs">
      {TIMPLE_TUNING.map((string) => {
        const isSelected = string.id === selectedStringId
        const isTuned = tunedStrings[string.id] === 'tuned'
        return (
          <Box
            key={string.id}
            data-testid="string-row"
            data-tuned={isTuned}
            aria-selected={isSelected}
            onClick={() => onSelectString(string.id)}
            p="sm"
            style={{ cursor: 'pointer', backgroundColor: isSelected ? '#e3f2fd' : undefined }}
          >
            <Group justify="space-between">
              <Text>{string.label}</Text>
              {isTuned && <Text c="green">✓</Text>}
            </Group>
          </Box>
        )
      })}
    </Stack>
  )
}
