import { Link } from 'react-router-dom'
import { useSyncExternalStore } from 'react'
import { lessons } from '../content'
import { getProgress, subscribe } from '../lib/progress'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguagePicker } from '../components/LanguagePicker'
import { useStage } from '../engine/useStage'
import { PlaneView } from '../engine/PlaneView'
import { C } from '../engine/palette'
import { easeInOutSine, lerp } from '../engine/easing'
import type { Stage } from '../engine/Stage'
import { useLang } from '../i18n/LangContext'
import { RichText } from '../i18n/RichText'
import { getAttempts } from '../quiz/store'
import { UserBadge } from '../components/UserGate'
import { useUser } from '../lib/user'

/** Ambient hero demo: sweeping tangent + filling area on a cubic. */
function HeroDemo() {
  const { canvasRef } = useStage((st: Stage) => {
    const f = (x: number) => (x * x * x) / 8 - x + 1.5
    const fp = (x: number) => (3 * x * x) / 8 - 1
    const rect = { x: 0, y: 0, w: st.width, h: st.height }
    const p = new PlaneView(st, rect, { x: [-3.4, 3.4], y: [-2.6, 4] })

    p.grid()
    p.axes('x', 'y')
    p.areaUnder(f, -3.4, lerp(-3.4, 3.4, easeInOutSine(st.time * 0.05 % 1)), {
      fill: C.teal, alpha: 0.16,
    })
    p.curve(f, { color: C.curve, width: 3, glow: 12 })

    const xs = lerp(-3, 3, easeInOutSine(st.time * 0.09 % 1))
    const ys = f(xs)
    p.ray(xs, ys, fp(xs), { color: C.gold, width: 2, glow: 8, alpha: 0.9 })
    p.point(xs, ys, { color: C.gold, halo: true })
  })
  return <canvas ref={canvasRef} className="h-full w-full touch-none" aria-hidden />
}

export function Home() {
  const progress = useSyncExternalStore(subscribe, getProgress)
  useUser() // re-render (quiz history, progress) when the profile changes
  const next = lessons.find((l) => !progress[l.id]) ?? lessons[0]
  const { t, lessonTitle, lessonSubtitle } = useLang()
  const weakSkills = getAttempts()[0]?.weakSkills?.slice(0, 4) ?? []

  return (
    <div className="h-full overflow-y-auto">
      <div className="fixed right-4 top-4 z-20 flex items-center gap-2 md:right-6 md:top-6">
        <UserBadge />
        <LanguagePicker />
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 md:px-8 md:pt-16">
        {/* hero */}
        <section className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-edge bg-panel px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-dim">
              <span className="size-1.5 rounded-full bg-teal" /> {t('home.badge')}
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.18] tracking-tight md:text-5xl">
              {t('home.h1a')}
              <br />
              <span className="bg-gradient-to-r from-curve via-teal to-mint bg-clip-text text-transparent">
                {t('home.h1b')}
              </span>
              <br />
              {t('home.h1c')}
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-dim">
              <RichText k="home.p" />
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={`/lesson/${next.id}`}
                className="rounded-full bg-curve px-6 py-3 text-[14px] font-bold text-[#08101c] shadow-[0_0_28px_rgba(88,196,221,0.35)] transition-transform hover:scale-[1.03]"
              >
                {progress[next.id] ? t('home.review') : t('home.start')} →
              </Link>
              <span className="text-[12px] text-faint">{t('home.noSignup')}</span>
            </div>
          </div>
          <div className="h-60 overflow-hidden rounded-2xl border border-edge bg-bg-soft md:h-80">
            <HeroDemo />
          </div>
        </section>

        {/* chapters */}
        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-lg font-bold">{t('home.program')}</h2>
            <p className="text-[12px] text-faint">
              {t('home.completed', {
                done: lessons.filter((l) => progress[l.id]).length,
                total: lessons.length,
              })}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((l) => (
              <Link
                key={l.id}
                to={`/lesson/${l.id}`}
                className="group relative overflow-hidden rounded-2xl border border-edge bg-panel p-5 transition-all hover:-translate-y-0.5 hover:border-curve/50"
              >
                <div
                  className="absolute -right-8 -top-8 size-28 rounded-full opacity-[0.07] blur-xl transition-opacity group-hover:opacity-20"
                  style={{ background: l.accent }}
                />
                <div className="flex items-start justify-between">
                  <span
                    className="grid size-11 place-items-center rounded-xl text-xl font-bold"
                    style={{ background: `${l.accent}1c`, color: l.accent }}
                  >
                    {l.glyph}
                  </span>
                  {progress[l.id] ? (
                    <span className="rounded-full bg-mint/15 px-2.5 py-1 text-[11px] font-semibold text-mint">
                      {t('home.doneBadge')}
                    </span>
                  ) : l.kind === 'theory' ? (
                    <span className="rounded-full bg-panel-2 px-2.5 py-1 text-[11px] font-semibold text-faint">
                      {t('home.theoryBadge')}
                    </span>
                  ) : (
                    <span className="rounded-full bg-panel-2 px-2.5 py-1 text-[11px] font-semibold text-faint">
                      {t('home.stepsBadge', { n: l.steps.length })}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-[16px] font-bold">
                  {l.number}. {lessonTitle(l.id, l.title)}
                </h3>
                <p className="mt-1 text-[13px] leading-snug text-dim">
                  {lessonSubtitle(l.id, l.subtitle)}
                </p>
                <p className="mt-4 text-[12px] font-semibold" style={{ color: l.accent }}>
                  {t('home.open')}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* weak-skills banner — from the latest quiz attempt */}
        {weakSkills.length > 0 && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-coral/35 bg-gradient-to-r from-coral/[0.10] to-transparent p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-xl">
                <h2 className="text-[15px] font-bold">🎯 {t('home.weakTitle')}</h2>
                <p className="mt-1 text-[12.5px] text-dim">{t('home.weakBody')}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {weakSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-coral/15 px-2.5 py-1 text-[11.5px] font-semibold text-coral"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to="/quiz"
                className="rounded-full bg-coral px-5 py-2.5 text-[13px] font-bold text-[#1f0b0b] transition-transform hover:scale-[1.03]"
              >
                {t('home.weakCta')}
              </Link>
            </div>
          </section>
        )}

        {/* quiz banner */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-violet/35 bg-gradient-to-r from-violet/[0.12] to-transparent p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="text-lg font-bold">{t('home.quizTitle')}</h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-dim">{t('home.quizBody')}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/quiz"
                className="rounded-full bg-violet px-6 py-3 text-[14px] font-bold text-[#140b1f] shadow-[0_0_24px_rgba(178,141,221,0.3)] transition-transform hover:scale-[1.03]"
              >
                {t('home.quizCta')}
              </Link>
              <Link
                to="/leaderboard"
                className="rounded-full border border-gold/50 bg-gold/10 px-5 py-3 text-[14px] font-bold text-gold transition-transform hover:scale-[1.03]"
              >
                🏆 {t('rail.lb')}
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-edge pt-6 text-[12px] leading-relaxed text-faint">
          <RichText k="home.footer" />
        </footer>
      </div>
    </div>
  )
}
