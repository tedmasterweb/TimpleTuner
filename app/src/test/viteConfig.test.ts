import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Vite Config', () => {
  const configPath = resolve(__dirname, '../../vite.config.ts')
  const configContent = readFileSync(configPath, 'utf-8')

  it('should have VitePWA plugin imported', () => {
    expect(configContent).toContain("import { VitePWA } from 'vite-plugin-pwa'")
  })

  it('should have VitePWA plugin in plugins array', () => {
    expect(configContent).toContain('VitePWA(')
  })
})
