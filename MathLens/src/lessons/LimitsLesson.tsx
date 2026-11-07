import type { SceneProps } from '../content/types'
import { useLessonClock } from '../components/LessonShell'
import { SceneCanvas } from '../components/SceneCanvas'
import { PlaneView, drawHud } from '../engine/PlaneView'
import type { Stage } from '../engine/Stage'
import { C, MONO } from '../engine/palette'
import { easeInOutCubic, easeInOutSine, lerp } from '../engine/easing'

const BAR_COLORS = [C.curve, C.teal, C.mint, C.gold, C.violet]

/**
 * Bài "Giới hạn" — the convergence story salvaged from MathLens 1:
 * 0 — Zeno square-filling (partial sums ½+¼+⅛+…)
 * 1 — auto-zoom camera into the vanishing gap (up to ×2^17)
 * 2 — limit of a function: f(x)=(x²−1)/(x−1) approaching from both sides
 * 3 — the ε band shrinking while the dots stay inside
 * 4 — recap: derivative & integral are both limits (dual mini scenes)
 */
export function LimitsScene({ step }: SceneProps) {
  const { playheadRef } = useLessonClock()

  const draw = (st: Stage) => {
    const ph = playheadRef.current
    const W = st.width
    const H = st.height
    const ctx = st.ctx!

    // era visibilities
    const vSq = st.smooth('vSq', step === 0 ? 1 : 0, 6)
    const vNL = st.smooth('vNL', step === 1 ? 1 : 0, 6)
    const vFn = st.smooth('vFn', step === 2 || step === 3 ? 1 : 0, 6)
    const vLB = st.smooth('vLB', step === 4 ? 1 : 0, 6)
    const vEU = st.smooth('vEU', step === 5 ? 1 : 0, 6)
    const vHG = st.smooth('vHG', step === 6 ? 1 : 0, 6)
    const vRc = st.smooth('vRc', step === 7 ? 1 : 0, 6)
    const vEps = st.smooth('vEps', step === 3 ? 1 : 0, 6)

    /* ---------------- Zeno square (step 0) ---------------- */
    if (vSq > 0.02) {
      const n = Math.max(1, Math.round(lerp(1, 12, easeInOutSine(ph))))
      const gap = Math.pow(2, -n)

      const size = Math.min(W * 0.52, H * 0.72)
      const cx = W / 2
      const cy = H / 2 - 14
      const x0 = cx - size / 2
      const y0 = cy - size / 2

      ctx.save()
      ctx.globalAlpha = vSq

      // bars: bar j occupies [1-2^-(j-1), 1-2^-j]
      for (let j = 1; j <= n; j++) {
        const bx = x0 + (1 - Math.pow(2, -(j - 1))) * size
        const bw = Math.pow(2, -j) * size
        ctx.fillStyle = BAR_COLORS[(j - 1) % BAR_COLORS.length]
        ctx.globalAlpha = vSq * 0.82
        ctx.fillRect(bx, y0, bw, size)
        ctx.globalAlpha = vSq
        ctx.strokeStyle = C.bg
        ctx.lineWidth = 1.5
        ctx.strokeRect(bx, y0, bw, size)
      }

      // the remaining gap, pulsing coral outline
      const pulse = 0.6 + 0.4 * Math.sin(st.time * 4)
      ctx.globalAlpha = vSq * pulse
      ctx.strokeStyle = C.coral
      ctx.lineWidth = 2
      ctx.strokeRect(x0 + (1 - gap) * size, y0, Math.max(gap * size, 2), size)
      ctx.globalAlpha = vSq

      // width labels for the first bars
      ctx.font = `600 13px ${MONO}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillStyle = C.dim
      const nLabels = Math.min(n, 6)
      for (let j = 1; j <= nLabels; j++) {
        const bx = x0 + (1 - Math.pow(2, -(j - 1))) * size
        const bw = Math.pow(2, -j) * size
        ctx.fillText(`1/${Math.pow(2, j)}`, bx + bw / 2, y0 - 8)
      }

      // axis ticks 0 and 1 below the square
      ctx.font = `600 13px ${MONO}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = C.faint
      ctx.fillText('0', x0, y0 + size + 10)
      ctx.fillText('1', x0 + size, y0 + size + 10)
      ctx.restore()

      const sn = 1 - gap
      drawHud(
        ctx,
        W - 218,
        14,
        200,
        [`n      = ${n}`, `Sₙ     = ${sn.toFixed(6)}`, `1 − Sₙ = ${gap.toFixed(6)}`],
        C.curve,
      )
    }

    /* ---------------- number line: Sₙ → 1 (step 1) ---------------- */
    if (vNL > 0.02) {
      const a = vNL
      const p = new PlaneView(
        st,
        { x: W * 0.07, y: H * 0.16, w: W * 0.86, h: H * 0.68 },
        { x: [0.42, 1.1], y: [-1.35, 1.35] },
      )

      // the number line itself
      p.hline(0, { color: C.axis, width: 2, alpha: a })
      const ctx2 = st.ctx!
      ctx2.save()
      ctx2.globalAlpha = a
      for (const t of [0.5, 0.75, 1.0]) {
        ctx2.strokeStyle = C.axis
        ctx2.lineWidth = t === 1 ? 0 : 1.2
        ctx2.beginPath()
        ctx2.moveTo(p.sx(t), p.sy(0) - 4)
        ctx2.lineTo(p.sx(t), p.sy(0) + 4)
        if (t !== 1) {
          ctx2.stroke()
          ctx2.font = `500 11px ${MONO}`
          ctx2.fillStyle = C.faint
          ctx2.textAlign = 'center'
          ctx2.textBaseline = 'top'
          ctx2.fillText(String(t), p.sx(t), p.sy(0) + 8)
        }
      }
      ctx2.restore()

      // the limit marker L = 1
      p.vline(1, { color: C.gold, width: 2.5, alpha: a, glow: 10 })
      p.point(1, 0, { color: C.gold, r: 6, halo: true })
      p.text(p.sx(1) - 8, p.sy(-0.72), 'giới hạn L = 1', {
        color: C.gold, size: 13, mono: true, align: 'right', weight: 600,
      })

      // partial sums marching in
      const N = Math.max(1, Math.round(lerp(1, 18, easeInOutSine(ph))))
      const sn = 1 - Math.pow(2, -N)
      const from = Math.max(1, N - 7)
      for (let k = from; k <= N; k++) {
        const sk = 1 - Math.pow(2, -k)
        const fade = 0.25 + 0.75 * ((k - from) / Math.max(1, N - from))
        p.point(sk, 0, { color: C.mint, r: 3.5 })
        ctx2.save()
        ctx2.globalAlpha = a * fade * 0.9
        ctx2.font = `600 10.5px ${MONO}`
        ctx2.textAlign = 'center'
        ctx2.textBaseline = k % 2 === 0 ? 'bottom' : 'top'
        ctx2.fillStyle = C.dim
        ctx2.fillText(`S${k}`, p.sx(sk), p.sy(0) + (k % 2 === 0 ? -10 : 10))
        ctx2.restore()
      }
      p.point(sn, 0, { color: C.mint, r: 6, halo: true })

      // coral bracket for the remaining gap
      const gy = 0.62
      p.segment([sn, gy], [1, gy], { color: C.coral, width: 1.8, alpha: a })
      p.segment([sn, gy - 0.07], [sn, gy + 0.07], { color: C.coral, width: 1.8, alpha: a })
      p.segment([1, gy - 0.07], [1, gy + 0.07], { color: C.coral, width: 1.8, alpha: a })
      p.text(p.sx((sn + 1) / 2), p.sy(gy) - 10, `còn thiếu 2⁻ⁿ = ${Math.pow(2, -N).toExponential(2)}`, {
        color: C.coral, size: 12.5, mono: true, align: 'center', weight: 600,
      })

      p.hud(
        'tr',
        [`n  = ${N}`, `Sₙ = ${sn.toFixed(9)}`, `1 − Sₙ = ${Math.pow(2, -N).toExponential(3)}`],
        { color: C.mint, width: 200 },
      )
      p.text(p.rect.x + 8, p.rect.y - 2, 'Sₙ = ½ + ¼ + ⅛ + … + 1/2ⁿ', {
        color: C.dim, size: 13, mono: true,
      })
    }

    /* ---------------- function limit (steps 2–3) ---------------- */
    if (vFn > 0.02) {
      const a = vFn
      const p = new PlaneView(
        st,
        { x: W * 0.08, y: 10, w: W * 0.84, h: H - 20 },
        { x: [-1.6, 3.6], y: [-0.6, 4.6] },
      )
      p.grid()
      p.axes('x', 'y')
      const g = (x: number) => x + 1

      // ε band around L=2
      if (vEps > 0.03) {
        const eps = lerp(0.45, 0.04, easeInOutSine(ph))
        const ctx2 = st.ctx!
        ctx2.save()
        ctx2.globalAlpha = vEps * a * 0.13
        ctx2.fillStyle = C.gold
        ctx2.fillRect(p.rect.x, p.sy(2 + eps), p.rect.w, p.sy(2 - eps) - p.sy(2 + eps))
        ctx2.restore()
        p.hline(2 + eps, { color: C.gold, width: 1, dash: [4, 5], alpha: vEps * a * 0.8 })
        p.hline(2 - eps, { color: C.gold, width: 1, dash: [4, 5], alpha: vEps * a * 0.8 })
        p.text(p.rect.x + 10, p.sy(2 + eps) - 6, `L + ε  (ε = ${eps.toFixed(3)})`, {
          color: C.gold, size: 12, mono: true,
        })
        p.text(p.rect.x + 10, p.sy(2 - eps) + 16, `L − ε`, {
          color: C.gold, size: 12, mono: true,
        })
      }

      // the line y = x+1 with a hole at x = 1
      p.curve((x) => (Math.abs(x - 1) < 0.001 ? NaN : g(x)), {
        color: C.curve, width: 3, glow: 12, alpha: a,
      })
      // hole marker
      p.point(1, 2, { color: C.bg, r: 6 })
      st.ctx!.save()
      st.ctx!.globalAlpha = a
      st.ctx!.strokeStyle = C.coral
      st.ctx!.lineWidth = 2
      st.ctx!.beginPath()
      st.ctx!.arc(p.sx(1), p.sy(2), 6, 0, Math.PI * 2)
      st.ctx!.stroke()
      st.ctx!.restore()

      // two dots approaching from both sides
      const d = lerp(0.9, 0.015, easeInOutCubic(ph))
      const xl = 1 - d
      const xr = 1 + d
      p.point(xl, g(xl), { color: C.mint, halo: true })
      p.point(xr, g(xr), { color: C.violet, halo: true })
      p.vline(xl, { color: C.mint, width: 1, dash: [3, 5], alpha: 0.5 * a })
      p.vline(xr, { color: C.violet, width: 1, dash: [3, 5], alpha: 0.5 * a })

      p.hud(
        'tr',
        [
          `x trái  = ${xl.toFixed(4)} → f = ${g(xl).toFixed(4)}`,
          `x phải = ${xr.toFixed(4)} → f = ${g(xr).toFixed(4)}`,
          `lim x→1 f(x) = 2`,
        ],
        { color: C.ink, width: 235 },
      )

      p.text(p.sx(1) + 12, p.sy(2) - 14, 'khoảng trống tại x = 1', {
        color: C.coral, size: 12, mono: true, bg: `${C.bg}e6`,
      })
    }

    /* ---------------- Leibniz π (step 4) ---------------- */
    if (vLB > 0.02) {
      const a = vLB
      const p = new PlaneView(st, { x: W * 0.08, y: 10, w: W * 0.84, h: H - 20 }, {
        x: [-1, 41],
        y: [-0.06, 1.16],
      })
      p.grid()
      p.axes('n', 'Sₙ')
      const target = Math.PI / 4
      p.hline(target, { color: C.gold, width: 2, glow: 8, alpha: a })
      p.text(p.rect.x + 10, p.sy(target) - 9, 'π/4 ≈ 0.7854', {
        color: C.gold, size: 12.5, mono: true, weight: 600,
      })

      const N = Math.max(2, Math.round(lerp(2, 40, easeInOutSine(ph))))
      let s = 0
      const pts: Array<[number, number]> = []
      const dots: Array<[number, number]> = []
      for (let k = 1; k <= N; k++) {
        s += (k % 2 === 1 ? 1 : -1) / (2 * k - 1)
        pts.push([k, s])
        if (k <= 3 || k % 5 === 0 || k === N) dots.push([k, s])
      }
      p.polyline(pts, { color: C.dim, width: 1.5, alpha: 0.45 * a })
      for (const [kx, ky] of dots) {
        const side = ky >= target
        p.point(kx, ky, { color: side ? C.mint : C.coral, r: 4 })
      }
      p.point(N, s, { color: s >= target ? C.mint : C.coral, r: 6, halo: true })

      p.text(p.sx(6), p.sy(1.02), 'Sₙ = 1 − 1/3 + 1/5 − 1/7 + …', {
        color: C.dim, size: 12.5, mono: true,
      })
      p.hud(
        'tr',
        [`n     = ${N}`, `Sₙ    = ${s.toFixed(6)}`, `sai số = ${Math.abs(s - target).toExponential(2)}`],
        { color: C.curve, width: 190 },
      )
    }

    /* ---------------- Euler e (step 5) ---------------- */
    if (vEU > 0.02) {
      const a = vEU
      const ctx2 = st.ctx!
      const p = new PlaneView(st, { x: W * 0.08, y: 10, w: W * 0.84, h: H - 20 }, {
        x: [0.3, 7.7],
        y: [0, 3.1],
      })
      p.grid()
      p.axes()
      p.hline(Math.E, { color: C.gold, width: 2, glow: 8, alpha: a })
      p.text(p.rect.x + 10, p.sy(Math.E) - 9, 'e ≈ 2.71828 — không thể vượt qua', {
        color: C.gold, size: 12.5, mono: true, weight: 600,
      })

      const ns = [1, 2, 4, 12, 52, 365, 8760]
      const vals = ns.map((n) => Math.pow(1 + 1 / n, n))
      const reveal = easeInOutSine(ph) * ns.length

      ctx2.save()
      ctx2.globalAlpha = a
      const baseY = p.sy(0)
      for (let i = 0; i < ns.length; i++) {
        const grown = Math.min(1, Math.max(0, reveal - i))
        if (grown <= 0) continue
        const h = vals[i] * grown
        const bx = p.sx(i + 1) - 26
        const bw = 52
        const bh = baseY - p.sy(h)
        ctx2.fillStyle = `${C.teal}55`
        ctx2.strokeStyle = C.teal
        ctx2.lineWidth = 1.5
        ctx2.beginPath()
        ctx2.rect(bx, baseY - bh, bw, bh)
        ctx2.fill()
        ctx2.stroke()
        // value on top
        ctx2.font = `600 12px ${MONO}`
        ctx2.textAlign = 'center'
        ctx2.textBaseline = 'bottom'
        ctx2.fillStyle = C.ink
        ctx2.fillText(vals[i].toFixed(grown < 1 ? 3 : 4), bx + bw / 2, baseY - bh - 6)
        // n label under the bar
        ctx2.font = `500 11px ${MONO}`
        ctx2.fillStyle = C.faint
        ctx2.textBaseline = 'top'
        ctx2.fillText(String(ns[i]), bx + bw / 2, baseY + 7)
      }
      ctx2.textAlign = 'left'
      ctx2.fillStyle = C.dim
      ctx2.font = `500 11.5px ${MONO}`
      ctx2.textBaseline = 'top'
      ctx2.fillText('số kỳ trả lãi n →', p.sx(1) - 26, baseY + 24)
      ctx2.restore()

      const cur = Math.min(ns.length - 1, Math.floor(reveal))
      p.hud(
        'tr',
        [
          `n = ${ns[cur].toLocaleString('vi')}`,
          `(1 + 1/n)ⁿ = ${vals[cur].toFixed(5)}`,
          `còn cách e: ${(Math.E - vals[cur]).toFixed(5)}`,
        ],
        { color: C.teal, width: 205 },
      )
    }

    /* ---------------- Harmonic vs geometric (step 6) ---------------- */
    if (vHG > 0.02) {
      const a = vHG
      const p = new PlaneView(st, { x: W * 0.1, y: 10, w: W * 0.82, h: H - 20 }, {
        x: [0, 125],
        y: [-0.35, 6.4],
      })
      p.grid()
      p.axes('n', 'Sₙ')

      p.hline(2, { color: C.gold, width: 1.5, dash: [5, 5], alpha: 0.7 * a })
      p.text(p.rect.x + 10, p.sy(2) - 9, 'geometric → 2', {
        color: C.gold, size: 12, mono: true,
      })

      const N = Math.max(2, Math.round(lerp(2, 120, easeInOutSine(ph))))
      const Hpts: Array<[number, number]> = []
      const Gpts: Array<[number, number]> = []
      let h = 0
      let g = 0
      for (let k = 1; k <= N; k++) {
        h += 1 / k
        g += 1 / Math.pow(2, k - 1)
        if (k % 2 === 0 || k === N || k <= 4) {
          Hpts.push([k, h])
          Gpts.push([k, g])
        }
      }
      p.polyline(Gpts, { color: C.mint, width: 2.5, alpha: a })
      p.polyline(Hpts, { color: C.coral, width: 2.5, alpha: a, glow: 8 })
      p.point(N, g, { color: C.mint })
      p.point(N, h, { color: C.coral, halo: true })

      p.text(p.sx(N) - 12, p.sy(h) - 14, `Hₙ = ${h.toFixed(2)}  ↑∞`, {
        color: C.coral, size: 12.5, mono: true, align: 'right', weight: 600,
        bg: `${C.bg}e6`,
      })
      p.text(p.sx(N) - 12, p.sy(2) + 14, `Gₙ = ${g.toFixed(3)}`, {
        color: C.mint, size: 12.5, mono: true, align: 'right', weight: 600,
        bg: `${C.bg}e6`,
      })
      p.text(p.sx(70), p.sy(4.6), 'harmonic: chậm mà không dừng', {
        color: C.coral, size: 12, mono: true,
      })
      p.hud('tr', [`n  = ${N}`, `Hₙ = ${h.toFixed(3)}`, `Gₙ = ${g.toFixed(3)}`], {
        color: C.ink, width: 165,
      })
    }

    /* ---------------- recap (step 7) ---------------- */
    if (vRc > 0.02) {
      const a = vRc
      const half = (W - 30) / 2
      const p1 = new PlaneView(st, { x: 14, y: 10, w: half, h: H - 20 }, {
        x: [-0.8, 4.6],
        y: [-0.9, 5.7],
      })
      const p2 = new PlaneView(st, { x: 14 + half + 16, y: 10, w: half, h: H - 20 }, {
        x: [-0.4, 6.4],
        y: [-0.55, 3.8],
      })

      // left: h → 0 (derivative)
      p1.grid()
      p1.axes('x', 'y')
      const f1 = (x: number) => (x * x) / 4
      p1.curve(f1, { color: C.curve, width: 3, glow: 12, alpha: a })
      const axv = 1.6
      const h = lerp(1.9, 0.02, easeInOutCubic(ph))
      const slope = (f1(axv + h) - f1(axv)) / h
      p1.ray(axv, f1(axv), slope, { color: C.violet, width: 2, dash: [8, 7], alpha: a })
      p1.point(axv, f1(axv), { color: C.gold })
      p1.point(axv + h, f1(axv + h), { color: C.coral })
      p1.hud('tr', [`Δx = ${h.toFixed(3)}`, `độ dốc = ${slope.toFixed(3)}`], {
        color: C.violet, width: 170,
      })
      p1.text(p1.rect.x + 10, p1.rect.y + p1.rect.h - 16, 'Δx → 0 ⇒ đạo hàm', {
        color: C.dim, size: 12, mono: true,
      })

      // right: n → ∞ (integral)
      p2.grid()
      p2.axes('x', 'y')
      const f2 = (x: number) => 1 + 0.9 * Math.sin(1.2 * x) + x / 5
      p2.curve(f2, { color: C.curve, width: 3, glow: 12, alpha: a })
      const n = Math.round(Math.exp(lerp(Math.log(2), Math.log(120), easeInOutSine(ph))))
      p2.riemann(f2, 1, 5, n, 'midpoint', {
        fill: C.teal, alpha: 0.3, stroke: C.teal, strokeAlpha: 0.5,
      })
      p2.hud('tr', [`n = ${n}`, `Δx → 0 ⇒ tích phân`], { color: C.teal, width: 190 })
    }
  }

  return <SceneCanvas draw={draw} />
}
