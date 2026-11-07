import type { AttemptSummary } from './types'
import { userScope } from '../lib/user'

/** quiz history of the active profile (guest keeps the original key) */
const BASE = 'mathlens:quiz'
const MAX = 20

export function getAttempts(): AttemptSummary[] {
  try {
    return JSON.parse(localStorage.getItem(BASE + userScope()) ?? '[]') as AttemptSummary[]
  } catch {
    return []
  }
}

export function saveAttempt(a: AttemptSummary) {
  const all = [a, ...getAttempts()].slice(0, MAX)
  try {
    localStorage.setItem(BASE + userScope(), JSON.stringify(all))
  } catch {
    /* private mode */
  }
}
