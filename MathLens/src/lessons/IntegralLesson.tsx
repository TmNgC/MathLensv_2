import { useRef, useState } from 'react'
import type { SceneProps } from '../content/types'
import { useLessonClock } from '../components/LessonShell'
import { SceneCanvas } from '../components/SceneCanvas'
import { PlaneView, roundRectPath } from '../engine/PlaneView'
import type { Stage } from '../engine/Stage'
import type { RiemannMethod } from '../engine/PlaneView'
import { C, MONO } from '../engine/palette'
import { clamp, easeInOutCubic, easeInOutSine, lerp } from '../engine/easing'

/* ---------- the lesson's functions ---------- */

const f = (x: number) => 1 + 0.9 * Math.sin(1.2 * x) + x / 5
const X0 = 0
const X1 = 6

/** cumulative trapezoid table of F(x)=∫₀ˣ f */
function cumtable(n = 600): Float64Array {
  const out = new Float64Array(n + 1)
  const h = (X1 - X0) / n
  let acc = 0
  out[0] = 0
  for (let i = 1; i <= n; i++) {
    const xPrev = X0 + ((i - 1) * (X1 - X0)) / n
    const x = X0 + (i * (X1 - X0)) / n
    acc += ((f(xPrev) + f(x)) / 2) * h
    out[i] = acc
  }
  return out
}
const F_TABLE = cumtable()
const F_MAX = F_TABLE[F_TABLE.length - 1]
function F(x: number): number {
  const t = clamp((x - X0) / (X1 - X0), 0, 1) * F_TABLE.length
  const i = Math.min(F_TABLE.length - 1, Math.floor(t))
  const frac = t - i
  const a = F_TABLE[i]
  const b = F_TABLE[Math.min(F_TABLE.length - 1, i + 1)]
  return a + (b - a) * frac
}

/** signed-area guest function (dips below the axis) */
const g = (x: number) => 1.2 * Math.sin(1.15 * x) + 0.2
const G_EXACT = (x: number) => -(1.2 / 1.15) * Math.cos(1.15 * x) + 0.2 * x
const GA = 0.8
const GB = 5.6

/** signed Riemann stats: pos/neg contributions */
function riemannStats(fn: (x: number) => number, a: number, b: number, n: number, method: RiemannMethod) {
  const dx = (b - a) / n
  let sum = 0
  let pos = 0
  let neg = 0
  for (let i = 0; i < n; i++) {
    const x0 = a + i * dx
    const y =
      method === 'trapezoid'
        ? (fn(x0) + fn(x0 + dx)) / 2
        : fn(method === 'left' ? x0 : method === 'right' ? x0 + dx : x0 + dx / 2)
    const c = y * dx
    sum += c
    if (c >= 0) pos += c
    else neg += c
  }
  return { sum, pos, neg }
}

const METHODS: Array<{ id: RiemannMethod; label: string }> = [
  { id: 'left', label: 'mép trái' },
  { id: 'right', label: 'mép phải' },
  { id: 'midpoint', label: 'điểm giữa' },
  { id: 'trapezoid', label: 'hình thang' },
]

/**
 * Bài "Tích phân" — 8 bước:
 * 0 area problem (draggable bounds) · 1 Riemann intro · 2 n→∞ + method picker
 * 3 signed area (below the axis) · 4 accumulation A(x) · 5 FTC: A′ = f
 * 6 velocity → distance (animated car) · 7 antiderivative shortcut F(b)−F(a)
 */
export function IntegralScene({ step }: SceneProps) {
  const { playheadRef } = useLessonClock()
  const A = useRef(1.0)
  const B = useRef(5.0)
  const [method, setMethod] = useState<RiemannMethod>('left')

  const draw = (st: Stage) => {
    const ph = playheadRef.current
    const W = st.width
    const H = st.height
    const ctx = st.ctx!

    // era visibilities
    const split = st.smooth('split', step === 4 || step === 5 ? 1 : 0, 5)
    const v04 = st.smooth('v04', step === 5 ? 1 : 0, 5)
    const vG = st.smooth('vG', step === 3 ? 1 : 0, 6)
    const vCar = st.smooth('vCar', step === 6 ? 1 : 0, 6)
    const vAnti = st.smooth('vAnti', step === 7 ? 1 : 0, 6)

    const full = { x: 14, y: 10, w: W - 28, h: H - 20 }
    const leftW = full.w * lerp(1, 0.55, split)
    const gap = 16
    const carStrip = 112 * vCar
    const left = new PlaneView(
      st,
      { x: full.x, y: full.y, w: leftW, h: full.h - carStrip },
      blendDom(
        blendDom({ x: [-0.4, 6.4], y: [-0.55, 3.8] }, { x: [-0.2, 6.2], y: [-1.75, 2.3] }, vG),
        { x: [-0.4, 6.4], y: [-1, F_MAX + 1] },
        vAnti,
      ),
    )
    const right = new PlaneView(
      st,
      { x: full.x + leftW + gap, y: full.y, w: full.w - leftW - gap, h: full.h },
      { x: [-0.4, 6.4], y: [-0.8, F_MAX + 1] },
    )

    left.grid()
    left.axes('x', 'y')

    const ax = clamp(A.current, 0.15, 5.8)
    const bx = clamp(B.current, ax + 0.3, 5.95)

    const eraF = (1 - vG) * (1 - vAnti)

    /* ---------------- steps 0–2: Riemann era ---------------- */
    if (eraF > 0.02 && step <= 2) {
      left.curve(f, { color: C.curve, width: 3, glow: 12, alpha: eraF })
      if (step === 0) {
        left.areaUnder(f, ax, bx, { fill: C.teal, alpha: 0.22 })
        left.vline(ax, { color: C.gold, width: 1.5, dash: [5, 5] })
        left.vline(bx, { color: C.gold, width: 1.5, dash: [5, 5] })
        left.draggablePoint(ax, f(ax), (mx) => {
          A.current = clamp(mx, 0.15, B.current - 0.3)
        })
        left.draggablePoint(bx, f(bx), (mx) => {
          B.current = clamp(mx, A.current + 0.3, 5.95)
        })
        left.text(left.sx(ax), left.rect.y + 26, 'a', { color: C.gold, size: 13, mono: true, align: 'center', weight: 600 })
        left.text(left.sx(bx), left.rect.y + 26, 'b', { color: C.gold, size: 13, mono: true, align: 'center', weight: 600 })
        left.hud('tr', ['S = ?', 'diện tích = ?'], { color: C.teal, width: 128 })
      } else {
        const n =
          step === 1
            ? Math.max(1, Math.round(lerp(1, 16, easeInOutSine(ph))))
            : Math.round(Math.exp(lerp(Math.log(2), Math.log(200), easeInOutSine(ph))))
        const sum = left.riemann(f, ax, bx, n, method, {
          fill: C.teal, alpha: 0.32, stroke: C.teal, strokeAlpha: 0.55,
        })
        const exact = F(bx) - F(ax)
        left.hud(
          'tr',
          [
            `n     = ${n}`,
            `Sₙ    = ${sum.toFixed(4)}`,
            `∫     = ${exact.toFixed(4)}`,
            `sai số = ${(sum - exact).toFixed(4)}`,
          ],
          { color: C.teal, width: 170 },
        )
      }
    }

    /* ---------------- step 3: signed area ---------------- */
    if (vG > 0.02) {
      left.curve(g, { color: C.curve, width: 3, glow: 12, alpha: vG })
      const n = 34
      left.riemann(g, GA, GB, n, 'midpoint', {
        fill: C.teal, negativeFill: C.coral, alpha: 0.35, stroke: C.dim, strokeAlpha: 0.4,
      })
      const s = riemannStats(g, GA, GB, n, 'midpoint')
      const exact = G_EXACT(GB) - G_EXACT(GA)
      left.hud(
        'tr',
        [
          `A₊ (trên trục)  = ${s.pos.toFixed(3)}`,
          `A₋ (dưới trục)  = ${Math.abs(s.neg).toFixed(3)}`,
          `∫ = A₊ − A₋     = ${s.sum.toFixed(3)}`,
          `chính xác       = ${exact.toFixed(3)}`,
        ],
        { color: C.mint, width: 205 },
      )
      left.text(left.sx(4.1), left.sy(g(4.1)) + 22, 'âm → bị trừ', {
        color: C.coral, size: 12, mono: true, align: 'center', bg: `${C.bg}e6`,
      })
    }

    /* ---------------- step 6: velocity → distance ---------------- */
    if (vCar > 0.02) {
      const xs = lerp(X0 + 0.03, X1 - 0.03, easeInOutSine(ph))
      left.curve(f, { color: C.curve, width: 3, glow: 12, alpha: vCar })
      left.areaUnder(f, X0, xs, { fill: C.teal, alpha: 0.3 * vCar })
      left.vline(xs, { color: C.gold, width: 1.5, dash: [5, 5], alpha: vCar })
      left.point(xs, f(xs), { color: C.gold })
      left.text(left.rect.x + 10, left.rect.y + 24, 'v(t) — vận tốc', {
        color: C.dim, size: 12, mono: true,
      })
      left.hud(
        'tr',
        [`t      = ${xs.toFixed(2)}`, `v(t)   = ${f(xs).toFixed(2)}`, `s(t) = ${F(xs).toFixed(2)}`],
        { color: C.teal, width: 172 },
      )
      drawCarStrip(ctx, full.x, full.y + full.h - carStrip + 8, full.w, carStrip - 10, F(xs) / F_MAX, f(xs), vCar)
    }

    /* ---------------- step 7: antiderivative ---------------- */
    if (vAnti > 0.02) {
      // A(x) curve
      const n = 90
      const pts: Array<[number, number]> = []
      for (let i = 0; i <= n; i++) {
        const x = X0 + ((X1 - X0) * i) / n
        pts.push([x, F(x)])
      }
      left.polyline(pts, { color: C.mint, width: 3, glow: 10, alpha: vAnti })
      const Fa = F(GA)
      const Fb = F(GB)
      const reveal = easeInOutCubic(ph)

      left.vline(GA, { color: C.dim, width: 1, dash: [4, 5], alpha: 0.6 * vAnti })
      left.vline(GB, { color: C.dim, width: 1, dash: [4, 5], alpha: 0.6 * vAnti })
      left.point(GA, Fa, { color: C.gold, label: '(a, F(a))', labelDx: -70, labelDy: 16 })
      left.point(GB, Fa + (Fb - Fa) * reveal, {
        color: C.coral, halo: true, label: '(b, F(b))', labelDx: 8, labelDy: -10,
      })

      // the "jump" bracket F(b) − F(a)
      const bx2 = left.rect.x + left.rect.w - 46
      const yA = left.sy(Fa)
      const yB = left.sy(Fa + (Fb - Fa) * reveal)
      ctx.save()
      ctx.globalAlpha = vAnti * 0.9
      ctx.strokeStyle = C.gold
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(bx2 - 6, yA)
      ctx.lineTo(bx2 + 6, yA)
      ctx.moveTo(bx2, yA)
      ctx.lineTo(bx2, yB)
      ctx.moveTo(bx2 - 6, yB)
      ctx.lineTo(bx2 + 6, yB)
      ctx.stroke()
      ctx.fillStyle = C.gold
      ctx.font = `600 12px ${MONO}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`F(b) − F(a) = ${(Fb - Fa).toFixed(3)}`, bx2 - 168, (yA + yB) / 2)
      ctx.restore()

      left.text(left.rect.x + 10, left.rect.y + 24, 'y = A(x) = F(x) — nguyên hàm', {
        color: C.mint, size: 12, mono: true,
      })
      left.hud(
        'tr',
        [
          'F(x) = x − 0.75cos(1.2x) + x²/10',
          `F(b) − F(a) = ${(Fb - Fa).toFixed(3)}`,
          `∫ₐᵇ f(x)dx  = ${(Fb - Fa).toFixed(3)} ✓`,
        ],
        { color: C.mint, width: 252 },
      )
    }

    /* ---------------- steps 4–5: accumulation + FTC ---------------- */
    if (split > 0.02) {
      const al = clamp(split * 1.6 - 0.15)
      const xs = lerp(X0 + 0.03, X1 - 0.03, easeInOutSine(ph))

      left.curve(f, { color: C.curve, width: 3, glow: 12, alpha: al })
      left.areaUnder(f, X0, xs, { fill: C.teal, alpha: 0.26 * al })
      left.vline(xs, { color: C.gold, width: 1.5, dash: [5, 5], alpha: al })
      left.point(xs, f(xs), { color: C.gold })

      right.grid()
      right.axes('x', 'y = A(x)')
      if (xs > X0) {
        const n = 90
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= n; i++) {
          const x = X0 + ((xs - X0) * i) / n
          pts.push([x, F(x)])
        }
        right.polyline(pts, { color: C.mint, width: 3, glow: 10, alpha: al })
      }
      right.point(xs, F(xs), { color: C.mint, halo: true })

      left.hud('bl', [`x     = ${xs.toFixed(2)}`, `f(x)  = ${f(xs).toFixed(2)}`], {
        color: C.ink, width: 148,
      })
      right.hud('tr', [`A(x) = ${F(xs).toFixed(2)}`], { color: C.mint, width: 132 })

      if (v04 > 0.03) {
        const t4 = v04 * al
        right.ray(xs, F(xs), f(xs), { color: C.gold, width: 2, glow: 8, alpha: t4 })
        left.hline(f(xs), { color: C.gold, width: 1.5, dash: [4, 5], alpha: t4 })
        right.hud(
          'bl',
          [`độ dốc A tại x = ${f(xs).toFixed(2)}`, `        = f(x) ✓`],
          { color: C.gold, width: 200 },
        )
      }
    }
  }

  return (
    <>
      <SceneCanvas draw={draw} />
      {step === 2 && (
        <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1 rounded-full border border-edge bg-bg/85 p-1 backdrop-blur md:top-4">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`rounded-full px-3 py-1 text-[11.5px] font-semibold transition-colors ${
                method === m.id ? 'bg-teal/20 text-teal' : 'text-dim hover:text-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

/* ---------- helpers ---------- */

interface Dom {
  x: [number, number]
  y: [number, number]
}
function blendDom(a: Dom, b: Dom, t: number): Dom {
  return {
    x: [lerp(a.x[0], b.x[0], t), lerp(a.x[1], b.x[1], t)],
    y: [lerp(a.y[0], b.y[0], t), lerp(a.y[1], b.y[1], t)],
  }
}

/** the road + car whose position equals accumulated distance */
function drawCarStrip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frac: number,
  speed: number,
  alpha: number,
) {
  if (alpha < 0.02 || h < 20) return
  const roadY = y + h * 0.72
  ctx.save()
  ctx.globalAlpha = alpha

  // road
  ctx.strokeStyle = C.axis
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, roadY)
  ctx.lineTo(x + w, roadY)
  ctx.stroke()
  // distance ticks
  ctx.strokeStyle = C.faint
  ctx.lineWidth = 1
  ctx.setLineDash([2, 6])
  ctx.beginPath()
  for (let i = 0; i <= 10; i++) {
    const tx = x + (w * i) / 10
    ctx.moveTo(tx, roadY - 5)
    ctx.lineTo(tx, roadY + 5)
  }
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = C.faint
  ctx.font = `500 10px ${MONO}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText('0 m', x, roadY - 8)
  ctx.textAlign = 'right'
  ctx.fillText(`${(F_MAX).toFixed(0)} m`, x + w, roadY - 8)

  // car position from accumulated distance
  const carX = x + 26 + frac * (w - 80)
  const carY = roadY - 12

  // speed streaks
  if (speed > 1.6) {
    ctx.strokeStyle = C.dim
    ctx.globalAlpha = alpha * 0.5
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i < 3; i++) {
      const sy = carY - 2 + i * 5
      ctx.moveTo(carX - 26 - i * 7, sy)
      ctx.lineTo(carX - 12 - i * 7, sy)
    }
    ctx.stroke()
    ctx.globalAlpha = alpha
  }

  // body
  ctx.fillStyle = C.gold
  roundRectPath(ctx, carX - 22, carY - 6, 44, 13, 4)
  ctx.fill()
  // cabin
  roundRectPath(ctx, carX - 12, carY - 13, 20, 9, 3)
  ctx.fill()
  // window
  ctx.fillStyle = C.bg
  roundRectPath(ctx, carX - 9, carY - 11, 6, 5, 1)
  ctx.fill()
  roundRectPath(ctx, carX - 1, carY - 11, 6, 5, 1)
  ctx.fill()
  // wheels
  ctx.fillStyle = C.bg
  ctx.strokeStyle = C.gold
  ctx.lineWidth = 2
  for (const wx of [carX - 13, carX + 13]) {
    ctx.beginPath()
    ctx.arc(wx, carY + 8, 4.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
  ctx.restore()
}
