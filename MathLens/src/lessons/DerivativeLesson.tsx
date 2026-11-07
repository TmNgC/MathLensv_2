import { useRef } from 'react'
import type { SceneProps } from '../content/types'
import { useLessonClock } from '../components/LessonShell'
import { SceneCanvas } from '../components/SceneCanvas'
import { PlaneView } from '../engine/PlaneView'
import type { Stage } from '../engine/Stage'
import { C } from '../engine/palette'
import { clamp, easeInOutCubic, easeInOutSine, lerp } from '../engine/easing'

/**
 * Bài "Đạo hàm" — flagship scene.
 *
 * Steps 0–2: parabola $f(x)=x^2/4$ — draggable A/B, secant → tangent
 * morph driven by the playhead, live Δx/Δy HUD.
 * Steps 3–4: smooth domain morph to the cubic $f(x)=x^3/8-x+3/2$ and
 * the viewport splits in two: f with sweeping tangent (left) and the
 * derivative f′ being traced with sign coloring (right).
 */
export function DerivativeScene({ step }: SceneProps) {
  const { playheadRef } = useLessonClock()
  const A = useRef(1.6)
  const B = useRef(3.4)

  const draw = (st: Stage) => {
    const ph = playheadRef.current
    const W = st.width
    const H = st.height

    // transition parabola → cubic / single → dual viewport
    const t = st.smooth('switch', step >= 3 ? 1 : 0, 5)
    const v01 = st.smooth('v01', step <= 1 ? 1 : 0, 6) // secant era
    const v2 = st.smooth('v2', step === 2 ? 1 : 0, 6) // tangent era
    const v4 = st.smooth('v4', step === 4 ? 1 : 0, 6) // extrema layer

    const full = { x: 14, y: 10, w: W - 28, h: H - 20 }
    const leftW = full.w * lerp(1, 0.55, t)
    const gap = 16
    const leftRect = { x: full.x, y: full.y, w: leftW, h: full.h }
    const rightRect = { x: full.x + leftW + gap, y: full.y, w: full.w - leftW - gap, h: full.h }

    const d1 = { x: [-1, 4.7], y: [-0.9, 5.7] } as const
    const d2 = { x: [-3.8, 3.8], y: [-3.3, 4.7] } as const
    const Ld = {
      x: [lerp(d1.x[0], d2.x[0], t), lerp(d1.x[1], d2.x[1], t)],
      y: [lerp(d1.y[0], d2.y[0], t), lerp(d1.y[1], d2.y[1], t)],
    } as { x: [number, number]; y: [number, number] }

    const left = new PlaneView(st, leftRect, Ld)
    const right = new PlaneView(st, rightRect, d2 as { x: [number, number]; y: [number, number] })

    const f1 = (x: number) => (x * x) / 4
    const f1p = (x: number) => x / 2
    const f2 = (x: number) => (x * x * x) / 8 - x + 1.5
    const f2p = (x: number) => (3 * x * x) / 8 - 1

    left.grid()
    left.axes('x', 'y = f(x)')

    /* ---------------- parabola era (steps 0–2) ---------------- */
    const a1 = clamp(1 - t * 1.8)
    if (a1 > 0.02) {
      left.curve(f1, { color: C.curve, width: 3, glow: 12, alpha: a1 })

      const ax = clamp(A.current, 0.4, 4.3)
      let bx: number
      if (step === 0) bx = clamp(B.current, ax + 0.12, 4.5)
      else if (step === 1) bx = ax + lerp(1.9, 0.0015, easeInOutCubic(ph))
      else bx = ax + 0.0015
      const ay = f1(ax)
      const by = f1(bx)
      const slope = (by - ay) / (bx - ax)

      // secant / tangent line (same geometry — crossfading styles)
      left.ray(ax, ay, slope, { color: C.violet, width: 2, dash: [8, 7], alpha: v01 * a1 })
      left.ray(ax, ay, slope, { color: C.gold, width: 2.5, glow: 9, alpha: v2 * a1 })

      // rise/run triangle
      if (v01 > 0.03) {
        const ta = 0.85 * v01 * a1
        left.segment([ax, ay], [bx, ay], { color: C.teal, width: 1.5, dash: [4, 4], alpha: ta })
        left.segment([bx, ay], [bx, by], { color: C.teal, width: 1.5, dash: [4, 4], alpha: ta })
        left.text(left.sx((ax + bx) / 2), left.sy(ay) + 18, `Δx = ${(bx - ax).toFixed(2)}`, {
          color: C.teal, size: 12, mono: true, align: 'center',
        })
        left.text(left.sx(bx) + 8, left.sy((ay + by) / 2), `Δy = ${(by - ay).toFixed(2)}`, {
          color: C.teal, size: 12, mono: true,
        })
      }

      left.point(ax, ay, { color: C.gold, halo: v2 > 0.5, label: 'A', labelDx: -24, labelDy: 12 })
      if (v01 > 0.03) left.point(bx, by, { color: C.coral, label: 'B' })

      // drag affordances
      if (step === 0 && t < 0.3) {
        // pulsing ring around B invites dragging
        const ctx = st.ctx!
        const pulse = 0.55 + 0.45 * Math.sin(st.time * 3)
        ctx.save()
        ctx.globalAlpha = pulse * a1
        ctx.strokeStyle = C.coral
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(left.sx(bx), left.sy(by), 13, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
        left.text(left.sx(bx) + 16, left.sy(by) - 14, 'kéo B ↔', {
          color: C.coral, size: 12, mono: true, weight: 600,
        })
        left.draggablePoint(ax, ay, (mx) => {
          A.current = clamp(mx, 0.4, 4.3)
        })
        left.draggablePoint(bx, by, (mx) => {
          B.current = clamp(mx, A.current + 0.12, 4.5)
        })
      }
      if (step === 2 && t < 0.3) {
        left.draggablePoint(ax, ay, (mx) => {
          A.current = clamp(mx, 0.4, 4.3)
        })
      }

      if (t < 0.3) {
        if (step <= 1) {
          left.hud('tr', [
            `Δx    = ${(bx - ax).toFixed(3)}`,
            `Δy    = ${(by - ay).toFixed(3)}`,
            `Δy/Δx = ${slope.toFixed(3)}`,
          ], { color: C.violet, width: 172 })
        } else {
          left.hud('tr', [
            `a    = ${ax.toFixed(2)}`,
            `f′(a) = ${f1p(ax).toFixed(3)}`,
          ], { color: C.gold, width: 150 })
        }
      }
    }

    /* ---------------- cubic era (steps 3–4) ---------------- */
    const a2 = clamp(t * 1.8 - 0.15)
    if (a2 > 0.02) {
      left.curve(f2, { color: C.curve, width: 3, glow: 12, alpha: a2 })

      const margin = 0.35
      const xs = lerp(d2.x[0] + margin, d2.x[1] - margin, easeInOutSine(ph))
      const ys = f2(xs)
      const m = f2p(xs)

      // sweeping tangent
      left.ray(xs, ys, m, { color: C.gold, width: 2, glow: 8, alpha: 0.9 * a2 })
      left.point(xs, ys, { color: C.gold, halo: true })

      const xe = Math.sqrt(8 / 3) // where f′ = 0

      // monotonicity coloring over the blue curve
      if (v4 > 0.03) {
        const ta = a2 * v4
        segCurve(left, f2, d2.x[0], -xe, { color: C.mint, width: 3, glow: 10, alpha: 0.95 * ta })
        segCurve(left, f2, -xe, xe, { color: C.coral, width: 3, alpha: 0.95 * ta })
        segCurve(left, f2, xe, d2.x[1], { color: C.mint, width: 3, glow: 10, alpha: 0.95 * ta })
        // extrema markers
        left.vline(-xe, { color: C.gold, width: 1, dash: [5, 6], alpha: 0.5 * ta })
        left.vline(xe, { color: C.gold, width: 1, dash: [5, 6], alpha: 0.5 * ta })
        left.point(-xe, f2(-xe), { color: C.gold, r: 6 })
        left.point(xe, f2(xe), { color: C.gold, r: 6 })
        left.text(left.sx(-xe) - 6, left.sy(f2(-xe)) - 16, 'cực đại', {
          color: C.gold, size: 12, mono: true, align: 'right', bg: `${C.bg}e6`,
        })
        left.text(left.sx(xe) + 6, left.sy(f2(xe)) - 16, 'cực tiểu', {
          color: C.gold, size: 12, mono: true, bg: `${C.bg}e6`,
        })
      }

      left.hud('bl', [`x   = ${xs.toFixed(2)}`, `f(x) = ${ys.toFixed(2)}`], {
        color: C.ink, width: 132,
      })

      // right viewport: the derivative being traced
      right.grid()
      right.axes('x', 'y = f′(x)')
      right.hline(0, { color: C.axis, width: 1.5, alpha: a2 })

      // partial f′ curve revealed up to xs, colored by sign
      if (xs > d2.x[0]) {
        segCurve(right, f2p, d2.x[0], Math.min(xs, -xe), { color: C.mint, width: 3, glow: 10, alpha: a2 })
        if (xs > -xe) segCurve(right, f2p, -xe, Math.min(xs, xe), { color: C.coral, width: 3, alpha: a2 })
        if (xs > xe) segCurve(right, f2p, xe, xs, { color: C.mint, width: 3, glow: 10, alpha: a2 })
      }
      right.point(xs, m, { color: m >= 0 ? C.mint : C.coral, halo: true })

      if (v4 > 0.03) {
        right.point(-xe, 0, { color: C.gold, r: 5 })
        right.point(xe, 0, { color: C.gold, r: 5 })
        right.text(right.sx(-xe), right.sy(0) - 16, 'f′ = 0', {
          color: C.gold, size: 12, mono: true, align: 'center', bg: `${C.bg}e6`,
        })
        right.text(right.sx(xe), right.sy(0) - 16, 'f′ = 0', {
          color: C.gold, size: 12, mono: true, align: 'center', bg: `${C.bg}e6`,
        })
      }

      right.hud('tr', [
        `f′(x) = ${m.toFixed(2)}`,
        m >= 0 ? 'f đi lên ↑' : 'f đi xuống ↓',
      ], { color: m >= 0 ? C.mint : C.coral, width: 140 })
    }
  }

  return <SceneCanvas draw={draw} />
}

/** sample fn over [x0,x1] and stroke as polyline */
function segCurve(
  p: PlaneView,
  fn: (x: number) => number,
  x0: number,
  x1: number,
  opts: { color?: string; width?: number; alpha?: number; glow?: number },
) {
  if (x1 <= x0) return
  const n = 64
  const pts: Array<[number, number]> = []
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n
    pts.push([x, fn(x)])
  }
  p.polyline(pts, opts)
}
