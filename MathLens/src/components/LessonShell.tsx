import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import type { Lesson, LessonClock } from '../content/types'
import { LessonChips, LessonRail } from './LessonRail'
import { ScrubBar } from './ScrubBar'
import { Formula } from './Formula'
import { FunFact } from './FunFact'
import { TheoryPanel } from './TheoryPanel'
import { markDone } from '../lib/progress'
import { useLang } from '../i18n/LangContext'

export const LessonClockContext = createContext<LessonClock | null>(null)

/** Scenes read the animation clock from context inside their draw loop. */
export const useLessonClock = (): LessonClock => {
  const clock = useContext(LessonClockContext)
  if (!clock) throw new Error('useLessonClock must be used inside LessonShell')
  return clock
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

/**
 * LessonShell — persistent stage + narrative steps + animation clock.
 * Owns: current step, looping playhead (0..1 per step), pause state,
 * keyboard navigation, and progress marking. `mode="theory"` swaps the
 * stage for the lesson's theory document.
 */
export function LessonShell({ lesson, mode = 'visual' }: { lesson: Lesson; mode?: 'visual' | 'theory' }) {
  const { t, lessonTitle } = useLang()
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
  const playheadRef = useRef(0)
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const stepRef = useRef(step)
  stepRef.current = step
  const navigate = useNavigate()

  const lastStep = lesson.steps.length - 1
  const clock = useMemo<LessonClock>(
    () => ({ step, playheadRef, pausedRef }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step],
  )

  // advance the playhead every frame while playing
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!pausedRef.current) {
        const dur = lesson.steps[stepRef.current]?.duration ?? 6
        playheadRef.current = (playheadRef.current + dt / dur) % 1
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [lesson])

  const go = (delta: number) => {
    const next = Math.min(lastStep, Math.max(0, step + delta))
    if (next !== step) {
      setStep(next)
      playheadRef.current = 0
    }
  }

  // reaching the final step completes the lesson
  useEffect(() => {
    if (step === lastStep) markDone(lesson.id)
  }, [step, lastStep, lesson.id])

  // keyboard: ← → change step, Space toggles pause
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t?.closest?.('input, textarea, math-field, [contenteditable]')) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const current = lesson.steps[step]

  // theory-only lessons: straight to the document (no stage, no tabs)
  if (lesson.kind === 'theory' && lesson.theory) {
    return (
      <div className="flex h-full flex-col md:flex-row">
        <LessonRail activeId={lesson.id} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <LessonChips activeId={lesson.id} />
          <div className="min-h-0 flex-1">
            <TheoryPanel title={lesson.title} accent={lesson.accent} sections={lesson.theory} />
          </div>
        </div>
      </div>
    )
  }

  /** tab switch between visualizer and theory (hidden for lab) */
  const TheoryTabs = lesson.theory ? (
    <div className="flex gap-1 rounded-full border border-edge bg-bg/85 p-1 backdrop-blur">
      <Link
        to={`/lesson/${lesson.id}`}
        className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
          mode === 'visual' ? 'bg-curve/20 text-curve' : 'text-dim hover:text-ink'
        }`}
      >
        🎬 {t('shell.visual')}
      </Link>
      <Link
        to={`/lesson/${lesson.id}/theory`}
        className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
          mode === 'theory' ? 'bg-curve/20 text-curve' : 'text-dim hover:text-ink'
        }`}
      >
        📖 {t('shell.theory')}
      </Link>
    </div>
  ) : null

  // theory mode: document view (no stage, no step card)
  if (mode === 'theory' && lesson.theory) {
    return (
      <div className="flex h-full flex-col md:flex-row">
        <LessonRail activeId={lesson.id} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <LessonChips activeId={lesson.id} />
          <div className="border-b border-edge bg-bg-soft/60 px-4 py-2.5 md:px-6">
            <div className="mx-auto max-w-3xl">{TheoryTabs}</div>
          </div>
          <div className="min-h-0 flex-1">
            <TheoryPanel title={lesson.title} accent={lesson.accent} sections={lesson.theory} />
          </div>
        </div>
      </div>
    )
  }

  // Lab lessons have no narrative steps — the scene is a self-contained playground.
  if (lesson.kind === 'lab') {
    return (
      <div className="flex h-full flex-col md:flex-row">
        <LessonRail activeId={lesson.id} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <LessonChips activeId={lesson.id} />
          <div className="relative min-h-0 flex-1 bg-bg">
            {lesson.Scene && <lesson.Scene step={0} />}
            <div className="pointer-events-none absolute left-4 top-3 md:left-6 md:top-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
                {t('shell.labHeader')}
              </p>
              <h1 className="text-lg font-bold md:text-xl">{lessonTitle(lesson.id, lesson.title)}</h1>
            </div>
          </div>
          <footer className="border-t border-edge bg-bg-soft/95 px-4 py-2.5 md:px-6">
            <p className="mx-auto max-w-5xl text-center text-[12px] text-faint">{t('shell.labFooter')}</p>
          </footer>
        </div>
      </div>
    )
  }

  return (
    <LessonClockContext.Provider value={clock}>
      <div className="flex h-full flex-col md:flex-row">
        <LessonRail activeId={lesson.id} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <LessonChips activeId={lesson.id} />

          {TheoryTabs && (
            <div className="border-b border-edge bg-bg-soft/60 px-4 py-2 md:px-6">
              <div className="mx-auto flex max-w-5xl justify-center">{TheoryTabs}</div>
            </div>
          )}

          {/* stage — the scene owns its canvas here */}
          <div className="relative min-h-0 flex-1 bg-bg">
            {lesson.Scene && <lesson.Scene step={step} />}
            <div className="pointer-events-none absolute left-4 top-3 md:left-6 md:top-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
                {t('shell.lessonNo', { n: lesson.number })}
              </p>
              <h1 className="text-lg font-bold md:text-xl">{lessonTitle(lesson.id, lesson.title)}</h1>
            </div>
            {step === lastStep && (
              <button
                onClick={() => navigate('/')}
                className="absolute right-4 top-4 rounded-full border border-mint/40 bg-mint/10 px-3.5 py-1.5 text-[12px] font-semibold text-mint transition-colors hover:bg-mint/20 md:right-6 md:top-5"
              >
                {t('shell.done')}
              </button>
            )}
          </div>

          {/* narrative step card */}
          <footer className="border-t border-edge bg-bg-soft/95 px-4 py-3.5 md:px-6">
            <div className="mx-auto max-w-5xl">
              {/* named section buttons — jump straight to any step */}
              <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5" role="tablist" aria-label={t('shell.parts')}>
                {lesson.steps.map((s, i) => {
                  const label = s.title.replace(/\$(.+?)\$/g, '$1')
                  return (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === step}
                      title={`${i + 1}. ${label}`}
                      onClick={() => {
                        setStep(i)
                        playheadRef.current = 0
                      }}
                      className={`shrink-0 rounded-full px-3 py-1 text-[11.5px] font-semibold transition-colors ${
                        i === step
                          ? 'bg-curve/20 text-curve shadow-[0_0_12px_rgba(69,224,255,0.25)]'
                          : i < step
                            ? 'bg-panel-2 text-dim hover:text-ink'
                            : 'bg-panel-2/50 text-faint hover:text-dim'
                      }`}
                    >
                      <span className="opacity-60">{i + 1}·</span> {truncate(label, 22)}
                    </button>
                  )
                })}
              </div>

              <div key={step} className="rise">
                <h2 className="text-[15px] font-bold text-ink">{current.title}</h2>
                <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-dim">
                  <Formula text={current.body} />
                </p>
                {current.funFact && <FunFact fact={current.funFact} />}
              </div>

              <div className="mt-3 max-w-xl">
                <ScrubBar
                  playheadRef={playheadRef}
                  paused={paused}
                  onTogglePause={() => setPaused((p) => !p)}
                  onStep={go}
                />
              </div>
            </div>
          </footer>
        </div>
      </div>
    </LessonClockContext.Provider>
  )
}
