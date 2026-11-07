/**
 * Lightweight user profiles — a username only, no password.
 *
 * Why: several students often share one computer (computer lab, projector
 * at the front of the class). Each profile gets its own lesson progress and
 * quiz history, and its quiz points go to the shared leaderboard.
 *
 * - The list of profiles that have used this device lives in localStorage.
 * - The *active* profile lives in sessionStorage, i.e. per browser tab, so two
 *   students can work side by side in two tabs of the same browser without
 *   mixing their data. A new tab asks "who is learning?" again.
 * - "Guest" (no profile) keeps the original un-namespaced keys, so data from
 *   before accounts existed is not lost.
 */
import { useSyncExternalStore } from 'react'

export interface UserProfile {
  /** display name exactly as typed (trimmed, spaces collapsed) */
  name: string
  /** case-insensitive identity used for storage keys and the leaderboard */
  key: string
  createdAt: number
  lastActive: number
}

const USERS_KEY = 'mathlens:users'
const SESSION_KEY = 'mathlens:session-user'
const GUEST_KEY = 'mathlens:session-guest'

export const NAME_MIN = 2
export const NAME_MAX = 30

/** trim, collapse inner spaces, Unicode-normalize (so "Phương" typed two ways matches) */
export function normalizeName(raw: string): string {
  return raw.normalize('NFC').replace(/\s+/g, ' ').trim()
}

export function nameKey(name: string): string {
  return normalizeName(name).toLocaleLowerCase('vi')
}

/** returns an i18n error key, or null when the name is acceptable */
export function validateName(raw: string): 'user.err.short' | 'user.err.long' | 'user.err.chars' | null {
  const n = normalizeName(raw)
  if (n.length < NAME_MIN) return 'user.err.short'
  if (n.length > NAME_MAX) return 'user.err.long'
  if (!/^[\p{L}\p{N} _.-]+$/u.test(n)) return 'user.err.chars'
  return null
}

/* ------------------------------------------------------------ storage */

function readUsers(): UserProfile[] {
  try {
    const v = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
    return Array.isArray(v) ? (v as UserProfile[]) : []
  } catch {
    return []
  }
}

function writeUsers(list: UserProfile[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list))
  } catch {
    /* private mode */
  }
}

function sessionGet(k: string): string | null {
  try {
    return sessionStorage.getItem(k)
  } catch {
    return null
  }
}
function sessionSet(k: string, v: string | null) {
  try {
    if (v === null) sessionStorage.removeItem(k)
    else sessionStorage.setItem(k, v)
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------ pub/sub */

const listeners = new Set<() => void>()
let snapshot: { user: UserProfile | null; guest: boolean; users: UserProfile[] } | null = null

function compute() {
  const users = readUsers().sort((a, b) => b.lastActive - a.lastActive)
  const k = sessionGet(SESSION_KEY)
  const user = (k && users.find((u) => u.key === k)) || null
  return { user, guest: !user && sessionGet(GUEST_KEY) === '1', users }
}

function emit() {
  snapshot = compute()
  listeners.forEach((fn) => fn())
}

export function subscribeUser(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getUserState() {
  if (!snapshot) snapshot = compute()
  return snapshot
}

/** active profile of this tab, or null for guest / not chosen yet */
export function currentUser(): UserProfile | null {
  return getUserState().user
}

/** storage-key suffix for per-user data; '' for guest (legacy keys) */
export function userScope(): string {
  const u = currentUser()
  return u ? `:${u.key}` : ''
}

/** sign in (creating the profile on first use). Returns the profile. */
export function signIn(rawName: string): UserProfile {
  const name = normalizeName(rawName)
  const key = nameKey(name)
  const now = Date.now()
  const list = readUsers()
  let u = list.find((x) => x.key === key)
  if (u) {
    u.lastActive = now
  } else {
    u = { name, key, createdAt: now, lastActive: now }
    // the first profile on a device inherits progress made before accounts existed
    if (list.length === 0) adoptGuestData(key)
    list.push(u)
  }
  writeUsers(list)
  sessionSet(SESSION_KEY, key)
  sessionSet(GUEST_KEY, null)
  emit()
  return u
}

export function continueAsGuest() {
  sessionSet(SESSION_KEY, null)
  sessionSet(GUEST_KEY, '1')
  emit()
}

/** back to the "who is learning?" screen (data is kept) */
export function signOut() {
  sessionSet(SESSION_KEY, null)
  sessionSet(GUEST_KEY, null)
  emit()
}

/** remove a profile and its local data from this device */
export function removeProfile(key: string) {
  writeUsers(readUsers().filter((u) => u.key !== key))
  try {
    for (const base of ['mathlens:progress', 'mathlens:quiz']) localStorage.removeItem(`${base}:${key}`)
  } catch {
    /* ignore */
  }
  if (sessionGet(SESSION_KEY) === key) sessionSet(SESSION_KEY, null)
  emit()
}

function adoptGuestData(key: string) {
  try {
    for (const base of ['mathlens:progress', 'mathlens:quiz']) {
      const v = localStorage.getItem(base)
      if (v && !localStorage.getItem(`${base}:${key}`)) localStorage.setItem(`${base}:${key}`, v)
    }
  } catch {
    /* ignore */
  }
}

/** true while neither a profile nor guest mode was chosen in this tab */
export function needsChoice(): boolean {
  const s = getUserState()
  return !s.user && !s.guest
}

// another tab created/removed a profile → refresh the device list
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === USERS_KEY) emit()
  })
}

export function useUser() {
  return useSyncExternalStore(subscribeUser, getUserState)
}
