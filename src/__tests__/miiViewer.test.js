import { describe, it, expect } from 'vitest'

const MIRROR_FALLBACKS = {
  upRight: { src: 'upLeft', flip: true },
  right: { src: 'left', flip: true },
  downLeft: { src: 'downRight', flip: true },
  down: { src: 'front', flip: false },
}

const ALL_KEYS = [
  'upLeft',
  'up',
  'upRight',
  'left',
  'front',
  'right',
  'downLeft',
  'down',
  'downRight',
]

const GRID = [
  ['upLeft', 'up', 'upRight'],
  ['left', 'front', 'right'],
  ['downLeft', 'down', 'downRight'],
]

function resolveImages(miiImages) {
  const resolved = {}
  ALL_KEYS.forEach((key) => {
    if (miiImages[key]) {
      resolved[key] = { src: miiImages[key], flip: false }
    } else {
      const fb = MIRROR_FALLBACKS[key]
      if (fb && miiImages[fb.src]) {
        resolved[key] = { src: miiImages[fb.src], flip: fb.flip }
      } else {
        resolved[key] = { src: miiImages.front, flip: false }
      }
    }
  })
  return resolved
}

function gridKeyFromNormalized(x, y) {
  const col = x < 0.33 ? 0 : x < 0.66 ? 1 : 2
  const row = y < 0.33 ? 0 : y < 0.66 ? 1 : 2
  return GRID[row][col]
}

describe('MiiViewer logic', () => {
  describe('resolveImages', () => {
    it('uses direct source when image exists', () => {
      const full = Object.fromEntries(ALL_KEYS.map((k) => [k, `/img/${k}.png`]))
      const resolved = resolveImages(full)
      expect(resolved.front.src).toBe('/img/front.png')
      expect(resolved.front.flip).toBe(false)
    })

    it('mirrors upRight from upLeft when upRight is missing', () => {
      const images = {
        upLeft: '/a.png',
        up: '/b.png',
        front: '/f.png',
        left: '/l.png',
        downRight: '/dr.png',
        down: '/d.png',
      }
      const resolved = resolveImages(images)
      expect(resolved.upRight.src).toBe('/a.png')
      expect(resolved.upRight.flip).toBe(true)
    })

    it('mirrors right from left when right is missing', () => {
      const images = { left: '/l.png', front: '/f.png' }
      const resolved = resolveImages(images)
      expect(resolved.right.src).toBe('/l.png')
      expect(resolved.right.flip).toBe(true)
    })

    it('falls back to front when source and mirror are both missing', () => {
      const images = { front: '/f.png' }
      const resolved = resolveImages(images)
      expect(resolved.up.src).toBe('/f.png')
      expect(resolved.up.flip).toBe(false)
    })
  })

  describe('gridKeyFromNormalized', () => {
    it('top-left corner maps to upLeft', () => {
      expect(gridKeyFromNormalized(0.1, 0.1)).toBe('upLeft')
    })

    it('center maps to front', () => {
      expect(gridKeyFromNormalized(0.5, 0.5)).toBe('front')
    })

    it('bottom-right corner maps to downRight', () => {
      expect(gridKeyFromNormalized(0.9, 0.9)).toBe('downRight')
    })

    it('top-center maps to up', () => {
      expect(gridKeyFromNormalized(0.5, 0.1)).toBe('up')
    })

    it('left-center maps to left', () => {
      expect(gridKeyFromNormalized(0.1, 0.5)).toBe('left')
    })
  })
})
