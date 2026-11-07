import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Formula } from '../components/Formula'
import { useLang } from '../i18n/LangContext'
import { signIn, useUser, validateName, normalizeName } from '../lib/user'
import { submitAttempt } from '../lib/leaderboard'
import { attemptPoints } from '../quiz/scoring'
import { saveAttempt } from '../quiz/store'
import { LiveError, transportForPin, type LiveState, type LiveTransport } from '../live/transport'
import { Countdown, Tile } from '../live/ui'
import { TILE } from '../live/tiles'

const SESSION = 'mathlens:live-session'

interface Session {
  pin: string
  playerId: string
  name: string
}

function readSession(): Session | null {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION) ?? 'null')
  } catch {
    return null
  }
}
function writeSession(s: Session | null) {
  try {
    if (s) sessionStorage.setItem(SESSION, JSON.stringify(s))
    else sessionStorage.removeItem(SESSION)
  } catch {
    /* ignore */
  }
}

export function LivePlay() {
  const { pin: pinParam } = useParams()
  const { t } = useLang()
  const { user } = useUser()
  const [session, setSession] = useState<Session | null>(() => {
    const s = readSession()
    return s && (!pinParam || s.pin === pinParam) ? s : null
  })
  const [pin, setPin] = useState(pinParam ?? '')
  const [name, setName] = useState(user?.name ?? '')
  const [joinErr, setJoinErr] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (user && !name) setName(user.name)
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function join() {
    const p = pin.replace(/\D/g, '')
    if (p.length !== 6) return setJoinErr(t('live.err.pin'))
    const e = validateName(name)
    if (e) return setJoinErr(t(e))
    setJoining(true)
    setJoinErr(null)
    try {
      const n = normalizeName(name)
      const res = await transportForPin(p).join(p, n)
      signIn(n) // the room name is also the learner's profile (progress + leaderboard)
      const s = { pin: p, playerId: res.playerId, name: res.name }
      writeSession(s)
      setSession(s)
    } catch (err) {
      const code = err instanceof LiveError ? err.code : 'network'
      setJoinErr(code === 'not_found' || code === 'invalid_pin' ? t('live.err.notFound') : code === 'name_taken' ? t('live.err.nameTaken') : t('live.err.network'))
    }
    setJoining(false)
  }

  if (session) return <Game session={session} onLeave={() => { writeSession(null); setSession(null) }} />

  return (
    <div className="grid h-full place-items-center overflow-y-auto bg-bg p-5">
      <div className="w-full max-w-sm">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{t('live.overline')}</p>
        <h1 className="mt-1 text-center text-3xl font-extrabold">
          {t('live.playTitleA')} <span className="text-violet">{t('live.playTitleB')}</span>
        </h1>
        <div className="mt-6 space-y-3 rounded-2xl border border-edge bg-panel p-5">
          <input
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
              setJoinErr(null)
            }}
            inputMode="numeric"
            placeholder={t('live.pinPlaceholder')}
            aria-label={t('live.pin')}
            className="w-full rounded-xl border border-edge bg-panel-2 px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em] outline-none focus:border-violet/60"
          />
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setJoinErr(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && join()}
            placeholder={t('user.placeholder')}
            aria-label={t('user.yourName')}
            className="w-full rounded-xl border border-edge bg-panel-2 px-4 py-3 text-center text-[16px] font-semibold outline-none focus:border-violet/60"
          />
          {joinErr && <p className="text-center text-[12.5px] font-semibold text-coral">{joinErr}</p>}
          <button onClick={join} disabled={joining} className="w-full rounded-xl bg-violet py-3 text-[15px] font-bold text-[#140b1f] disabled:opacity-50">
            {joining ? '…' : t('live.join')}
          </button>
        </div>
        <p className="mt-4 text-center text-[12px] text-faint">
          {t('live.hostQ')}{' '}
          <Link to="/live" className="font-semibold text-curve hover:underline">
            {t('live.hostLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- in-game */

interface MyAnswer {
  choice: number
  ms: number
}

function Game({ session, onLeave }: { session: Session; onLeave: () => void }) {
  const { t } = useLang()
  const { user } = useUser()
  const tr = useRef<LiveTransport>(transportForPin(session.pin))
  const [offset, setOffset] = useState(0) // store clock − local clock
  const [state, setState] = useState<LiveState | null>(null)
  const [lost, setLost] = useState(false)
  const [mine, setMine] = useState<Record<number, MyAnswer>>({})
  const [sendErr, setSendErr] = useState<string | null>(null)
  const submitted = useRef(false)
  const [lbPoints, setLbPoints] = useState<number | null>(null)
  // whether each of my answers was right (known once the teacher reveals it)
  const correctness = useRef<Record<number, boolean>>({})
  useEffect(() => {
    if (state?.phase === 'reveal' && state.reveal && mine[state.qIndex]) {
      correctness.current[state.qIndex] = mine[state.qIndex].choice === state.reveal.correctIndex
    }
  }, [state, mine])

  // poll the shared state (faster while a question is open)
  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout>
    const tick = async () => {
      try {
        const r = await tr.current.getState(session.pin)
        if (!alive) return
        setOffset(r.serverNow - Date.now())
        setState(r.state)
        setLost(false)
      } catch (e) {
        if (e instanceof LiveError && e.code === 'not_found') setLost(true)
      }
      if (alive) timer = setTimeout(tick, state?.phase === 'question' ? 700 : 1300)
    }
    tick()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [session.pin, state?.phase])

  async function choose(i: number) {
    if (!state || state.phase !== 'question' || mine[state.qIndex]) return
    const q = state.qIndex
    setMine((m) => ({ ...m, [q]: { choice: i, ms: -1 } })) // optimistic
    try {
      const r = await tr.current.answer(session.pin, session.playerId, q, i)
      setMine((m) => ({ ...m, [q]: { choice: i, ms: r.ms } }))
      setSendErr(null)
    } catch (e) {
      const code = e instanceof LiveError ? e.code : 'network'
      if (code !== 'already_answered') {
        setMine((m) => {
          const n = { ...m }
          delete n[q]
          return n
        })
        setSendErr(code === 'too_late' || code === 'closed' ? t('live.err.late') : t('live.err.network'))
      }
    }
  }

  // at the end, add this game to the learner's history and the leaderboard
  useEffect(() => {
    if (state?.phase !== 'end' || submitted.current || !state) return
    submitted.current = true
    const hits = state.players.find((p) => p.id === session.playerId)?.hits ?? []
    const answers: Array<{ correct: boolean; ms: number }> = []
    for (let q = 0; q < state.total; q++) {
      const a = mine[q]
      // the teacher's final results are authoritative; local reveal tracking is the fallback
      const ok = hits[q] ?? (a ? (correctness.current[q] ?? false) : false)
      answers.push({ correct: ok, ms: a && a.ms >= 0 ? a.ms : 60_000 })
    }
    const points = attemptPoints(answers)
    saveAttempt({
      date: Date.now(),
      lessonIds: ['live'],
      score: answers.filter((a) => a.correct).length,
      count: state.total,
      totalMs: answers.reduce((s, a) => s + a.ms, 0),
      weakSkills: [],
      points,
    })
    if (user) {
      submitAttempt(user, {
        attemptId: `live-${session.pin}-${session.playerId}`.slice(0, 64),
        points,
        count: state.total,
        totalMs: answers.reduce((s, a) => s + a.ms, 0),
        lessonIds: ['live'],
        mode: 'live',
        answers,
      }).then((r) => setLbPoints(r.points))
    } else setLbPoints(points)
  }, [state, mine, session, user])

  const me = state?.players.find((p) => p.id === session.playerId)
  const header = (
    <div className="flex items-center justify-between gap-3 border-b border-edge bg-bg-soft px-4 py-2.5">
      <span className="truncate text-[13px] font-bold">{session.name}</span>
      <span className="font-mono text-[12px] text-faint">PIN {session.pin}</span>
      <span className="font-mono text-[14px] font-extrabold text-gold">{me?.score ?? 0}</span>
    </div>
  )

  if (lost) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <p className="text-[15px] font-semibold text-dim">{t('live.err.notFound')}</p>
          <button onClick={onLeave} className="mt-4 rounded-full bg-violet px-6 py-2.5 font-bold text-[#140b1f]">
            {t('live.back')}
          </button>
        </div>
      </div>
    )
  }
  if (!state) return <div className="grid h-full place-items-center text-dim">…</div>

  const my = mine[state.qIndex]
  const deadline = state.startedAt ? state.startedAt + state.timeLimit * 1000 - offset : 0

  return (
    <div className="flex h-full flex-col bg-bg">
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {state.phase === 'lobby' && (
          <Center>
            <p className="text-5xl">🎮</p>
            <p className="mt-3 text-xl font-extrabold">{t('live.youreIn')}</p>
            <p className="mt-1 text-[14px] text-dim">{t('live.waitHost')}</p>
            <p className="mt-4 text-[12.5px] text-faint">{t('live.playersIn', { n: state.players.length })}</p>
          </Center>
        )}

        {state.phase === 'question' && state.question && (
          <div className="mx-auto max-w-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[13px] font-bold text-dim">{t('live.qOf', { i: state.qIndex + 1, n: state.total })}</span>
              <Countdown deadline={deadline} total={state.timeLimit} />
            </div>
            <div className="rounded-2xl border border-edge bg-panel p-4 text-[16px] font-semibold leading-relaxed">
              <Formula text={state.question.text} />
            </div>
            {my ? (
              <Center>
                <span className="grid size-16 place-items-center rounded-2xl text-3xl text-white" style={{ background: TILE[my.choice].color }}>
                  {TILE[my.choice].shape}
                </span>
                <p className="mt-3 text-[15px] font-bold">{t('live.locked')}</p>
                <p className="text-[13px] text-dim">{t('live.waitOthers')}</p>
              </Center>
            ) : (
              <div className="mt-3 grid gap-2.5">
                {state.question.options.map((o, i) => (
                  <Tile key={i} index={i} onClick={() => choose(i)}>
                    <Formula text={o} />
                  </Tile>
                ))}
              </div>
            )}
            {sendErr && <p className="mt-2 text-center text-[12.5px] font-semibold text-coral">{sendErr}</p>}
          </div>
        )}

        {state.phase === 'reveal' && state.reveal && (
          <Center>
            {my ? (
              my.choice === state.reveal.correctIndex ? (
                <>
                  <p className="text-6xl">✅</p>
                  <p className="mt-2 text-2xl font-extrabold text-mint">{t('live.right')}</p>
                  <p className="font-mono text-xl font-bold text-gold">+{me?.last ?? 0}</p>
                  {me && me.streak >= 2 && <p className="mt-1 text-[14px] font-bold text-coral">🔥 {t('live.streak', { n: me.streak })}</p>}
                </>
              ) : (
                <>
                  <p className="text-6xl">❌</p>
                  <p className="mt-2 text-2xl font-extrabold text-coral">{t('live.wrong')}</p>
                </>
              )
            ) : (
              <>
                <p className="text-6xl">⏰</p>
                <p className="mt-2 text-xl font-extrabold text-dim">{t('live.noAnswer')}</p>
              </>
            )}
            <p className="mt-4 text-[13px] text-dim">{t('live.correctWas')}</p>
            <div className="mt-1 w-full max-w-sm">
              <Tile index={state.reveal.correctIndex} correct>
                <Formula text={state.question?.options[state.reveal.correctIndex] ?? ''} />
              </Tile>
            </div>
            {me && <p className="mt-4 text-[14px] font-semibold">{t('live.rankNow', { rank: me.rank, n: state.players.length })}</p>}
          </Center>
        )}

        {state.phase === 'scoreboard' && (
          <Center>
            <p className="text-5xl">📊</p>
            {me && (
              <>
                <p className="mt-2 text-3xl font-extrabold">#{me.rank}</p>
                <p className="font-mono text-xl font-bold text-gold">{me.score}</p>
                {me.prevRank && me.prevRank > me.rank && <p className="mt-1 font-bold text-mint">▲ {me.prevRank - me.rank}</p>}
              </>
            )}
            <p className="mt-3 text-[13px] text-dim">{t('live.waitHost')}</p>
          </Center>
        )}

        {state.phase === 'end' && (
          <Center>
            <p className="text-6xl">{me?.rank === 1 ? '🏆' : me && me.rank <= 3 ? '🎉' : '👏'}</p>
            <p className="mt-2 text-3xl font-extrabold">{me ? `#${me.rank}` : ''}</p>
            <p className="font-mono text-xl font-bold text-gold">{me?.score ?? 0}</p>
            <p className="mt-2 text-[14px] text-dim">{t('live.endThanks')}</p>
            {lbPoints !== null && (
              <p className="mt-3 rounded-full bg-gold/15 px-4 py-1.5 text-[13px] font-bold text-gold">{t('live.lbAdded', { p: lbPoints })}</p>
            )}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link to="/leaderboard" className="rounded-full bg-violet px-5 py-2.5 text-[13.5px] font-bold text-[#140b1f]">
                🏆 {t('rail.lb')}
              </Link>
              <button onClick={onLeave} className="rounded-full border border-edge px-5 py-2.5 text-[13.5px] font-bold text-dim">
                {t('live.back')}
              </button>
            </div>
          </Center>
        )}
      </div>
    </div>
  )
}

function Center({ children }: { children: ReactNode }) {
  return <div className="rise mx-auto flex max-w-md flex-col items-center py-8 text-center">{children}</div>
}
