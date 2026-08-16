// mirror missing render from opposite side instead of shipping a blank slot
export const MIRROR_FALLBACKS = {
  upRight: { src: 'upLeft', flip: true },
  right: { src: 'left', flip: true },
  downLeft: { src: 'downRight', flip: true },
  down: { src: 'front', flip: false },
}

export const ALL_KEYS = [
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

export const GRID = [
  ['upLeft', 'up', 'upRight'],
  ['left', 'front', 'right'],
  ['downLeft', 'down', 'downRight'],
]

export function resolveImages(miiImages) {
  const resolved = {}
  ALL_KEYS.forEach((key) => {
    if (miiImages[key]) {
      resolved[key] = { src: miiImages[key], flip: false }
      return
    }
    const fb = MIRROR_FALLBACKS[key]
    if (fb && miiImages[fb.src]) {
      resolved[key] = { src: miiImages[fb.src], flip: fb.flip }
    } else {
      resolved[key] = { src: miiImages.front, flip: false }
    }
  })
  return resolved
}

export function gridKeyFromNormalized(x, y) {
  const col = x < 0.33 ? 0 : x < 0.66 ? 1 : 2
  const row = y < 0.33 ? 0 : y < 0.66 ? 1 : 2
  return GRID[row][col]
}
