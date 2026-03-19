import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'

const store = {}
const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, value) => {
    store[key] = String(value)
  }),
  removeItem: vi.fn((key) => {
    delete store[key]
  }),
  clear: vi.fn(() => {
    Object.keys(store).forEach((key) => delete store[key])
  }),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('useTheme', () => {
  let useTheme

  beforeEach(async () => {
    localStorageMock.clear()
    vi.clearAllMocks()
    document.documentElement.removeAttribute('data-theme')
    vi.resetModules()
    const mod = await import('@/composables/useTheme')
    useTheme = mod.useTheme
  })

  it('defaults to dark when localStorage is empty', () => {
    const { theme } = useTheme()
    expect(theme.value).toBe('dark')
  })

  it('reads stored theme from localStorage', () => {
    store.theme = 'light'
    const { theme } = useTheme()
    expect(theme.value).toBe('light')
  })

  it('sets data-theme attribute on document element', async () => {
    useTheme()
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('toggles between dark and light', async () => {
    const { theme, toggle } = useTheme()
    expect(theme.value).toBe('dark')

    toggle()
    await nextTick()
    expect(theme.value).toBe('light')
    expect(store.theme).toBe('light')

    toggle()
    await nextTick()
    expect(theme.value).toBe('dark')
    expect(store.theme).toBe('dark')
  })
})
