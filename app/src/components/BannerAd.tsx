import { Paper, Text } from '@mantine/core'

interface BannerAdProps {
  onAdTap?: () => void
}

export function BannerAd({ onAdTap }: BannerAdProps) {
  return (
    <Paper
      data-testid="banner-ad"
      p="md"
      withBorder
      onClick={onAdTap}
      style={{ cursor: onAdTap ? 'pointer' : 'default', textAlign: 'center' }}
    >
      <Text size="sm" c="dimmed">Ad Banner</Text>
    </Paper>
  )
}
