import { useMemo, useRef, useState } from 'react'
import type { SceneProps } from '../content/types'
import { SceneCanvas } from '../components/SceneCanvas'
import { PlaneView } from '../engine/PlaneView'
import type { Stage } from '../engine/Stage'
import { C } from '../engine/palette'
import { clamp } from '../engine/easing'
import { derivative, parse } from 'mathjs'
import { MathfieldElement } from 'mathlive'
import { useLang } from '../i18n/LangContext'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<MathfieldElement>,
        MathfieldElement
      > & {
        value?: string
      }
    }
  }
}

const PRESETS = [
  'x^2/4 - 1',
  'sin(x) + x/3 + 1.5',
  'x^3/8 - x + 1.5',
  '2sin(x) + 3',
  'sqrt(x + 3)',
  'e^(x/2) - 2',
]

interface Toggles {
  tangent: boolean
  deriv: boolean
  area: boolean
}

interface Compiled {
  fn: ((x: number) => number) | null
  fp: ((x: number) => number) | null
  table: Float64Array | null
  total: number
  err: string | null
}

const XMIN = -6.4
const XMAX = 6.4
const TABLE_N = 600

function compileExpr(expr: string): Compiled {
  try {
    const code = parse(expr).compile()
    const fn = (x: number) => {
      const v = code.evaluate({ x })
      return typeof v === 'number' ? v : NaN
    }
    // probe a few values to surface errors early
    for (const px of [-3, 0.5, 2.7]) fn(px)

    let fp: ((x: number) => number) | null = null
    try {
      const dcode = derivative(expr, 'x').compile()
      fp = (x: number) => {
        const v = dcode.evaluate({ x })
        return typeof v === 'number' ? v : NaN
      }
      for (const px of [-1.2, 1.9]) fp(px)
    } catch {
      fp = null // symbolic derivative not available — tangent falls back to numeric
    }

    // numeric antiderivative table over the whole domain
    const table = new Float64Array(TABLE_N + 1)
    const h = (XMAX - XMIN) / TABLE_N
    let acc = 0
    for (let i = 1; i <= TABLE_N; i++) {
      const x0 = XMIN + (i - 1) * h
      const x1 = XMIN + i * h
      const y0 = fn(x0)
      const y1 = fn(x1)
      if (Number.isFinite(y0) && Number.isFinite(y1)) acc += ((y0 + y1) / 2) * h
      table[i] = acc
    }
    return { fn, fp, table, total: acc, err: null }
  } catch (e) {
    return { fn: null, fp: null, table: null, total: 0, err: (e as Error).message.slice(0, 90) }
  }
}

/** F(x) = ∫ from XMIN to x */
function tableAt(table: Float64Array, x: number): number {
  const t = clamp((x - XMIN) / (XMAX - XMIN), 0, 1) * TABLE_N
  const i = Math.min(TABLE_N - 1, Math.floor(t))
  const frac = t - i
  return table[i] + (table[i + 1] - table[i]) * frac
}

/**
 * Phòng thí nghiệm — free playground:
 * type any f(x), drag the probe point, toggle tangent / f′ / area layers.
 */
export default function GraphLab(_: SceneProps) {
  const { t } = useLang()
  const [expr, setExpr] = useState('sin(x) + x/3 + 1.5')
  const [toggles, setToggles] = useState<Toggles>({ tangent: true, deriv: false, area: false })
  const mfRef = useRef<MathfieldElement>(null)
  const A = useRef(1.4)
  const BndA = useRef(-2)
  const BndB = useRef(3)
  const compiled = useMemo(() => compileExpr(expr), [expr])

  const draw = (st: Stage) => {
    const { fn, fp, table } = compiled
    const p = new PlaneView(
      st,
      { x: 14, y: 10, w: st.width - 28, h: st.height - 20 },
      { x: [XMIN, XMAX], y: [-5.2, 6.4] },
    )
    p.grid()
    p.axes('x', 'y')

    if (!fn) {
      p.text(st.width / 2, st.height / 2, '⚠ biểu thức chưa hợp lệ — thử lại nhé', {
        color: C.coral, size: 15, mono: true, align: 'center',
      })
      return
    }

    p.curve(fn, { color: C.curve, width: 3, glow: 12 })

    // area layer
    if (toggles.area && table) {
      const a = clamp(BndA.current, XMIN + 0.2, BndB.current - 0.3)
      const b = clamp(BndB.current, a + 0.3, XMAX - 0.2)
      p.areaUnder(fn, a, b, { fill: C.teal, alpha: 0.25 })
      p.riemann(fn, a, b, 90, 'midpoint', { fill: C.teal, alpha: 0.14 })
      p.vline(a, { color: C.gold, width: 1.5, dash: [5, 5] })
      p.vline(b, { color: C.gold, width: 1.5, dash: [5, 5] })
      p.draggablePoint(a, fn(a), (mx) => {
        BndA.current = clamp(mx, XMIN + 0.2, BndB.current - 0.3)
      })
      p.draggablePoint(b, fn(b), (mx) => {
        BndB.current = clamp(mx, BndA.current + 0.3, XMAX - 0.2)
      })
      p.hud('tr', [
        `a = ${a.toFixed(2)}   b = ${b.toFixed(2)}`,
        `∫ₐᵇ ≈ ${(tableAt(table, b) - tableAt(table, a)).toFixed(3)}`,
      ], { color: C.teal, width: 220 })
    }

    // derivative layer
    if (toggles.deriv && fp) {
      p.curve(fp, { color: C.mint, width: 2, dash: [7, 5], alpha: 0.85 })
    }

    // probe point + tangent
    const ax = clamp(A.current, XMIN + 0.4, XMAX - 0.4)
    const ay = fn(ax)
    if (Number.isFinite(ay)) {
      const slope = fp ? fp(ax) : numericSlope(fn, ax)
      if (toggles.tangent && Number.isFinite(slope)) {
        p.ray(ax, ay, slope, { color: C.gold, width: 2, glow: 8 })
      }
      p.point(ax, ay, { color: C.gold, halo: true, r: 6 })
      p.draggablePoint(ax, ay, (mx) => {
        A.current = clamp(mx, XMIN + 0.4, XMAX - 0.4)
      })
      p.hud('tl', [
        `a = ${ax.toFixed(2)}`,
        `f(a)   = ${fmt(ay)}`,
        `f′(a)  = ${fmt(slope)}`,
      ], { color: C.gold, width: 172 })
    }

    // legend
    const legend: string[] = []
    if (toggles.tangent) legend.push(`— ${t('lab.tangent')}`)
    if (toggles.deriv) legend.push('-- f′(x)')
    if (toggles.area) legend.push(`▨ ${t('lab.area')}`)
    if (legend.length) {
      p.text(p.rect.x + 10, p.rect.y + p.rect.h - 10, legend.join('    '), {
        color: C.dim, size: 11.5, mono: true,
      })
    }
  }

  return (
    <>
      <SceneCanvas draw={draw} />
      <div className="absolute bottom-3 left-1/2 w-[min(680px,94vw)] -translate-x-1/2 rounded-2xl border border-edge bg-bg/90 p-3 backdrop-blur md:bottom-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-curve">f(x) =</span>
            <math-field
              ref={mfRef}
              value={expr}
              onInput={(e) => setExpr((e.target as unknown as MathfieldElement).value)}
              className="min-w-0 flex-1 rounded-lg border border-edge bg-panel px-3 py-1.5 text-[15px]"
              style={{
                ['--caret-color' as string]: '#58c4dd',
                ['--contains-highlight-background-color' as string]: '#1a2140',
                ['--primary' as string]: '#58c4dd',
              }}
              aria-label={t('lab.expr')}
            ></math-field>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {(
              [
                ['tangent', t('lab.tangent')],
                ['deriv', t('lab.deriv')],
                ['area', t('lab.area')],
              ] as Array<[keyof Toggles, string]>
            ).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-1.5 text-[12.5px] font-semibold text-dim">
                <input
                  type="checkbox"
                  checked={toggles[key]}
                  onChange={(e) => setToggles((t) => ({ ...t, [key]: e.target.checked }))}
                  className="size-3.5 accent-curve"
                />
                {label}
              </label>
            ))}
            <span className="ml-auto hidden text-[11px] text-faint md:inline">
              kéo điểm vàng trên đồ thị · kéo a, b khi bật diện tích
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setExpr(preset)
                  if (mfRef.current) mfRef.current.value = preset
                }}
                className={`rounded-full border px-2.5 py-1 font-mono text-[11.5px] transition-colors ${
                  expr === preset
                    ? 'border-curve/60 bg-curve/15 text-curve'
                    : 'border-edge bg-panel text-dim hover:text-ink'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {compiled.err && (
            <p className="font-mono text-[11.5px] text-coral">⚠ {compiled.err}</p>
          )}
        </div>
      </div>
    </>
  )
}

function numericSlope(fn: (x: number) => number, x: number): number {
  const h = 1e-4
  return (fn(x + h) - fn(x - h)) / (2 * h)
}

function fmt(v: number): string {
  if (!Number.isFinite(v)) return '—'
  return Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(2) : v.toFixed(3)
}
