/**
 * Lesson progress, persisted in localStorage — one record per user profile
 * (see lib/user.ts; guest keeps the original key). Tiny pub/sub so React
 * views stay in sync, including when the active profile changes.
 */
import { subscribeUser, userScope } from './user'

const BASE = 'mathlens:progress'

export type Progress = Record<string, boolean>

const listeners = new Set<() => void>()

/** cached snapshot so useSyncExternalStore gets a stable reference */
let cache: Progress | null = null
let cacheScope = ''

function read(): Progress {
  const scope = userScope()
  if (cache && cacheScope === scope) return cache
  cacheScope = scope
  try {
    cache = JSON.parse(localStorage.getItem(BASE + scope) ?? '{}') as Progress
  } catch {
    cache = {}
  }
  return cache
}

function write(p: Progress) {
  cache = p
  cacheScope = userScope()
  try {
    localStorage.setItem(BASE + cacheScope, JSON.stringify(p))
  } catch {
    /* private mode — progress just won't persist */
  }
  listeners.forEach((fn) => fn())
}

export function getProgress(): Progress {
  return read()
}

export function isDone(lessonId: string): boolean {
  return !!read()[lessonId]
}

export function markDone(lessonId: string) {
  const p = read()
  if (!p[lessonId]) write({ ...p, [lessonId]: true })
}

export function resetProgress() {
  write({})
}

// switching profile swaps the whole progress record
subscribeUser(() => {
  cache = null
  listeners.forEach((fn) => fn())
})

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
