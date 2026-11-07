/**
 * Live quiz ("Thi đấu trực tiếp", Kahoot-style) — shared types and transports.
 *
 * Two interchangeable transports with the same operations:
 *  - server: /api/live (Vercel + Upstash Redis) — real classroom, any devices
 *  - local:  localStorage — one browser, several tabs; used automatically when
 *            no database is configured (demo at a fair, offline classroom PC)
 */

export type LivePhase = 'lobby' | 'question' | 'reveal' | 'scoreboard' | 'end'

export interface LivePlayerRow {
  id: string
  name: string
  score: number
  /** points from the last question, null when not answered */
  last: number | null
  correct: boolean | null
  streak: number
  rank: number
  prevRank: number | null
  /** per-question result (true/false, null = no answer) */
  hits?: Array<boolean | null>
}

export interface LiveState {
  phase: LivePhase
  title?: string
  qIndex: number
  total: number
  timeLimit: number
  /** server time (ms) when the current question opened — set by the store */
  startedAt?: number
  question?: { text: string; options: string[]; lessonId: string; skillTag: string }
  reveal?: { correctIndex: number; explanation: string; counts: number[] }
  answered?: number
  players: LivePlayerRow[]
}

export type LiveErr = 'no_database' | 'not_found' | 'name_taken' | 'invalid_name' | 'closed' | 'too_late' | 'already_answered' | 'not_joined' | 'network' | string

export class LiveError extends Error {
  code: LiveErr
  constructor(code: LiveErr) {
    super(code)
    this.code = code
  }
}

export interface LiveTransport {
  kind: 'server' | 'local'
  create(): Promise<{ pin: string; hostToken: string }>
  getState(pin: string): Promise<{ state: LiveState; serverNow: number }>
  publish(pin: string, hostToken: string, state: LiveState): Promise<{ startedAt: number | null; serverNow: number }>
  players(pin: string, hostToken: string): Promise<Array<{ id: string; name: string }>>
  answers(pin: string, hostToken: string, q: number): Promise<Record<string, { choice: number; ms: number }>>
  join(pin: string, name: string, playerId?: string): Promise<{ playerId: string; name: string }>
  answer(pin: string, playerId: string, q: number, choice: number): Promise<{ ms: number }>
}

/* -------------------------------------------------------------- scoring */

/** Kahoot-like: a correct answer is worth 500–1000 points, faster = more. */
export function livePoints(correct: boolean, ms: number, timeLimitS: number): number {
  if (!correct) return 0
  const frac = Math.min(1, Math.max(0, ms / (timeLimitS * 1000)))
  return Math.round(1000 * (1 - frac / 2))
}

/* -------------------------------------------------------------- server transport */

async function call<T>(body: Record<string, unknown>): Promise<T> {
  let res: Response
  try {
    res = await fetch('/api/live', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch {
    throw new LiveError('network')
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new LiveError(data.error ?? `http_${res.status}`)
  return data
}

export const serverTransport: LiveTransport = {
  kind: 'server',
  create: () => call({ op: 'create' }),
  async getState(pin) {
    let res: Response
    try {
      res = await fetch(`/api/live?pin=${pin}`, { cache: 'no-store' })
    } catch {
      throw new LiveError('network')
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new LiveError(data.error ?? `http_${res.status}`)
    return data
  },
  publish: (pin, hostToken, state) => call({ op: 'publish', pin, hostToken, state }),
  players: async (pin, hostToken) => (await call<{ players: Array<{ id: string; name: string }> }>({ op: 'players', pin, hostToken })).players,
  answers: async (pin, hostToken, q) =>
    (await call<{ answers: Record<string, { choice: number; ms: number }> }>({ op: 'answers', pin, hostToken, q })).answers,
  join: (pin, name, playerId) => call({ op: 'join', pin, name, playerId }),
  answer: (pin, playerId, q, choice) => call({ op: 'answer', pin, playerId, q, choice }),
}

/* -------------------------------------------------------------- local transport (one browser, many tabs) */

const LK = (pin: string, part: string) => `mathlens:live:${pin}:${part}`
const rid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '')
    : Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2)

function lget<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function lset(k: string, v: unknown) {
  localStorage.setItem(k, JSON.stringify(v))
}
const GRACE_MS = 1500

export function localRoomExists(pin: string): boolean {
  try {
    return localStorage.getItem(LK(pin, 'state')) !== null
  } catch {
    return false
  }
}

export const localTransport: LiveTransport = {
  kind: 'local',
  async create() {
    let pin = ''
    do pin = String(100000 + Math.floor(Math.random() * 900000))
    while (localRoomExists(pin))
    const hostToken = rid()
    lset(LK(pin, 'host'), hostToken)
    lset(LK(pin, 'state'), { phase: 'lobby', qIndex: -1, total: 0, timeLimit: 20, players: [] } satisfies LiveState)
    lset(LK(pin, 'players'), {})
    return { pin, hostToken }
  },
  async getState(pin) {
    const state = lget<LiveState | null>(LK(pin, 'state'), null)
    if (!state) throw new LiveError('not_found')
    return { state, serverNow: Date.now() }
  },
  async publish(pin, hostToken, next) {
    if (lget(LK(pin, 'host'), '') !== hostToken) throw new LiveError('forbidden')
    const prev = lget<LiveState | null>(LK(pin, 'state'), null)
    if (next.phase === 'question') {
      next.startedAt = prev && prev.phase === 'question' && prev.qIndex === next.qIndex && prev.startedAt ? prev.startedAt : Date.now()
    } else if (prev?.startedAt && prev.qIndex === next.qIndex) next.startedAt = prev.startedAt
    lset(LK(pin, 'state'), next)
    return { startedAt: next.startedAt ?? null, serverNow: Date.now() }
  },
  async players(pin) {
    const m = lget<Record<string, string>>(LK(pin, 'players'), {})
    return Object.entries(m).map(([id, name]) => ({ id, name }))
  },
  async answers(pin, _hostToken, q) {
    return lget<Record<string, { choice: number; ms: number }>>(LK(pin, `a:${q}`), {})
  },
  async join(pin, name, playerId) {
    if (!localRoomExists(pin)) throw new LiveError('not_found')
    const m = lget<Record<string, string>>(LK(pin, 'players'), {})
    const key = name.toLocaleLowerCase('vi')
    const owner = Object.entries(m).find(([, n]) => n.toLocaleLowerCase('vi') === key)?.[0]
    if (owner) {
      if (owner === playerId) return { playerId: owner, name }
      throw new LiveError('name_taken')
    }
    const id = rid()
    m[id] = name
    lset(LK(pin, 'players'), m)
    return { playerId: id, name }
  },
  async answer(pin, playerId, q, choice) {
    const st = lget<LiveState | null>(LK(pin, 'state'), null)
    if (!st) throw new LiveError('not_found')
    if (!(playerId in lget<Record<string, string>>(LK(pin, 'players'), {}))) throw new LiveError('not_joined')
    if (st.phase !== 'question' || st.qIndex !== q || !st.startedAt) throw new LiveError('closed')
    const ms = Date.now() - st.startedAt
    if (ms > st.timeLimit * 1000 + GRACE_MS) throw new LiveError('too_late')
    const all = lget<Record<string, { choice: number; ms: number }>>(LK(pin, `a:${q}`), {})
    if (all[playerId]) throw new LiveError('already_answered')
    all[playerId] = { choice, ms: Math.max(0, ms) }
    lset(LK(pin, `a:${q}`), all)
    return { ms: Math.max(0, ms) }
  },
}

/** players use the local room when this browser hosts it, otherwise the server */
export function transportForPin(pin: string): LiveTransport {
  return localRoomExists(pin) ? localTransport : serverTransport
}
