import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessons } from '../content'
import { Formula } from '../components/Formula'
import { useLang } from '../i18n/LangContext'
import { loadQuestions, type QuestionSource } from '../quiz/source'
import type { QuizQuestion } from '../quiz/types'
import {
  LiveError,
  livePoints,
  localTransport,
  serverTransport,
  type LivePlayerRow,
  type LiveState,
  type LiveTransport,
} from '../live/transport'
import { Countdown, Podium, Tile } from '../live/ui'

const quizLessons = lessons.filter((l) => l.id !== 'lab')
const COUNTS = [5, 10, 15]
const TIMES = [10, 20, 30]
const POLL_MS = 1000
const GRACE_MS = 1500

type Stage = 'setup' | 'creating' | 'lobby' | 'question' | 'reveal' | 'scoreboard' | 'end'

interface PlayerData {
  id: string
  name: string
  score: number
  streak: number
  last: number | null
  correct: boolean | null
  prevRank: number | null
  hits: Array<boolean | null>
}

export function LiveHost() {
  const { t, lang, lessonTitle } = useLang()
  const [stage, setStage] = useState<Stage>('setup')
  const [selected, setSelected] = useState<string[]>(quizLessons.map((l) => l.id))
  const [count, setCount] = useState(10)
  const [timeLimit, setTimeLimit] = useState(20)
  const [source, setSource] = useState<QuestionSource>('ai')
  const [error, setError] = useState<string | null>(null)

  // game data (refs: updated from timers; `tick` forces a render)
  const tr = useRef<LiveTransport>(serverTransport)
  const room = useRef<{ pin: string; hostToken: string } | null>(null)
  const questions = useRef<QuizQuestion[]>([])
  const players = useRef<Map<string, PlayerData>>(new Map())
  const qIndex = useRef(-1)
  const deadline = useRef(0) // local-clock ms
  const counts = useRef<number[]>([0, 0, 0, 0])
  const answered = useRef(0)
  const closing = useRef(false)
  const [, setTick] = useState(0)
  const rerender = () => setTick((x) => x + 1)

  const ranked = (): LivePlayerRow[] => {
    const arr = [...players.current.values()].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    return arr.map((p, i) => ({ id: p.id, name: p.name, score: p.score, last: p.last, correct: p.correct, streak: p.streak, rank: i + 1, prevRank: p.prevRank, hits: p.hits }))
  }

  function baseState(phase: LiveState['phase']): LiveState {
    return {
      phase,
      title: 'MathLens',
      qIndex: qIndex.current,
      total: questions.current.length,
      timeLimit,
      players: ranked(),
      answered: answered.current,
    }
  }

  async function publish(state: LiveState) {
    const r = room.current!
    return tr.current.publish(r.pin, r.hostToken, state)
  }

  /* -------------------------------------------------- lobby: create room + collect players */
  async function createRoom() {
    setError(null)
    setStage('creating')
    const qs = await loadQuestions(source, selected, count, lang)
    if (qs.questions.length === 0) {
      setError(t('live.err.noQuestions'))
      setStage('setup')
      return
    }
    questions.current = qs.questions
    try {
      room.current = await serverTransport.create()
      tr.current = serverTransport
    } catch (e) {
      // no database / offline → single-device demo mode
      if (e instanceof LiveError) {
        room.current = await localTransport.create()
        tr.current = localTransport
      } else throw e
    }
    players.current = new Map()
    qIndex.current = -1
    await publish(baseState('lobby'))
    setStage('lobby')
  }

  async function syncPlayers(): Promise<boolean> {
    const r = room.current
    if (!r) return false
    const list = await tr.current.players(r.pin, r.hostToken).catch(() => null)
    if (!list) return false
    let changed = false
    for (const p of list) {
      if (!players.current.has(p.id)) {
        players.current.set(p.id, { id: p.id, name: p.name, score: 0, streak: 0, last: null, correct: null, prevRank: null, hits: [] })
        changed = true
      }
    }
    return changed
  }

  useEffect(() => {
    if (stage !== 'lobby') return
    const id = setInterval(async () => {
      if (await syncPlayers()) {
        rerender()
        publish(baseState('lobby')).catch(() => {})
      }
    }, 1500)
    return () => clearInterval(id)
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  /* -------------------------------------------------- questions */
  async function openQuestion(i: number) {
    qIndex.current = i
    answered.current = 0
    counts.current = [0, 0, 0, 0]
    closing.current = false
    for (const p of players.current.values()) {
      p.last = null
      p.correct = null
    }
    const q = questions.current[i]
    const res = await publish({
      ...baseState('question'),
      question: { text: q.question, options: q.options, lessonId: q.lessonId, skillTag: q.skillTag },
    })
    const startedAt = res.startedAt ?? res.serverNow
    deadline.current = Date.now() + (startedAt + timeLimit * 1000 - res.serverNow)
    setStage('question')
  }

  // poll answers while a question is open; close when everyone answered or time is up
  useEffect(() => {
    if (stage !== 'question') return
    const id = setInterval(async () => {
      const r = room.current!
      if (await syncPlayers()) rerender()
      const a = await tr.current.answers(r.pin, r.hostToken, qIndex.current).catch(() => null)
      if (a) {
        answered.current = Object.keys(a).length
        rerender()
      }
      const everyone = players.current.size > 0 && answered.current >= players.current.size
      if (everyone || Date.now() > deadline.current + GRACE_MS) closeQuestion()
    }, POLL_MS)
    return () => clearInterval(id)
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  async function closeQuestion() {
    if (closing.current) return
    closing.current = true
    const r = room.current!
    const q = questions.current[qIndex.current]
    const before = new Map(ranked().map((p) => [p.id, p.rank]))
    const a = (await tr.current.answers(r.pin, r.hostToken, qIndex.current).catch(() => ({}))) as Record<string, { choice: number; ms: number }>
    const c = [0, 0, 0, 0]
    for (const p of players.current.values()) {
      const ans = a[p.id]
      p.prevRank = before.get(p.id) ?? null
      p.hits[qIndex.current] = ans ? ans.choice === q.correctIndex : null
      if (!ans) {
        p.last = null
        p.correct = null
        p.streak = 0
        continue
      }
      c[ans.choice] = (c[ans.choice] ?? 0) + 1
      const ok = ans.choice === q.correctIndex
      const pts = livePoints(ok, ans.ms, timeLimit)
      p.correct = ok
      p.last = pts
      p.score += pts
      p.streak = ok ? p.streak + 1 : 0
    }
    counts.current = c
    answered.current = Object.keys(a).length
    await publish({
      ...baseState('reveal'),
      question: { text: q.question, options: q.options, lessonId: q.lessonId, skillTag: q.skillTag },
      reveal: { correctIndex: q.correctIndex, explanation: q.explanation, counts: c },
    })
    setStage('reveal')
  }

  async function showScoreboard() {
    await publish(baseState('scoreboard'))
    setStage('scoreboard')
  }

  async function next() {
    if (qIndex.current + 1 >= questions.current.length) {
      await publish(baseState('end'))
      setStage('end')
    } else await openQuestion(qIndex.current + 1)
  }

  /* -------------------------------------------------- render */
  const r = room.current
  const joinUrl = `${window.location.origin}${window.location.pathname}#/play`
  const q = questions.current[qIndex.current]
  const rows = ranked()

  return (
    <div className="h-full overflow-y-auto bg-bg">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 md:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link to="/leaderboard" className="text-[13px] font-semibold text-dim hover:text-ink">
            ← {t('rail.lb')}
          </Link>
          {r && (
            <div className="flex items-center gap-2">
              {tr.current.kind === 'local' && (
                <span className="rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold text-gold" title={t('live.localHint')}>
                  {t('live.localBadge')}
                </span>
              )}
              <span className="rounded-full border border-edge bg-panel px-3 py-1 font-mono text-[13px] font-bold">PIN {r.pin}</span>
            </div>
          )}
        </div>

        {(stage === 'setup' || stage === 'creating') && (
          <div className="mx-auto max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{t('live.overline')}</p>
            <h1 className="mt-1 text-3xl font-extrabold">
              {t('live.hostTitleA')} <span className="text-violet">{t('live.hostTitleB')}</span>
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-dim">{t('live.hostSub')}</p>
            <div className="mt-6 rounded-2xl border border-edge bg-panel p-5">
              <p className="mb-2 text-[13px] font-bold">{t('quiz.source')}</p>
              <div className="flex flex-wrap gap-2">
                {(['ai', 'offline'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSource(s)}
                    className={`rounded-xl px-4 py-2 text-[13px] font-bold ${source === s ? 'bg-violet/20 text-violet' : 'bg-panel-2 text-dim hover:text-ink'}`}
                  >
                    {s === 'ai' ? t('quiz.ai.title') : t('quiz.off.title')}
                  </button>
                ))}
              </div>
              <p className="mb-2 mt-5 text-[13px] font-bold">{t('quiz.scope')}</p>
              <div className="flex flex-wrap gap-2">
                {quizLessons.map((l) => {
                  const on = selected.includes(l.id)
                  return (
                    <button
                      key={l.id}
                      onClick={() => setSelected(on ? selected.filter((x) => x !== l.id) : [...selected, l.id])}
                      className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${on ? '' : 'bg-panel-2 text-dim hover:text-ink'}`}
                      style={on ? { background: `${l.accent}26`, color: l.accent } : undefined}
                    >
                      {l.glyph} {lessonTitle(l.id, l.title)}
                    </button>
                  )
                })}
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[13px] font-bold">{t('quiz.count')}</p>
                  <div className="flex gap-2">
                    {COUNTS.map((c) => (
                      <button key={c} onClick={() => setCount(c)} className={`rounded-xl px-4 py-2 text-[13px] font-bold ${count === c ? 'bg-curve/20 text-curve' : 'bg-panel-2 text-dim'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[13px] font-bold">{t('live.timePerQ')}</p>
                  <div className="flex gap-2">
                    {TIMES.map((s) => (
                      <button key={s} onClick={() => setTimeLimit(s)} className={`rounded-xl px-4 py-2 text-[13px] font-bold ${timeLimit === s ? 'bg-curve/20 text-curve' : 'bg-panel-2 text-dim'}`}>
                        {s}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {error && <p className="mt-4 text-[12.5px] font-semibold text-coral">{error}</p>}
              <button
                onClick={createRoom}
                disabled={selected.length === 0 || stage === 'creating'}
                className="mt-6 w-full rounded-xl bg-violet py-3 text-[14px] font-bold text-[#140b1f] transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                {stage === 'creating' ? t('live.creating') : t('live.create')}
              </button>
              <p className="mt-2.5 text-center text-[11px] text-faint">{t('live.scoringNote')}</p>
            </div>
          </div>
        )}

        {stage === 'lobby' && r && (
          <div className="text-center">
            <p className="text-[15px] text-dim">{t('live.joinAt')}</p>
            <p className="mt-1 break-all font-mono text-[18px] font-bold text-curve md:text-[22px]">{joinUrl}</p>
            <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.2em] text-faint">{t('live.pin')}</p>
            <p className="font-mono text-6xl font-extrabold tracking-[0.12em] md:text-8xl">
              {r.pin.slice(0, 3)} {r.pin.slice(3)}
            </p>
            {tr.current.kind === 'local' && <p className="mx-auto mt-3 max-w-xl text-[12.5px] text-gold">{t('live.localHint')}</p>}
            <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-edge bg-panel p-5">
              <p className="mb-3 text-[14px] font-bold">{t('live.playersIn', { n: players.current.size })}</p>
              <div className="flex min-h-12 flex-wrap justify-center gap-2">
                {[...players.current.values()].map((p) => (
                  <span key={p.id} className="rise rounded-full bg-panel-2 px-3.5 py-1.5 text-[14px] font-semibold">
                    {p.name}
                  </span>
                ))}
                {players.current.size === 0 && <span className="text-[13px] text-faint">{t('live.waiting')}</span>}
              </div>
            </div>
            <button
              onClick={() => openQuestion(0)}
              disabled={players.current.size === 0}
              className="mt-6 rounded-full bg-violet px-10 py-3.5 text-[16px] font-bold text-[#140b1f] transition-transform hover:scale-[1.03] disabled:opacity-40"
            >
              {t('live.start', { n: questions.current.length })}
            </button>
          </div>
        )}

        {(stage === 'question' || stage === 'reveal') && q && (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-full bg-panel-2 px-3 py-1 font-mono text-[13px] font-bold text-dim">
                {t('live.qOf', { i: qIndex.current + 1, n: questions.current.length })}
              </span>
              {stage === 'question' ? (
                <Countdown deadline={deadline.current} total={timeLimit} />
              ) : (
                <span className="text-[13px] font-semibold text-dim">{t('live.answeredN', { a: answered.current, n: players.current.size })}</span>
              )}
              <span className="rounded-full bg-panel-2 px-3 py-1 text-[13px] font-bold text-dim">
                {stage === 'question' ? t('live.answeredN', { a: answered.current, n: players.current.size }) : `${q.skillTag}`}
              </span>
            </div>
            <div className="rounded-2xl border border-edge bg-panel px-6 py-8 text-center">
              <h2 className="text-2xl font-bold leading-relaxed md:text-3xl">
                <Formula text={q.question} />
              </h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {q.options.map((o, i) => (
                <Tile
                  key={i}
                  index={i}
                  big
                  dim={stage === 'reveal' && i !== q.correctIndex}
                  correct={stage === 'reveal' && i === q.correctIndex}
                  count={stage === 'reveal' ? counts.current[i] : undefined}
                >
                  <Formula text={o} />
                </Tile>
              ))}
            </div>
            {stage === 'reveal' && (
              <div className="rise mt-4 rounded-2xl border border-mint/30 bg-mint/[0.07] p-4 text-[14px] leading-relaxed text-dim">
                <Formula text={q.explanation} />
              </div>
            )}
            <div className="mt-5 flex justify-end">
              {stage === 'question' ? (
                <button onClick={closeQuestion} className="rounded-full border border-edge bg-panel px-6 py-3 text-[14px] font-bold text-dim hover:text-ink">
                  {t('live.closeQ')}
                </button>
              ) : (
                <button onClick={showScoreboard} className="rounded-full bg-violet px-8 py-3 text-[14px] font-bold text-[#140b1f]">
                  {t('live.toScoreboard')}
                </button>
              )}
            </div>
          </div>
        )}

        {stage === 'scoreboard' && (
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-center text-3xl font-extrabold">{t('live.scoreboard')}</h2>
            <ol className="space-y-2">
              {rows.slice(0, 5).map((p) => (
                <li key={p.id} className="rise flex items-center gap-4 rounded-2xl border border-edge bg-panel px-5 py-3.5">
                  <span className="w-8 text-center font-mono text-xl font-extrabold text-faint">{p.rank}</span>
                  <span className="min-w-0 flex-1 truncate text-[18px] font-bold">{p.name}</span>
                  {p.prevRank && p.prevRank > p.rank && <span className="text-[13px] font-bold text-mint">▲ {p.prevRank - p.rank}</span>}
                  {p.streak >= 2 && <span className="text-[13px] font-bold text-coral">🔥 {p.streak}</span>}
                  <span className="font-mono text-[20px] font-extrabold text-gold">{p.score}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex justify-center">
              <button onClick={next} className="rounded-full bg-violet px-10 py-3.5 text-[15px] font-bold text-[#140b1f]">
                {qIndex.current + 1 >= questions.current.length ? t('live.finish') : t('live.nextQ')}
              </button>
            </div>
          </div>
        )}

        {stage === 'end' && (
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-extrabold">{t('live.podium')}</h2>
            <Podium rows={rows} />
            <ol className="mx-auto mt-6 max-w-2xl divide-y divide-edge rounded-2xl border border-edge bg-panel text-left">
              {rows.slice(3).map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="w-8 text-center font-mono font-bold text-faint">{p.rank}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                  <span className="font-mono font-bold text-gold">{p.score}</span>
                </li>
              ))}
            </ol>
            <button
              onClick={() => {
                room.current = null
                setStage('setup')
              }}
              className="mt-6 rounded-full border border-edge bg-panel px-6 py-3 text-[14px] font-bold text-dim hover:text-ink"
            >
              {t('live.again')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

