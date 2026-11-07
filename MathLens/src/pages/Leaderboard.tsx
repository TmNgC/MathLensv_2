import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LessonChips, LessonRail } from '../components/LessonRail'
import { Avatar, SignOutLink } from '../components/UserGate'
import { openUserDialog } from '../lib/userUi'
import { PERIODS, fetchBoard, type Board, type Period } from '../lib/leaderboard'
import { nameKey, useUser } from '../lib/user'
import { useLang } from '../i18n/LangContext'

const MEDALS = ['🥇', '🥈', '🥉']

export function Leaderboard() {
  const { t } = useLang()
  const { user } = useUser()
  const [period, setPeriod] = useState<Period>('day')
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchBoard(period, user).then((b) => {
      if (!alive) return
      setBoard(b)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [period, user, tick])

  // keep the board fresh while a class is competing
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const myKey = user?.key
  const meInTop = !!board?.entries.some((e) => nameKey(e.name) === myKey)

  return (
    <div className="flex h-full flex-col md:flex-row">
      <LessonRail />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <LessonChips />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-5 pb-20 pt-8 md:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{t('lb.overline')}</p>
            <h1 className="mt-1 text-2xl font-extrabold">
              {t('lb.titleA')} <span className="text-gold">{t('lb.titleB')}</span>
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{t('lb.sub')}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-violet/35 bg-gradient-to-r from-violet/[0.12] to-transparent p-4">
              <span className="text-3xl">🎮</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold">{t('live.cardTitle')}</p>
                <p className="text-[12px] leading-relaxed text-dim">{t('live.cardBody')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/live" className="rounded-full bg-violet px-4 py-2 text-[12.5px] font-bold text-[#140b1f]">
                  {t('live.hostLink')}
                </Link>
                <Link to="/play" className="rounded-full border border-violet/50 px-4 py-2 text-[12.5px] font-bold text-violet">
                  {t('live.join')}
                </Link>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2" role="tablist">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  role="tab"
                  aria-selected={period === p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                    period === p ? 'bg-gold/20 text-gold' : 'bg-panel-2 text-dim hover:text-ink'
                  }`}
                >
                  {t(`lb.tab.${p}`)}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-edge bg-panel">
              <div className="flex items-center justify-between gap-3 border-b border-edge px-5 py-3">
                <p className="text-[12.5px] font-semibold text-dim">
                  {t(`lb.desc.${period}`)} {board && board.label !== 'all' && <span className="font-mono text-faint">· {board.label}</span>}
                </p>
                {board && (
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
                      board.source === 'global' ? 'bg-mint/15 text-mint' : 'bg-panel-2 text-faint'
                    }`}
                    title={board.source === 'global' ? t('lb.globalHint') : t('lb.localHint')}
                  >
                    {board.source === 'global' ? t('lb.global') : t('lb.local')}
                  </span>
                )}
              </div>

              {loading && !board ? (
                <div className="grid place-items-center py-14">
                  <div className="size-8 animate-spin rounded-full border-[3px] border-edge border-t-gold" />
                </div>
              ) : board && board.entries.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-3xl">🏁</p>
                  <p className="mt-2 text-[13.5px] font-semibold text-dim">{t('lb.empty')}</p>
                  <Link to="/quiz" className="mt-3 inline-block rounded-full bg-violet px-5 py-2 text-[13px] font-bold text-[#140b1f]">
                    {t('lb.cta')}
                  </Link>
                </div>
              ) : (
                <ol className={`divide-y divide-edge ${loading ? 'opacity-60' : ''}`}>
                  {board?.entries.map((e) => {
                    const mine = nameKey(e.name) === myKey
                    return (
                      <li key={e.rank + e.name} className={`flex items-center gap-3 px-5 py-2.5 ${mine ? 'bg-curve/10' : ''}`}>
                        <span className="w-8 text-center font-mono text-[14px] font-bold text-faint">
                          {MEDALS[e.rank - 1] ?? e.rank}
                        </span>
                        <Avatar name={e.name} userKey={nameKey(e.name)} size={30} />
                        <span className={`min-w-0 flex-1 truncate text-[14px] font-semibold ${mine ? 'text-curve' : ''}`}>
                          {e.name}
                          {mine && <span className="ml-1.5 text-[11px] font-bold text-curve">({t('lb.you')})</span>}
                        </span>
                        <span className="font-mono text-[14px] font-bold text-gold">{e.points.toLocaleString()}</span>
                        <span className="w-8 text-[11px] text-faint">{t('lb.pts')}</span>
                      </li>
                    )
                  })}
                </ol>
              )}

              {board?.me && !meInTop && (
                <div className="flex items-center gap-3 border-t border-dashed border-edge bg-curve/10 px-5 py-2.5">
                  <span className="w-8 text-center font-mono text-[13px] font-bold text-faint">{board.me.rank}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-curve">
                    {board.me.name} ({t('lb.you')})
                  </span>
                  <span className="font-mono text-[14px] font-bold text-gold">{board.me.points.toLocaleString()}</span>
                  <span className="w-8 text-[11px] text-faint">{t('lb.pts')}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-edge bg-panel-2 px-5 py-3.5">
              <p className="max-w-lg text-[12px] leading-relaxed text-dim">{t('lb.rules')}</p>
              {user ? (
                <SignOutLink />
              ) : (
                <button onClick={openUserDialog} className="rounded-full bg-curve px-4 py-2 text-[12.5px] font-bold text-[#08101c]">
                  {t('lb.join')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
