import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

function createMemoryStorage() {
  let store = {}

  return {
    getItem: vi.fn((key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null)),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    key: vi.fn((index) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length
    },
  }
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: createMemoryStorage(),
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.restoreAllMocks()
})

if (typeof window.URL.createObjectURL !== 'function') {
  window.URL.createObjectURL = vi.fn(() => 'blob:foam-fighter-test')
}

if (typeof window.URL.revokeObjectURL !== 'function') {
  window.URL.revokeObjectURL = vi.fn()
}

if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  })
}
