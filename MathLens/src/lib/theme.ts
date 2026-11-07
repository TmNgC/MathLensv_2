import { useSyncExternalStore } from 'react'

export const THEME_KEY = 'mathlens:theme'

/** apply saved theme before React mounts (avoids a dark flash) */
export function bootTheme() {
  if (localStorage.getItem(THEME_KEY) === 'light') {
    document.documentElement.classList.add('light')
  }
}

export function toggleTheme() {
  const light = document.documentElement.classList.toggle('light')
  try {
    localStorage.setItem(THEME_KEY, light ? 'light' : 'dark')
  } catch {
    /* private mode */
  }
}

const listeners = new Set<() => void>()
if (typeof MutationObserver !== 'undefined') {
  new MutationObserver(() => listeners.forEach((fn) => fn())).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
}

/** re-rendes the component whenever the theme class flips (canvas + R3F colors) */
export function useIsLight(): boolean {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => document.documentElement.classList.contains('light'),
  )
}
