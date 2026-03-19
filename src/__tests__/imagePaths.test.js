import { describe, it, expect } from 'vitest'
import { MiiImages } from '@/stores/imagePaths'

const EXPECTED_KEYS = [
  'upLeft',
  'up',
  'upRight',
  'downLeft',
  'down',
  'downRight',
  'left',
  'front',
  'right',
]

describe('MiiImages', () => {
  it('exports all nine directions', () => {
    expect(Object.keys(MiiImages).sort()).toEqual([...EXPECTED_KEYS].sort())
  })

  it('every value is a non-empty string path', () => {
    for (const key of EXPECTED_KEYS) {
      expect(MiiImages[key]).toEqual(expect.any(String))
      expect(MiiImages[key].length).toBeGreaterThan(0)
    }
  })

  it('all paths point to the mii directory', () => {
    for (const src of Object.values(MiiImages)) {
      expect(src).toMatch(/^\/images\/mii\//)
    }
  })

  it('all paths end with .png', () => {
    for (const src of Object.values(MiiImages)) {
      expect(src).toMatch(/\.png$/)
    }
  })
})
