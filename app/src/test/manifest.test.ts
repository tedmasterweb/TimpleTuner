import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Web App Manifest', () => {
  const manifestPath = resolve(__dirname, '../../public/manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))

  it('should have a non-empty name', () => {
    expect(typeof manifest.name).toBe('string')
    expect(manifest.name.length).toBeGreaterThan(0)
  })

  it('should have a non-empty short_name', () => {
    expect(typeof manifest.short_name).toBe('string')
    expect(manifest.short_name.length).toBeGreaterThan(0)
  })

  it('should have display set to standalone', () => {
    expect(manifest.display).toBe('standalone')
  })

  it('should have start_url defined', () => {
    expect(manifest.start_url).toBeDefined()
  })
})
