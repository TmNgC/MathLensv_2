import { useEffect, useState, type ReactNode } from 'react'
import type { LivePlayerRow } from './transport'
import { TILE } from './tiles'

/** one answer tile (Kahoot colours + shapes so colour-blind students can tell them apart) */
export function Tile({
  index,
  children,
  big = false,
  dim = false,
  correct = false,
  count,
  onClick,
  disabled,
  chosen = false,
}: {
  index: number
  children?: ReactNode
  big?: boolean
  dim?: boolean
  correct?: boolean
  count?: number
  onClick?: () => void
  disabled?: boolean
  chosen?: boolean
}) {
  const tile = TILE[index]
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      className={`relative flex w-full items-center gap-3 rounded-2xl px-4 text-left text-white shadow-md transition-all ${
        big ? 'min-h-20 py-4 text-[18px] md:text-[20px]' : 'min-h-16 py-3 text-[15px]'
      } ${dim ? 'opacity-35' : ''} ${correct ? 'ring-4 ring-white/80' : ''} ${chosen ? 'ring-4 ring-white' : ''} ${
        onClick && !disabled ? 'active:scale-[0.98] hover:brightness-110' : ''
      }`}
      style={{ background: tile.color }}
    >
      <span className="grid size-9 shrink-0 place-items-center text-[22px]" aria-hidden>
        {tile.shape}
      </span>
      <span className="min-w-0 flex-1 font-semibold [&_.katex]:text-white">{children}</span>
      {correct && <span className="text-[22px]">✓</span>}
      {count !== undefined && (
        <span className="shrink-0 rounded-full bg-black/25 px-2.5 py-0.5 font-mono text-[14px] font-bold">{count}</span>
      )}
    </Tag>
  )
}

/** circular countdown driven by a local-clock deadline */
export function Countdown({ deadline, total }: { deadline: number; total: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])
  const left = Math.max(0, (deadline - now) / 1000)
  const frac = Math.min(1, left / total)
  const r = 26
  const C = 2 * Math.PI * r
  const color = left > total * 0.5 ? '#26890c' : left > 5 ? '#d89e00' : '#e21b3c'
  return (
    <span className="relative inline-grid size-16 place-items-center" role="timer" aria-live="off">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" className="text-edge" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
      </svg>
      <span className="font-mono text-[20px] font-extrabold">{Math.ceil(left)}</span>
    </span>
  )
}

/** final top-3 podium */
export function Podium({ rows }: { rows: LivePlayerRow[] }) {
  const order = [1, 0, 2] // 2nd, 1st, 3rd
  const heights = ['h-40', 'h-28', 'h-20']
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className="mx-auto mt-8 flex max-w-2xl items-end justify-center gap-3">
      {order.map((i) => {
        const p = rows[i]
        if (!p) return <div key={i} className="flex-1" />
        return (
          <div key={p.id} className="rise flex flex-1 flex-col items-center">
            <span className="text-4xl">{medals[i]}</span>
            <span className="mt-1 max-w-full truncate text-[17px] font-extrabold">{p.name}</span>
            <span className="font-mono text-[15px] font-bold text-gold">{p.score}</span>
            <div className={`mt-2 w-full rounded-t-2xl ${heights[i]}`} style={{ background: ['#d89e00', '#8a94a6', '#b0703c'][i] + 'cc' }} />
          </div>
        )
      })}
    </div>
  )
}
