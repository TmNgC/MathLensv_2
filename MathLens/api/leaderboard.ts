/**
 * Leaderboard API (Vercel Function, Web-standard handlers).
 *
 *   POST /api/leaderboard   { attemptId, name, count, totalMs, lessonIds, mode,
 *                              answers: [{ correct, ms }] }
 *        → { points, dayRank }
 *   GET  /api/leaderboard?period=day|month|year|record&name=<optional>
 *        → { period, label, entries: [{ rank, name, points }], me }
 *   GET  /api/leaderboard?export=csv&key=<EXPORT_KEY>
 *        → CSV of recent attempts (for the teacher / the pedagogical experiment)
 *
 * Storage: Upstash Redis over its REST API. On Vercel, add the "Upstash for
 * Redis" integration (Storage tab) — it sets KV_REST_API_URL and
 * KV_REST_API_TOKEN automatically (UPSTASH_REDIS_REST_URL/_TOKEN also work).
 * Without them every call answers 501 and the web app falls back to its
 * on-device leaderboard.
 *
 * Why sorted sets: ZINCRBY is atomic inside Redis, so many students finishing
 * a quiz at the same moment can never overwrite each other's points (no
 * read-modify-write in this code).
 *
 * This file is intentionally self-contained (no local imports).
 */

const TZ = 'Asia/Ho_Chi_Minh'
const P = 'ml:' // key prefix
const TOP = 20
const MAX_Q = 40
const DAY_S = 86_400

/* ------------------------------------------------------------ scoring (mirror of src/quiz/scoring.ts) */
function questionPoints(correct: boolean, ms: number): number {
  if (!correct) return 0
  return 10 + Math.round(5 * Math.max(0, 1 - Math.max(0, ms) / 60_000))
}

/* ------------------------------------------------------------ helpers */
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

function normalizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const n = raw.normalize('NFC').replace(/\s+/g, ' ').trim()
  if (n.length < 2 || n.length > 30) return null
  if (!/^[\p{L}\p{N} _.-]+$/u.test(n)) return null
  return n
}
const keyOf = (name: string) => name.toLocaleLowerCase('vi')

function labels(ts: number) {
  const d = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ts))
  return { day: d, month: d.slice(0, 7), year: d.slice(0, 4) }
}

type Period = 'day' | 'month' | 'year' | 'record'
function boardKey(period: Period, now: number): { key: string; label: string } {
  const l = labels(now)
  if (period === 'day') return { key: `${P}lb:d:${l.day}`, label: l.day }
  if (period === 'month') return { key: `${P}lb:m:${l.month}`, label: l.month }
  if (period === 'year') return { key: `${P}lb:y:${l.year}`, label: l.year }
  return { key: `${P}lb:rec`, label: 'all' }
}

/* ------------------------------------------------------------ Upstash REST */
function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null
}

type Cmd = Array<string | number>
async function pipeline(cfg: { url: string; token: string }, cmds: Cmd[]): Promise<unknown[]> {
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds.map((c) => c.map(String))),
  })
  if (!res.ok) throw new Error(`redis HTTP ${res.status}`)
  const out = (await res.json()) as Array<{ result?: unknown; error?: string }>
  return out.map((r) => {
    if (r.error) throw new Error(`redis: ${r.error}`)
    return r.result
  })
}

/* ------------------------------------------------------------ POST: submit an attempt */
export async function POST(req: Request): Promise<Response> {
  const cfg = redisConfig()
  if (!cfg) return json({ error: 'no_database' }, 501)

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'invalid JSON body' }, 400)
  }

  const name = normalizeName(body.name)
  if (!name) return json({ error: 'invalid_name' }, 400)
  const attemptId = typeof body.attemptId === 'string' ? body.attemptId.slice(0, 64) : ''
  if (!/^[\w-]{8,64}$/.test(attemptId)) return json({ error: 'invalid_attempt_id' }, 400)
  const answers = Array.isArray(body.answers) ? body.answers.slice(0, MAX_Q) : []
  if (answers.length === 0) return json({ error: 'no_answers' }, 400)

  // points are recomputed here from the per-question data
  let points = 0
  let correctCount = 0
  for (const a of answers as Array<{ correct?: unknown; ms?: unknown }>) {
    const ok = a?.correct === true
    const ms = Number(a?.ms)
    if (ok) correctCount++
    points += questionPoints(ok, Number.isFinite(ms) ? ms : 60_000)
  }

  const key = keyOf(name)
  const now = Date.now()
  const d = boardKey('day', now)
  const m = boardKey('month', now)
  const y = boardKey('year', now)
  const rec = boardKey('record', now)

  try {
    // the same attempt sent twice (retry, double click) is counted once
    const [fresh] = await pipeline(cfg, [['SET', `${P}att:${attemptId}`, '1', 'NX', 'EX', 2 * DAY_S]])
    if (fresh === null) return json({ error: 'duplicate' }, 409)

    const row = JSON.stringify({
      t: new Date(now).toISOString(),
      name,
      mode: String(body.mode ?? '').slice(0, 12),
      lessons: Array.isArray(body.lessonIds) ? body.lessonIds.slice(0, 12).map(String).join(' ') : '',
      count: answers.length,
      correct: correctCount,
      totalMs: Math.max(0, Math.round(Number(body.totalMs) || 0)),
      points,
    })
    const out = await pipeline(cfg, [
      ['HSET', `${P}names`, key, name],
      ['ZINCRBY', d.key, points, key],
      ['EXPIRE', d.key, 40 * DAY_S],
      ['ZINCRBY', m.key, points, key],
      ['EXPIRE', m.key, 400 * DAY_S],
      ['ZINCRBY', y.key, points, key],
      ['ZADD', rec.key, 'GT', points, key],
      ['LPUSH', `${P}attempts`, row],
      ['LTRIM', `${P}attempts`, 0, 4999],
      ['ZREVRANK', d.key, key],
    ])
    const rank = out[9]
    return json({ points, dayRank: typeof rank === 'number' ? rank + 1 : null })
  } catch (e) {
    return json({ error: 'database_error', detail: String((e as Error).message).slice(0, 200) }, 502)
  }
}

/* ------------------------------------------------------------ GET: read a board / export */
export async function GET(req: Request): Promise<Response> {
  const cfg = redisConfig()
  if (!cfg) return json({ error: 'no_database' }, 501)
  const url = new URL(req.url)

  if (url.searchParams.get('export') === 'csv') return exportCsv(cfg, url)

  const pRaw = url.searchParams.get('period') ?? 'day'
  const period: Period = pRaw === 'month' || pRaw === 'year' || pRaw === 'record' ? pRaw : 'day'
  const me = normalizeName(url.searchParams.get('name'))
  const { key, label } = boardKey(period, Date.now())

  try {
    const cmds: Cmd[] = [['ZREVRANGE', key, 0, TOP - 1, 'WITHSCORES']]
    if (me) cmds.push(['ZREVRANK', key, keyOf(me)], ['ZSCORE', key, keyOf(me)], ['HGET', `${P}names`, keyOf(me)])
    const out = await pipeline(cfg, cmds)
    const flat = (out[0] as string[]) ?? []
    const members: Array<{ key: string; points: number }> = []
    for (let i = 0; i < flat.length; i += 2) members.push({ key: flat[i], points: Number(flat[i + 1]) })

    const names = members.length
      ? ((await pipeline(cfg, [['HMGET', `${P}names`, ...members.map((x) => x.key)]]))[0] as Array<string | null>)
      : []
    const entries = members.map((x, i) => ({ rank: i + 1, name: names[i] ?? x.key, points: x.points }))
    const myRank = me ? out[1] : null
    const myScore = me ? out[2] : null
    return json({
      period,
      label,
      entries,
      me: me && typeof myRank === 'number' ? { rank: myRank + 1, name: (out[3] as string | null) ?? me, points: Number(myScore) } : null,
    })
  } catch (e) {
    return json({ error: 'database_error', detail: String((e as Error).message).slice(0, 200) }, 502)
  }
}

async function exportCsv(cfg: { url: string; token: string }, url: URL): Promise<Response> {
  const expected = process.env.EXPORT_KEY
  if (!expected || url.searchParams.get('key') !== expected) return json({ error: 'forbidden' }, 403)
  const [rows] = (await pipeline(cfg, [['LRANGE', `${P}attempts`, 0, -1]])) as [string[]]
  const cols = ['t', 'name', 'mode', 'lessons', 'count', 'correct', 'totalMs', 'points']
  const esc = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`
  const lines = [cols.join(',')]
  for (const r of rows ?? []) {
    try {
      const o = JSON.parse(r) as Record<string, unknown>
      lines.push(cols.map((c) => esc(o[c])).join(','))
    } catch {
      /* skip malformed */
    }
  }
  return new Response('\uFEFF' + lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mathlens-attempts.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
