/**
 * Leaderboard client.
 *
 * Global board: /api/leaderboard (Vercel function + Upstash Redis sorted sets).
 * When that endpoint is unavailable (no database configured, offline, error),
 * the board is computed from a ledger of attempts kept on this device, so a
 * class sharing one computer still gets a working "local" leaderboard.
 */
import type { UserProfile } from './user'

export type Period = 'day' | 'month' | 'year' | 'record'
export const PERIODS: Period[] = ['day', 'month', 'year', 'record']

export interface BoardEntry {
  rank: number
  name: string
  points: number
}

export interface Board {
  period: Period
  /** e.g. "2026-11-06", "2026-11", "2026", "all" */
  label: string
  entries: BoardEntry[]
  me: BoardEntry | null
  source: 'global' | 'local'
}

export interface SubmitResult {
  points: number
  /** rank today after this attempt (null when unknown) */
  dayRank: number | null
  source: 'global' | 'local'
}

const LEDGER_KEY = 'mathlens:lb-local'
const LEDGER_MAX = 2000
const TZ = 'Asia/Ho_Chi_Minh'
const TOP = 20

interface LedgerRow {
  /** user key, display name, timestamp, points */
  k: string
  n: string
  t: number
  p: number
}

/** calendar parts in Vietnam time, so "today" resets at local midnight */
export function periodLabels(ts: number) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
  const d = f.format(new Date(ts)) // YYYY-MM-DD
  return { day: d, month: d.slice(0, 7), year: d.slice(0, 4), record: 'all' }
}

function readLedger(): LedgerRow[] {
  try {
    const v = JSON.parse(localStorage.getItem(LEDGER_KEY) ?? '[]')
    return Array.isArray(v) ? (v as LedgerRow[]) : []
  } catch {
    return []
  }
}

function appendLedger(row: LedgerRow) {
  const all = [...readLedger(), row].slice(-LEDGER_MAX)
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(all))
  } catch {
    /* private mode */
  }
}

/** board computed from the on-device ledger */
export function localBoard(period: Period, meKey: string | null, now = Date.now()): Board {
  const label = periodLabels(now)[period]
  const rows = readLedger()
  const agg = new Map<string, { name: string; points: number }>()
  for (const r of rows) {
    const lbl = periodLabels(r.t)[period]
    if (period !== 'record' && lbl !== label) continue
    const cur = agg.get(r.k) ?? { name: r.n, points: 0 }
    cur.name = r.n
    // record = best single attempt; other periods = sum of points in the period
    cur.points = period === 'record' ? Math.max(cur.points, r.p) : cur.points + r.p
    agg.set(r.k, cur)
  }
  const sorted = [...agg.entries()].sort((a, b) => b[1].points - a[1].points)
  const ranked = sorted.map(([k, v], i) => ({ k, rank: i + 1, name: v.name, points: v.points }))
  const mine = meKey ? ranked.find((r) => r.k === meKey) : undefined
  return {
    period,
    label,
    entries: ranked.slice(0, TOP).map(({ rank, name, points }) => ({ rank, name, points })),
    me: mine ? { rank: mine.rank, name: mine.name, points: mine.points } : null,
    source: 'local',
  }
}

export async function fetchBoard(period: Period, me: UserProfile | null): Promise<Board> {
  try {
    const q = new URLSearchParams({ period })
    if (me) q.set('name', me.name)
    const res = await fetch(`/api/leaderboard?${q}`, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = (await res.json()) as Board
    if (!Array.isArray(data.entries)) throw new Error('bad shape')
    return { ...data, source: 'global' }
  } catch {
    return localBoard(period, me?.key ?? null)
  }
}

/**
 * Record an attempt: always in the local ledger, and on the global board when
 * the endpoint is reachable. `attemptId` lets the server ignore duplicates.
 */
export async function submitAttempt(
  me: UserProfile,
  attempt: {
    attemptId: string
    points: number
    count: number
    totalMs: number
    lessonIds: string[]
    mode: string
    answers: Array<{ correct: boolean; ms: number }>
  },
): Promise<SubmitResult> {
  appendLedger({ k: me.key, n: me.name, t: Date.now(), p: attempt.points })
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: me.name, ...attempt }),
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = (await res.json()) as { points: number; dayRank: number | null }
    return { points: data.points, dayRank: data.dayRank, source: 'global' }
  } catch {
    const b = localBoard('day', me.key)
    return { points: attempt.points, dayRank: b.me?.rank ?? null, source: 'local' }
  }
}
