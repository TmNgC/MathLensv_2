/**
 * Live quiz rooms ("Thi đấu trực tiếp", Kahoot-style) — Vercel Function.
 *
 * The teacher's browser runs the game (which question, when to reveal, scores);
 * this endpoint is only the shared, authoritative store:
 *   - 6-digit PIN rooms, protected by a host token
 *   - the public game state every device polls
 *   - players (unique names per room)
 *   - answers, each stamped with the *server* time since the question opened,
 *     so speed points are fair whatever the student's device clock says
 *
 *   GET  /api/live?pin=123456            → { state, serverNow }
 *   POST /api/live { op: 'create' }       → { pin, hostToken }
 *   POST /api/live { op: 'publish', pin, hostToken, state }
 *   POST /api/live { op: 'players', pin, hostToken }            → { players: [{ id, name }] }
 *   POST /api/live { op: 'answers', pin, hostToken, q }          → { answers: { [playerId]: { choice, ms } } }
 *   POST /api/live { op: 'join', pin, name, playerId? }         → { playerId, name }
 *   POST /api/live { op: 'answer', pin, playerId, q, choice }   → { ms }
 *
 * Storage: Upstash Redis REST (same env vars as api/leaderboard.ts). Without a
 * database every call answers 501 and the web app offers its single-device
 * demo mode instead. Self-contained on purpose (no local imports).
 */

const P = 'ml:live:'
const TTL = 3 * 3600 // rooms live 3 hours
const GRACE_MS = 1500 // network allowance after the countdown hits 0

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

/**
 * Upstash REST credentials. Accepts the default names set by the Vercel
 * "Upstash for Redis" integration (KV_REST_API_URL / KV_REST_API_TOKEN), the
 * Upstash console names (UPSTASH_REDIS_REST_URL / _TOKEN), and the same names
 * with any custom prefix chosen when connecting the store (e.g. STORAGE_KV_REST_API_URL).
 */
function redisConfig(): { url: string; token: string } | null {
  const env = process.env
  const candidates: Array<[string, string]> = [
    ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
    ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ]
  for (const k of Object.keys(env)) {
    const m = k.match(/^(.+?_)(KV_REST_API|UPSTASH_REDIS_REST)_URL$/)
    if (m) candidates.push([k, `${m[1]}${m[2]}_TOKEN`])
  }
  for (const [u, t] of candidates) {
    const url = env[u]
    const token = env[t]
    if (url && token && /^https?:\/\//.test(url)) return { url: url.replace(/\/+$/, ''), token }
  }
  return null
}
type Cfg = { url: string; token: string }
type Cmd = Array<string | number>
async function pipeline(cfg: Cfg, cmds: Cmd[]): Promise<unknown[]> {
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

const validPin = (v: unknown): v is string => typeof v === 'string' && /^\d{6}$/.test(v)
const validId = (v: unknown): v is string => typeof v === 'string' && /^[\w-]{8,64}$/.test(v)
const randomId = () => crypto.randomUUID().replace(/-/g, '')

function normalizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const n = raw.normalize('NFC').replace(/\s+/g, ' ').trim()
  if (n.length < 2 || n.length > 30 || !/^[\p{L}\p{N} _.-]+$/u.test(n)) return null
  return n
}

/** flat [k, v, k, v] (Upstash HGETALL) → object */
function pairs(flat: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (Array.isArray(flat)) for (let i = 0; i + 1 < flat.length; i += 2) out[String(flat[i])] = String(flat[i + 1])
  return out
}

interface PublicState {
  phase: string
  qIndex: number
  timeLimit: number
  startedAt?: number
  [k: string]: unknown
}

async function isHost(cfg: Cfg, pin: string, token: unknown): Promise<boolean> {
  if (typeof token !== 'string' || token.length < 16) return false
  const [h] = await pipeline(cfg, [['HGET', `${P}${pin}:meta`, 'host']])
  return h === token
}

/* ------------------------------------------------------------ GET: public state */
export async function GET(req: Request): Promise<Response> {
  const cfg = redisConfig()
  if (!cfg) return json({ error: 'no_database' }, 501)
  const pin = new URL(req.url).searchParams.get('pin')
  if (!validPin(pin)) return json({ error: 'invalid_pin' }, 400)
  try {
    const [raw] = await pipeline(cfg, [['GET', `${P}${pin}:state`]])
    if (typeof raw !== 'string') return json({ error: 'not_found' }, 404)
    return json({ state: JSON.parse(raw), serverNow: Date.now() })
  } catch (e) {
    return json({ error: 'database_error', detail: String((e as Error).message).slice(0, 200) }, 502)
  }
}

/* ------------------------------------------------------------ POST: operations */
export async function POST(req: Request): Promise<Response> {
  const cfg = redisConfig()
  if (!cfg) return json({ error: 'no_database' }, 501)
  let b: Record<string, unknown>
  try {
    b = (await req.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'invalid JSON body' }, 400)
  }
  try {
    switch (b.op) {
      case 'create':
        return await create(cfg)
      case 'publish':
        return await publish(cfg, b)
      case 'players':
        return await players(cfg, b)
      case 'answers':
        return await answers(cfg, b)
      case 'join':
        return await join(cfg, b)
      case 'answer':
        return await answer(cfg, b)
      default:
        return json({ error: 'unknown_op' }, 400)
    }
  } catch (e) {
    return json({ error: 'database_error', detail: String((e as Error).message).slice(0, 200) }, 502)
  }
}

async function create(cfg: Cfg): Promise<Response> {
  const hostToken = randomId()
  for (let tries = 0; tries < 6; tries++) {
    const pin = String(100000 + Math.floor(Math.random() * 900000))
    const [fresh] = await pipeline(cfg, [['HSETNX', `${P}${pin}:meta`, 'host', hostToken]])
    if (fresh !== 1) continue // PIN in use — draw another
    const lobby = { phase: 'lobby', qIndex: -1, timeLimit: 20, players: [], total: 0 }
    await pipeline(cfg, [
      ['HSET', `${P}${pin}:meta`, 'created', Date.now()],
      ['EXPIRE', `${P}${pin}:meta`, TTL],
      ['SET', `${P}${pin}:state`, JSON.stringify(lobby), 'EX', TTL],
    ])
    return json({ pin, hostToken })
  }
  return json({ error: 'no_free_pin' }, 503)
}

async function publish(cfg: Cfg, b: Record<string, unknown>): Promise<Response> {
  const pin = b.pin
  if (!validPin(pin)) return json({ error: 'invalid_pin' }, 400)
  if (!(await isHost(cfg, pin, b.hostToken))) return json({ error: 'forbidden' }, 403)
  const next = b.state as PublicState
  if (!next || typeof next !== 'object' || typeof next.phase !== 'string') return json({ error: 'invalid_state' }, 400)
  const body = JSON.stringify(next)
  if (body.length > 200_000) return json({ error: 'state_too_large' }, 413)

  const [prevRaw] = await pipeline(cfg, [['GET', `${P}${pin}:state`]])
  const prev = typeof prevRaw === 'string' ? (JSON.parse(prevRaw) as PublicState) : null
  // the question clock starts when the server first sees this question
  if (next.phase === 'question') {
    next.startedAt =
      prev && prev.phase === 'question' && prev.qIndex === next.qIndex && prev.startedAt ? prev.startedAt : Date.now()
  } else if (prev?.startedAt && prev.qIndex === next.qIndex) {
    next.startedAt = prev.startedAt
  }
  await pipeline(cfg, [['SET', `${P}${pin}:state`, JSON.stringify(next), 'EX', TTL]])
  return json({ ok: true, startedAt: next.startedAt ?? null, serverNow: Date.now() })
}

async function players(cfg: Cfg, b: Record<string, unknown>): Promise<Response> {
  const pin = b.pin
  if (!validPin(pin)) return json({ error: 'invalid_pin' }, 400)
  if (!(await isHost(cfg, pin, b.hostToken))) return json({ error: 'forbidden' }, 403)
  const [flat] = await pipeline(cfg, [['HGETALL', `${P}${pin}:players`]])
  const map = pairs(flat)
  return json({ players: Object.entries(map).map(([id, name]) => ({ id, name })) })
}

async function answers(cfg: Cfg, b: Record<string, unknown>): Promise<Response> {
  const pin = b.pin
  const q = Number(b.q)
  if (!validPin(pin) || !Number.isInteger(q) || q < 0) return json({ error: 'invalid_request' }, 400)
  if (!(await isHost(cfg, pin, b.hostToken))) return json({ error: 'forbidden' }, 403)
  const [flat] = await pipeline(cfg, [['HGETALL', `${P}${pin}:a:${q}`]])
  const out: Record<string, { choice: number; ms: number }> = {}
  for (const [id, v] of Object.entries(pairs(flat))) {
    const [c, ms] = v.split('|').map(Number)
    out[id] = { choice: c, ms }
  }
  return json({ answers: out })
}

async function join(cfg: Cfg, b: Record<string, unknown>): Promise<Response> {
  const pin = b.pin
  const name = normalizeName(b.name)
  if (!validPin(pin)) return json({ error: 'invalid_pin' }, 400)
  if (!name) return json({ error: 'invalid_name' }, 400)
  const key = name.toLocaleLowerCase('vi')
  const [state, owner] = await pipeline(cfg, [
    ['EXISTS', `${P}${pin}:state`],
    ['HGET', `${P}${pin}:names`, key],
  ])
  if (state !== 1) return json({ error: 'not_found' }, 404)
  // rejoining (page reload) with the id we handed out earlier
  if (typeof owner === 'string') {
    if (owner === b.playerId) return json({ playerId: owner, name })
    return json({ error: 'name_taken' }, 409)
  }
  const id = randomId()
  const [ok] = await pipeline(cfg, [['HSETNX', `${P}${pin}:names`, key, id]])
  if (ok !== 1) return json({ error: 'name_taken' }, 409) // lost a simultaneous race for this name
  await pipeline(cfg, [
    ['HSET', `${P}${pin}:players`, id, name],
    ['EXPIRE', `${P}${pin}:players`, TTL],
    ['EXPIRE', `${P}${pin}:names`, TTL],
  ])
  return json({ playerId: id, name })
}

async function answer(cfg: Cfg, b: Record<string, unknown>): Promise<Response> {
  const pin = b.pin
  const q = Number(b.q)
  const choice = Number(b.choice)
  if (!validPin(pin) || !validId(b.playerId) || !Number.isInteger(q) || ![0, 1, 2, 3].includes(choice)) {
    return json({ error: 'invalid_request' }, 400)
  }
  const [raw, member] = await pipeline(cfg, [
    ['GET', `${P}${pin}:state`],
    ['HEXISTS', `${P}${pin}:players`, b.playerId],
  ])
  if (typeof raw !== 'string') return json({ error: 'not_found' }, 404)
  if (member !== 1) return json({ error: 'not_joined' }, 403)
  const st = JSON.parse(raw) as PublicState
  const now = Date.now()
  if (st.phase !== 'question' || st.qIndex !== q || !st.startedAt) return json({ error: 'closed' }, 409)
  const ms = now - st.startedAt
  if (ms > st.timeLimit * 1000 + GRACE_MS) return json({ error: 'too_late' }, 409)
  const [fresh] = await pipeline(cfg, [
    ['HSETNX', `${P}${pin}:a:${q}`, b.playerId, `${choice}|${Math.max(0, ms)}`],
    ['EXPIRE', `${P}${pin}:a:${q}`, TTL],
  ])
  if (fresh !== 1) return json({ error: 'already_answered' }, 409)
  return json({ ms: Math.max(0, ms) })
}
