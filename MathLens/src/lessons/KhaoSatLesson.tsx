import type { SceneProps } from '../content/types'
import { useLessonClock } from '../components/LessonShell'
import { SceneCanvas } from '../components/SceneCanvas'
import { PlaneView, roundRectPath, type Rect } from '../engine/PlaneView'
import type { Stage } from '../engine/Stage'
import { C, MONO } from '../engine/palette'
import { clamp, easeInOutSine, lerp } from '../engine/easing'

/**
 * Bài "Khảo sát hàm số" — máy khảo sát từng lớp.
 *
 * Hàm mẫu: f(x) = x³/3 − x² − 3x + 1 với f′ = (x+1)(x−3), f″ = 2(x−1)
 * (cực đại (−1; 8/3), cực tiểu (3; −8), uốn (1; −8/3)).
 * Bước 4 chuyển sang phân thức g(x) = (2x+1)/(x−1) cho tiệm cận.
 */
const f = (x: number) => x * x * x / 3 - x * x - 3 * x + 1
const fp = (x: number) => x * x - 2 * x - 3
const fpp = (x: number) => 2 * x - 2
const XE1 = -1 // cực đại
const XE2 = 3 // cực tiểu
const XI = 1 // điểm uốn

const g = (x: number) => (2 * x + 1) / (x - 1)

const DOM_F: { x: [number, number]; y: [number, number] } = { x: [-3.6, 5.2], y: [-9.5, 6.5] }

export function KhaoSatScene({ step }: SceneProps) {
  const { playheadRef } = useLessonClock()

  const draw = (st: Stage) => {
    const ph = playheadRef.current
    const W = st.width
    const H = st.height
    const full: Rect = { x: 14, y: 12, w: W - 28, h: H - 26 }
    const w = (i: number) => st.smooth(`ks${i}`, step === i ? 1 : 0, 5)

    if (w(0) > 0.02) introEra(st, full, ph, w(0))
    if (w(1) > 0.02) signEra(st, full, ph, w(1))
    if (w(2) > 0.02) extremaEra(st, full, ph, w(2))
    if (w(3) > 0.02) concavityEra(st, full, ph, w(3))
    if (w(4) > 0.02) asymptoteEra(st, full, ph, w(4))
    if (w(5) > 0.02) tableEra(st, full, ph, w(5))
    if (w(6) > 0.02) checklistEra(st, full, w(6))
  }

  return <SceneCanvas draw={draw} />
}

/* ================= bước 0 — tư duy khảo sát ================= */

function introEra(st: Stage, full: Rect, ph: number, a: number) {
  const pv = new PlaneView(st, full, DOM_F)
  pv.grid()
  pv.axes('x', 'y')
  pv.curve(f, { color: C.curve, width: 3, glow: 12, alpha: a })

  const xs = lerp(-3, 4.6, easeInOutSine(ph))
  pv.point(xs, f(xs), { color: C.gold, halo: true, alpha: a })

  pv.text(pv.sx(0.2), pv.sy(5.6), 'y = x³/3 − x² − 3x + 1', {
    color: C.curve, size: 13, mono: true, weight: 600, alpha: a,
  })
  pv.hud('tr', [
    `x    = ${xs.toFixed(2)}`,
    `f(x) = ${f(xs).toFixed(2)}`,
  ], { color: C.gold, width: 158 })
  // the three questions
  pv.hud('bl', [
    'đi LÊN hay XUỐNG?   → f′',
    'cong về ĐÂU?        → f″',
    'chạy về ĐÂU ở vô cùng? → lim',
  ], { color: C.ink, width: 268 })
}

/* ================= bước 1 — dấu f′ ================= */

function signEra(st: Stage, full: Rect, ph: number, a: number) {
  const gap = 16
  const lw = (full.w - gap) * 0.58
  const lr: Rect = { x: full.x, y: full.y, w: lw, h: full.h }
  const rr: Rect = { x: full.x + lw + gap, y: full.y, w: full.w - lw - gap, h: full.h }
  const xs = lerp(-3.2, 4.8, easeInOutSine(ph))

  const pv = new PlaneView(st, lr, DOM_F)
  pv.grid()
  pv.axes('x', 'y')
  segCurve(pv, f, DOM_F.x[0], XE1, { color: C.mint, width: 3, glow: 10, alpha: a })
  segCurve(pv, f, XE1, XE2, { color: C.coral, width: 3, alpha: a })
  segCurve(pv, f, XE2, DOM_F.x[1], { color: C.mint, width: 3, glow: 10, alpha: a })
  pv.point(xs, f(xs), { color: C.gold, halo: true, alpha: a })
  pv.text(pv.sx(0.2), pv.sy(5.6), 'f: xanh = f′ > 0 (đi lên)', {
    color: C.mint, size: 12.5, mono: true, weight: 600, alpha: a,
  })
  pv.text(pv.sx(0.2), pv.sy(4.7), 'đỏ = f′ < 0 (đi xuống)', {
    color: C.coral, size: 12.5, mono: true, weight: 600, alpha: a,
  })
  pv.hud('bl', [`x = ${xs.toFixed(2)}`, `f đi ${fp(xs) > 0 ? 'lên ↑' : 'xuống ↓'}`], {
    color: fp(xs) > 0 ? C.mint : C.coral, width: 148,
  })

  const pd = new PlaneView(st, rr, { x: [-3.6, 5.2], y: [-5.5, 10] })
  pd.grid()
  pd.axes('x', "f′(x)")
  pd.hline(0, { color: C.axis, width: 1.5, alpha: a })
  segCurve(pd, fp, -3.6, XE1, { color: C.mint, width: 3, glow: 10, alpha: a })
  segCurve(pd, fp, XE1, XE2, { color: C.coral, width: 3, alpha: a })
  segCurve(pd, fp, XE2, 5.2, { color: C.mint, width: 3, glow: 10, alpha: a })
  pd.vline(XE1, { color: C.gold, width: 1, dash: [5, 6], alpha: 0.6 * a })
  pd.vline(XE2, { color: C.gold, width: 1, dash: [5, 6], alpha: 0.6 * a })
  pd.point(XE1, 0, { color: C.gold, r: 5, alpha: a })
  pd.point(XE2, 0, { color: C.gold, r: 5, alpha: a })
  pd.point(xs, fp(xs), { color: C.gold, halo: true, alpha: a })
  pd.text(pd.sx(-3.3), pd.sy(9.0), "f′(x) = x² − 2x − 3 = (x+1)(x−3)", {
    color: C.dim, size: 12, mono: true, weight: 600, alpha: a,
  })
  pd.hud('tr', [
    `f′(${xs.toFixed(1)}) = ${fp(xs).toFixed(2)}`,
    `dấu: ${fp(xs) > 0 ? '+' : '−'}`,
  ], { color: C.ink, width: 168 })
}

/* ================= bước 2 — cực trị ================= */

function extremaEra(st: Stage, full: Rect, ph: number, a: number) {
  const pv = new PlaneView(st, full, DOM_F)
  pv.grid()
  pv.axes('x', 'y')
  pv.curve(f, { color: C.curve, width: 3, glow: 12, alpha: a })

  const xs = lerp(-2.6, 4.2, easeInOutSine(ph))
  const m = fp(xs)
  // sweeping tangent flattens exactly at the extrema
  pv.ray(xs, f(xs), m, { color: C.gold, width: 2, glow: 9, alpha: a })
  pv.point(xs, f(xs), { color: C.gold, halo: true, alpha: a })

  // flat tangents + extrema markers
  pv.ray(XE1, f(XE1), 0, { color: C.mint, width: 2, dash: [7, 6], alpha: a })
  pv.ray(XE2, f(XE2), 0, { color: C.coral, width: 2, dash: [7, 6], alpha: a })
  pv.point(XE1, f(XE1), { color: C.mint, r: 6, halo: true, alpha: a, label: 'cực đại (−1; 8/3)' })
  pv.point(XE2, f(XE2), { color: C.coral, r: 6, halo: true, alpha: a, label: 'cực tiểu (3; −8)', labelDy: 16 })

  pv.hud('tr', [
    `f′(x) = ${m.toFixed(2)}`,
    Math.abs(m) < 0.35 ? 'f′ → 0: tiếp tuyến nằm ngang!' : 'độ dốc đang thay đổi…',
  ], { color: C.gold, width: 226 })
  pv.hud('bl', ['kiểm tra bằng f″:', `f″(−1) = ${fpp(-1)} < 0 → cực đại`, `f″(3)  = ${fpp(3)} > 0 → cực tiểu`], {
    color: C.ink, width: 250,
  })
}

/* ================= bước 3 — lồi lõm, điểm uốn ================= */

function concavityEra(st: Stage, full: Rect, ph: number, a: number) {
  const gap = 16
  const lw = (full.w - gap) * 0.58
  const lr: Rect = { x: full.x, y: full.y, w: lw, h: full.h }
  const rr: Rect = { x: full.x + lw + gap, y: full.y, w: full.w - lw - gap, h: full.h }
  const xs = lerp(-2.4, 4, easeInOutSine(ph))

  const pv = new PlaneView(st, lr, DOM_F)
  pv.grid()
  pv.axes('x', 'y')
  segCurve(pv, f, DOM_F.x[0], XI, { color: C.coral, width: 3, alpha: a })
  segCurve(pv, f, XI, DOM_F.x[1], { color: C.mint, width: 3, glow: 10, alpha: a })
  // tangent at the sweep point
  pv.ray(xs, f(xs), fp(xs), { color: C.gold, width: 2, glow: 9, alpha: a })
  pv.point(xs, f(xs), { color: C.gold, halo: true, alpha: a })
  pv.point(XI, f(XI), { color: C.violet, r: 6, halo: true, alpha: a, label: 'điểm uốn (1; −8/3)', labelDy: 18 })
  pv.text(pv.sx(0.2), pv.sy(5.6), 'đỏ = lõm (f″ < 0) · xanh = lồi (f″ > 0)', {
    color: C.dim, size: 12, mono: true, weight: 600, alpha: a,
  })
  pv.hud('tr', [
    `f″(${xs.toFixed(1)}) = ${fpp(xs).toFixed(1)}`,
    fpp(xs) > 0 ? 'đồ thị mỉm cười ☺ (lồi)' : 'đồ thị nhăn mặt ☹ (lõm)',
  ], { color: fpp(xs) > 0 ? C.mint : C.coral, width: 240 })

  const pd = new PlaneView(st, rr, { x: [-3.6, 5.2], y: [-10, 10] })
  pd.grid()
  pd.axes('x', 'f″(x)')
  pd.hline(0, { color: C.axis, width: 1.5, alpha: a })
  segCurve(pd, fpp, -3.6, XI, { color: C.coral, width: 3, alpha: a })
  segCurve(pd, fpp, XI, 5.2, { color: C.mint, width: 3, glow: 10, alpha: a })
  pd.vline(XI, { color: C.violet, width: 1, dash: [5, 6], alpha: 0.7 * a })
  pd.point(XI, 0, { color: C.violet, r: 5, halo: true, alpha: a })
  pd.point(xs, fpp(xs), { color: C.gold, halo: true, alpha: a })
  pd.text(pd.sx(-3.3), pd.sy(8.8), 'f″(x) = 2x − 2 — đổi dấu tại x = 1', {
    color: C.dim, size: 12, mono: true, weight: 600, alpha: a,
  })
}

/* ================= bước 4 — tiệm cận ================= */

function asymptoteEra(st: Stage, full: Rect, ph: number, a: number) {
  const pv = new PlaneView(st, full, { x: [-7, 9], y: [-9, 11] })
  pv.grid()
  pv.axes('x', 'y')
  // vertical & horizontal asymptotes
  pv.vline(1, { color: C.coral, width: 2, dash: [8, 6], alpha: a })
  pv.hline(2, { color: C.gold, width: 2, dash: [8, 6], alpha: a })
  // two branches
  segCurve(pv, g, -7, 0.985, { color: C.curve, width: 3, glow: 12, alpha: a })
  segCurve(pv, g, 1.015, 9, { color: C.curve, width: 3, glow: 12, alpha: a })
  // intercepts
  pv.point(0, g(0), { color: C.dim, r: 4, label: '(0; −1)', alpha: a })
  pv.point(-0.5, 0, { color: C.dim, r: 4, label: '(−½; 0)', labelDy: -12, alpha: a })

  // a probe racing toward the vertical asymptote
  const xp = lerp(8.5, 1.08, easeInOutSine(clamp(ph * 1.25)))
  const yp = g(xp)
  pv.point(xp, yp, { color: C.gold, halo: true, alpha: a })

  pv.text(pv.sx(1.35), pv.sy(10.0), 'y = (2x + 1)/(x − 1)', {
    color: C.curve, size: 13, mono: true, weight: 600, alpha: a,
  })
  pv.text(pv.sx(1) + 8, pv.sy(-6.5), 'TCĐ: x = 1', { color: C.coral, size: 12, mono: true, weight: 600, alpha: a })
  pv.text(pv.sx(6.2), pv.sy(2) - 8, 'TCN: y = 2', { color: C.gold, size: 12, mono: true, weight: 600, alpha: a })
  pv.hud('tr', [
    `x   = ${xp.toFixed(2)}`,
    `g(x) = ${yp.toFixed(2)}`,
    xp < 1.5 ? 'x → 1⁺ ⇒ g → +∞' : 'đang tiến về cận đứng…',
  ], { color: C.gold, width: 200 })
  pv.hud('bl', ['x → 1⁻ ⇒ g → −∞ (nhánh trái)', 'x → ±∞ ⇒ g → 2 (TCN)'], {
    color: C.ink, width: 252,
  })
}

/* ================= bước 5 — bảng biến thiên ================= */

function tableEra(st: Stage, full: Rect, ph: number, a: number) {
  const gap = 16
  const lw = (full.w - gap) * 0.46
  const lr: Rect = { x: full.x, y: full.y + 8, w: lw, h: full.h - 16 }
  const rr: Rect = { x: full.x + lw + gap, y: full.y, w: full.w - lw - gap, h: full.h }

  /* ---- bảng biến thiên (pixel space) ---- */
  const ctx = st.ctx!
  ctx.save()
  ctx.globalAlpha = a
  const tx = lr.x
  const tw = lr.w
  const ty = lr.y + 26
  const rowH = (lr.h - 40) / 3
  const labelW = 62
  const cols = [tx + labelW, tx + labelW + (tw - labelW) * 0.3, tx + labelW + (tw - labelW) * 0.72, tx + tw]

  ctx.strokeStyle = C.axis
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.rect(tx, ty, tw, rowH * 3)
  for (let r = 1; r < 3; r++) {
    ctx.moveTo(tx, ty + rowH * r)
    ctx.lineTo(tx + tw, ty + rowH * r)
  }
  ctx.moveTo(labelW > 0 ? tx + labelW : tx, ty)
  ctx.lineTo(tx + labelW, ty + rowH * 3)
  for (const cx of cols.slice(1, 3)) {
    ctx.moveTo(cx, ty)
    ctx.lineTo(cx, ty + rowH * 3)
  }
  ctx.stroke()

  ctx.font = `600 12px ${MONO}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = C.dim
  ctx.fillText('x', tx + labelW / 2, ty + rowH / 2)
  ctx.fillText("f′(x)", tx + labelW / 2, ty + rowH * 1.5)
  ctx.fillText('f(x)', tx + labelW / 2, ty + rowH * 2.5)
  ctx.fillStyle = C.ink
  const hdrY = ty + rowH / 2
  ctx.fillText('−∞', cols[0] + 14, hdrY)
  ctx.fillText('−1', cols[1], hdrY)
  ctx.fillText('3', cols[2], hdrY)
  ctx.fillText('+∞', cols[3] - 14, hdrY)

  // f′ row: + 0 − 0 +
  const fRowY = ty + rowH * 1.5
  ctx.fillStyle = C.mint
  ctx.fillText('+', (cols[0] + cols[1]) / 2, fRowY)
  ctx.fillText('+', (cols[2] + cols[3]) / 2, fRowY)
  ctx.fillStyle = C.coral
  ctx.fillText('−', (cols[1] + cols[2]) / 2, fRowY)
  ctx.fillStyle = C.ink
  ctx.fillText('0', cols[1], fRowY)
  ctx.fillText('0', cols[2], fRowY)

  // f row: rising/falling arrows with extrema values
  const gTop = ty + rowH * 2 + 16
  const gBot = ty + rowH * 3 - 16
  ctx.strokeStyle = C.mint
  arrow(ctx, cols[0] + 16, gBot - 6, cols[1] - 4, gTop + 6, C.mint, 2)
  arrow(ctx, cols[2] + 4, gBot - 6, cols[3] - 16, gTop + 6, C.mint, 2)
  ctx.strokeStyle = C.coral
  arrow(ctx, cols[1] + 4, gTop + 6, cols[2] - 4, gBot - 6, C.coral, 2)
  ctx.fillStyle = C.ink
  ctx.fillText('8/3', cols[1] + 22, gTop + 2)
  ctx.fillText('−8', cols[2] - 20, gBot - 2)
  ctx.fillStyle = C.faint
  ctx.fillText('−∞', cols[0] + 26, gBot - 2)
  ctx.fillText('+∞', cols[3] - 26, gTop + 2)
  // inflection note under the table
  ctx.textAlign = 'left'
  ctx.fillStyle = C.violet
  ctx.font = `500 11.5px ${MONO}`
  ctx.fillText('f″ đổi dấu tại x = 1 → điểm uốn (1; −8/3)', tx + 8, ty + rowH * 3 + 18)
  ctx.restore()

  /* ---- complete graph with every layer ---- */
  const pv = new PlaneView(st, rr, DOM_F)
  pv.grid()
  pv.axes('x', 'y')
  segCurve(pv, f, DOM_F.x[0], XE1, { color: C.mint, width: 3, glow: 10, alpha: a })
  segCurve(pv, f, XE1, XE2, { color: C.coral, width: 3, alpha: a })
  segCurve(pv, f, XE2, DOM_F.x[1], { color: C.mint, width: 3, glow: 10, alpha: a })
  pv.point(XE1, f(XE1), { color: C.mint, r: 6, halo: true, alpha: a })
  pv.point(XE2, f(XE2), { color: C.coral, r: 6, halo: true, alpha: a })
  pv.point(XI, f(XI), { color: C.violet, r: 6, halo: true, alpha: a })
  const sweep = lerp(DOM_F.x[0], DOM_F.x[1], easeInOutSine(ph))
  pv.point(sweep, f(sweep), { color: C.gold, halo: true, alpha: a })
  pv.hud('tr', ['mọi thông tin nằm trong một bảng', '— bảng biến thiên là "tóm tắt" của đồ thị'], {
    color: C.ink, width: 262,
  })
}

/* ================= bước 6 — quy trình ================= */

function checklistEra(st: Stage, full: Rect, a: number) {
  const ctx = st.ctx!
  ctx.save()
  ctx.globalAlpha = a
  const panelX = full.x
  const panelW = full.w * 0.46
  const ty = full.y + 14
  const th = full.h - 28
  ctx.strokeStyle = C.axis
  ctx.lineWidth = 1.5
  ctx.beginPath()
  roundRectPath(ctx, panelX, ty, panelW, th, 12)
  ctx.stroke()
  ctx.font = `700 13px ${MONO}`
  ctx.fillStyle = C.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('QUY TRÌNH KHẢO SÁT HÀM SỐ', panelX + 18, ty + 26)
  ctx.font = `500 12.5px ${MONO}`
  const items = [
    '1. Tập xác định',
    '2. Nghiệm của f′ và f″ — lập bảng dấu',
    '3. Chiều biến thiên, cực trị',
    '4. Lồi lõm, điểm uốn',
    '5. Tiệm cận (nếu là phân thức)',
    '6. Giao với trục, vẽ đồ thị — đối chiếu bảng',
  ]
  items.forEach((s, i) => {
    const y = ty + 62 + i * ((th - 76) / items.length)
    ctx.fillStyle = C.mint
    ctx.fillText('✓', panelX + 18, y)
    ctx.fillStyle = C.dim
    ctx.fillText(s.slice(3), panelX + 38, y)
  })
  ctx.restore()

  const gx = full.x + panelW + 16
  const gr: Rect = { x: gx, y: full.y, w: full.w - panelW - 16, h: full.h }
  const pv = new PlaneView(st, gr, DOM_F)
  pv.grid()
  pv.axes('x', 'y')
  segCurve(pv, f, DOM_F.x[0], XE1, { color: C.mint, width: 3, glow: 10, alpha: a })
  segCurve(pv, f, XE1, XE2, { color: C.coral, width: 3, alpha: a })
  segCurve(pv, f, XE2, DOM_F.x[1], { color: C.mint, width: 3, glow: 10, alpha: a })
  pv.point(XE1, f(XE1), { color: C.mint, r: 5, halo: true, alpha: a })
  pv.point(XE2, f(XE2), { color: C.coral, r: 5, halo: true, alpha: a })
  pv.point(XI, f(XI), { color: C.violet, r: 5, alpha: a })
  pv.hud('br', ['6 bước — một bức tranh hoàn chỉnh', 'thử lại với hàm khác ở Phòng thí nghiệm!'], {
    color: C.ink, width: 262,
  })
}

/* ================= helpers ================= */

/** sample fn over [x0,x1] and stroke as polyline */
function segCurve(
  p: PlaneView,
  fn: (x: number) => number,
  x0: number,
  x1: number,
  opts: { color?: string; width?: number; alpha?: number; glow?: number },
) {
  if (x1 <= x0) return
  const n = 96
  const pts: Array<[number, number]> = []
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n
    const y = fn(x)
    if (!Number.isFinite(y)) continue
    pts.push([x, y])
  }
  p.polyline(pts, opts)
}

/** arrow with a triangular head — pixel space */
function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width: number) {
  const ang = Math.atan2(y1 - y0, x1 - x0)
  const head = 9
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1 - Math.cos(ang) * head * 0.6, y1 - Math.sin(ang) * head * 0.6)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 - Math.cos(ang - 0.42) * head, y1 - Math.sin(ang - 0.42) * head)
  ctx.lineTo(x1 - Math.cos(ang + 0.42) * head, y1 - Math.sin(ang + 0.42) * head)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}
