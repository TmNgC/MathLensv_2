import type { SceneProps } from '../content/types'
import { useLessonClock } from '../components/LessonShell'
import { SceneCanvas } from '../components/SceneCanvas'
import { PlaneView, roundRectPath, type Rect } from '../engine/PlaneView'
import type { Stage } from '../engine/Stage'
import { C, MONO } from '../engine/palette'
import { clamp, easeInOutSine, lerp } from '../engine/easing'

/**
 * Bài "Từ toán học đến vật lý" — 7 bước trực quan.
 *
 * Động học (0–2): vận tốc tức thời = đạo hàm, gia tốc = đạo hàm cấp hai,
 * diện tích đồ thị v–t = độ dời.
 * Động lực học (3–5): thí nghiệm lò xo (Hooke), công của lực biến thiên =
 * diện tích F–x, dao động điều hòa với x và v như hai đường sin lệch pha.
 * Bước 6: bản đồ tổng kết — ba hình nhỏ.
 */
export function PhysicsScene({ step }: SceneProps) {
  const { playheadRef } = useLessonClock()

  const draw = (st: Stage) => {
    const ph = playheadRef.current
    const W = st.width
    const H = st.height
    const full: Rect = { x: 14, y: 12, w: W - 28, h: H - 26 }

    // crossfade weights per step
    const w = (i: number) => st.smooth(`phys${i}`, step === i ? 1 : 0, 5)

    if (w(0) > 0.02) velocityEra(st, full, ph, w(0))
    if (w(1) > 0.02) accelerationEra(st, full, ph, w(1))
    if (w(2) > 0.02) vtAreaEra(st, full, ph, w(2))
    if (w(3) > 0.02) hookeEra(st, full, ph, w(3))
    if (w(4) > 0.02) workEra(st, full, ph, w(4))
    if (w(5) > 0.02) shmEra(st, full, ph, w(5))
    if (w(6) > 0.02) recapEra(st, full, st, w(6))
  }

  return <SceneCanvas draw={draw} />
}

/* ============================== ĐỘNG HỌC ============================== */

/** Bước 0 — vận tốc tức thời: x(t)=t² với tiếp tuyến, ghost cát tuyến
 *  co dần, và tháp rơi tự do bên phải. */
function velocityEra(st: Stage, full: Rect, ph: number, a: number) {
  const leftW = full.w * 0.58
  const gap = 14
  const lr: Rect = { x: full.x, y: full.y, w: leftW, h: full.h }
  const rr: Rect = { x: full.x + leftW + gap, y: full.y, w: full.w - leftW - gap, h: full.h }

  const dom: { x: [number, number]; y: [number, number] } = { x: [0, 4.6], y: [0, 10.4] }
  const pv = new PlaneView(st, lr, dom)
  const f = (t: number) => t * t
  const fp = (t: number) => 2 * t

  pv.grid()
  pv.axes('t (s)', 'x (m)')
  pv.curve(f, { color: C.mint, width: 3, glow: 12, alpha: a })

  const tq = lerp(0.7, 4.1, easeInOutSine(ph))
  const d = lerp(1.3, 0.02, clamp(ph * 1.5))
  const t2 = Math.min(tq + d, 4.5)

  // ghost secant tightening to the tangent
  pv.segment([tq, f(tq)], [t2, f(t2)], { color: C.violet, width: 1.5, dash: [7, 6], alpha: 0.8 * a })
  pv.point(t2, f(t2), { color: C.violet, r: 4, alpha: a })
  // the tangent
  pv.ray(tq, f(tq), fp(tq), { color: C.gold, width: 2.5, glow: 10, alpha: a })
  pv.point(tq, f(tq), { color: C.gold, halo: true, alpha: a })

  if (d < 0.2) {
    pv.text(pv.sx(tq) - 10, pv.sy(f(tq)) + 34, 'Δt → 0  ⇒  tiếp tuyến', {
      color: C.gold, size: 12, mono: true, align: 'right', bg: `${C.bg}e6`, alpha: a,
    })
  }
  pv.hud('tr', [
    `t = ${tq.toFixed(2)} s`,
    `x = ${f(tq).toFixed(2)} m`,
    `v = x' = ${fp(tq).toFixed(2)} m/s`,
  ], { color: C.gold, width: 186 })
  pv.text(pv.sx(2.2), pv.sy(7.6), 'x(t) = ½gt²  (g = 2 m/s²)', {
    color: C.mint, size: 13, mono: true, weight: 600, alpha: a,
  })

  // falling tower — same clock, physical picture
  const ctx = st.ctx!
  ctx.save()
  ctx.globalAlpha = a
  const cx = rr.x + rr.w / 2
  const topY = rr.y + 26
  const groundY = rr.y + rr.h - 26
  const hMax = f(4.1)
  // rail + ticks
  ctx.strokeStyle = C.axis
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, topY - 8)
  ctx.lineTo(cx, groundY)
  ctx.stroke()
  for (let i = 0; i <= 4; i++) {
    const y = topY + ((groundY - topY) * i) / 4
    ctx.beginPath()
    ctx.moveTo(cx - 5, y)
    ctx.lineTo(cx + 5, y)
    ctx.stroke()
  }
  // ground
  ctx.strokeStyle = C.dim
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 46, groundY)
  ctx.lineTo(cx + 46, groundY)
  ctx.stroke()
  // falling ball — starts at the top, lands as x(t) grows
  const by = topY + clamp(f(tq) / hMax) * (groundY - topY)
  ctx.shadowColor = C.gold
  ctx.shadowBlur = 16
  ctx.fillStyle = C.gold
  ctx.beginPath()
  ctx.arc(cx, by, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  // height label
  ctx.font = `600 12px ${MONO}`
  ctx.fillStyle = C.ink
  ctx.textAlign = 'left'
  ctx.fillText(`h = ${(hMax - f(tq)).toFixed(1)} m`, cx + 14, by + 4)
  ctx.fillStyle = C.faint
  ctx.font = `500 11px ${MONO}`
  ctx.fillText('rơi tự do', cx - 44, topY - 14)
  ctx.restore()
}

/** Bước 1 — gia tốc: v(t)=gt thẳng (độ dốc = a) và x(t)=½gt² trùng lúc. */
function accelerationEra(st: Stage, full: Rect, ph: number, a: number) {
  const [lr, rr] = split2(full)
  const tq = lerp(0.6, 4.0, easeInOutSine(ph))

  const dv = new PlaneView(st, lr, { x: [0, 4.4], y: [0, 9] })
  dv.grid()
  dv.axes('t (s)', 'v (m/s)')
  dv.curve((t) => 2 * t, { color: C.teal, width: 3, glow: 12, alpha: a })
  dv.ray(tq, 2 * tq, 2, { color: C.gold, width: 2, glow: 9, alpha: a })
  dv.point(tq, 2 * tq, { color: C.gold, halo: true, alpha: a })
  dv.hud('tr', [
    `t = ${tq.toFixed(2)} s`,
    `v = ${2 * tq} m/s`,
    'độ dốc = 2 = a',
  ], { color: C.gold, width: 170 })
  dv.text(dv.sx(0.35), dv.sy(8.1), 'v(t) = g·t — đường thẳng', {
    color: C.teal, size: 13, mono: true, weight: 600, alpha: a,
  })

  const dx = new PlaneView(st, rr, { x: [0, 4.4], y: [0, 9] })
  dx.grid()
  dx.axes('t (s)', 'x (m)')
  segCurve(dx, (t) => t * t, 0, tq, { color: C.mint, width: 3, glow: 12, alpha: a })
  dx.point(tq, tq * tq, { color: C.mint, halo: true, alpha: a })
  dx.hud('tr', [`x = ${(tq * tq).toFixed(2)} m`, 'x = ∫v dt'], { color: C.mint, width: 160 })
  dx.text(dx.sx(0.35), dx.sy(8.1), 'x(t) = ½gt² — parabol', {
    color: C.mint, size: 13, mono: true, weight: 600, alpha: a,
  })
}

/** Bước 2 — diện tích có dấu dưới đồ thị v–t = độ dời. */
const V_T1 = 2 // kết thúc tăng tốc
const V_T2 = 5 // kết thúc đều
const V_T3 = 6 // kết thúc hãm
function vOf(t: number): number {
  if (t < V_T1) return t
  if (t < V_T2) return 2
  if (t < V_T3) return 2 - 2 * (t - V_T2)
  return -1.5 * ((t - V_T3) / 2)
}
function sOf(t: number): number {
  if (t < V_T1) return (t * t) / 2
  if (t < V_T2) return 2 + 2 * (t - V_T1)
  if (t < V_T3) {
    const u = t - V_T2
    return 6 + 2 * u - u * u
  }
  const u = t - V_T3
  return 7 - (1.5 * u * u) / 4
}
function dOf(t: number): number {
  if (t < V_T3) return sOf(t)
  const u = t - V_T3
  return 7 + (1.5 * u * u) / 4
}
function vtAreaEra(st: Stage, full: Rect, ph: number, a: number) {
  const pv = new PlaneView(st, full, { x: [0, 8.4], y: [-2.4, 3.4] })
  pv.grid()
  pv.axes('t (s)', 'v (m/s)')

  const tc = lerp(0.001, 8, easeInOutSine(ph))

  // signed area sweep
  if (tc > 0) {
    pv.areaUnder(vOf, 0, Math.min(tc, V_T3), { fill: C.mint, alpha: 0.28 * a })
    if (tc > V_T3) pv.areaUnder(vOf, V_T3, tc, { fill: C.coral, alpha: 0.3 * a })
  }
  pv.curve(vOf, { color: C.teal, width: 3, glow: 12, alpha: a })
  pv.vline(tc, { color: C.faint, width: 1, dash: [4, 5], alpha: 0.6 * a })
  pv.point(tc, vOf(tc), { color: C.gold, halo: true, alpha: a })

  pv.text(pv.sx(1.1), pv.sy(1.6), 'v > 0 ⇒ cộng vào', {
    color: C.mint, size: 12, mono: true, alpha: a,
  })
  if (tc > 6.6) {
    pv.text(pv.sx(6.9), pv.sy(-1.5), 'v < 0 ⇒ trừ đi', {
      color: C.coral, size: 12, mono: true, alpha: a,
    })
  }
  pv.hud('tl', [
    `độ dời s   = ${sOf(tc).toFixed(2)} m`,
    `quãng đường = ${dOf(tc).toFixed(2)} m`,
  ], { color: C.mint, width: 200 })
  pv.hud('tr', [`t = ${tc.toFixed(2)} s`, `v = ${vOf(tc).toFixed(2)} m/s`], {
    color: C.teal, width: 176,
  })
  pv.text(pv.sx(4.2), pv.sy(3.0), 'diện tích có dấu = độ dời', {
    color: C.gold, size: 13, mono: true, weight: 600, align: 'center', bg: `${C.bg}e6`, alpha: a,
  })
}

/* ============================ ĐỘNG LỰC HỌC ============================ */

/** Bước 3 — thí nghiệm lò xo: thêm quả nặng, chấm (x, F) xếp thành đường
 *  F = kx. Trái: thí nghiệm, phải: đồ thị. */
function hookeEra(st: Stage, full: Rect, ph: number, a: number) {
  const leftW = full.w * 0.4
  const gap = 14
  const ex: Rect = { x: full.x, y: full.y, w: leftW, h: full.h }
  const gr: Rect = { x: full.x + leftW + gap, y: full.y, w: full.w - leftW - gap, h: full.h }

  const K = 2 // N/m
  const n = Math.min(5, 1 + Math.floor(ph * 5.4))
  const pop = clamp((ph * 5.4) % 1) // newest point pop 0..1

  /* ---- experiment (pixel space) ---- */
  const ctx = st.ctx!
  ctx.save()
  ctx.globalAlpha = a
  const cx = ex.x + ex.w / 2
  const ceilY = ex.y + 16
  // ceiling
  ctx.fillStyle = C.bgSoft
  ctx.strokeStyle = C.axis
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.rect(cx - 70, ceilY, 140, 8)
  ctx.fill()
  ctx.stroke()
  // hatching above the ceiling
  ctx.strokeStyle = C.faint
  ctx.lineWidth = 1
  for (let i = -66; i <= 66; i += 10) {
    ctx.beginPath()
    ctx.moveTo(cx + i, ceilY)
    ctx.lineTo(cx + i - 6, ceilY - 7)
    ctx.stroke()
  }
  const springTop = ceilY + 8
  const trayY = springTop + 90 + n * 20
  drawSpring(st, cx, springTop, cx, trayY, 9, 9, a)
  // tray
  ctx.strokeStyle = C.ink
  ctx.lineWidth = 2
  ctx.fillStyle = C.bgSoft
  ctx.beginPath()
  roundRectPath(ctx, cx - 34, trayY, 68, 10, 3)
  ctx.fill()
  ctx.stroke()
  // weights stacked on tray
  for (let i = 0; i < n; i++) {
    const wy = trayY - (i + 1) * 13
    ctx.fillStyle = i === n - 1 ? C.coral : C.dim
    ctx.strokeStyle = C.bg
    ctx.beginPath()
    roundRectPath(ctx, cx - 22, wy, 44, 11, 3)
    ctx.fill()
  }
  ctx.font = `600 11px ${MONO}`
  ctx.fillStyle = C.faint
  ctx.textAlign = 'center'
  ctx.fillText(`${n} quả nặng`, cx, trayY + 28)
  // force arrow
  const ax0 = cx + 44
  const ax1 = ax0 + 18 + n * 13
  arrow(ctx, ax0, trayY + 5, ax1, trayY + 5, C.gold, 2.5)
  ctx.fillStyle = C.gold
  ctx.textAlign = 'left'
  ctx.fillText(`F = ${n} N`, ax0 + 4, trayY - 8)
  // length marker
  ctx.strokeStyle = C.teal
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(cx - 58, springTop)
  ctx.lineTo(cx - 58, trayY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = C.teal
  ctx.textAlign = 'right'
  ctx.fillText(`x = ${(n / K).toFixed(1)} m`, cx - 64, (springTop + trayY) / 2)
  ctx.restore()

  /* ---- graph ---- */
  const pv = new PlaneView(st, gr, { x: [0, 3.2], y: [0, 6.4] })
  pv.grid()
  pv.axes('x (m)', 'F (N)')
  pv.curve((x) => K * x, { color: C.gold, width: 2.5, glow: 10, alpha: 0.9 * a, dash: [8, 6] })
  for (let i = 1; i <= n; i++) {
    const newest = i === n
    const r = newest ? 4 + 3 * pop : 5
    pv.point(i / K, i, { color: C.coral, r, halo: newest && pop > 0.15, alpha: a })
  }
  pv.hud('tr', [
    `x = ${(n / K).toFixed(1)} m`,
    `F = ${n} N`,
    `F/x = ${K} N/m = k`,
  ], { color: C.coral, width: 172 })
  pv.text(pv.sx(0.25), pv.sy(6.0), 'các điểm nằm trên một đường thẳng: F = k·x', {
    color: C.gold, size: 12, mono: true, alpha: a,
  })
}

/** Bước 4 — công của lực đàn hồi: diện tích tam giác dưới F = kx. */
function workEra(st: Stage, full: Rect, ph: number, a: number) {
  const leftW = full.w * 0.3
  const gap = 14
  const ex: Rect = { x: full.x, y: full.y, w: leftW, h: full.h }
  const gr: Rect = { x: full.x + leftW + gap, y: full.y, w: full.w - leftW - gap, h: full.h }

  const K = 2
  const xc = lerp(0.12, 4.0, easeInOutSine(ph))
  const Fc = K * xc

  /* ---- spring being stretched ---- */
  const ctx = st.ctx!
  ctx.save()
  ctx.globalAlpha = a
  const cy = ex.y + ex.h / 2
  const wallX = ex.x + 26
  ctx.strokeStyle = C.axis
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(wallX, cy - 62)
  ctx.lineTo(wallX, cy + 62)
  ctx.stroke()
  ctx.strokeStyle = C.faint
  ctx.lineWidth = 1
  for (let i = -58; i <= 58; i += 10) {
    ctx.beginPath()
    ctx.moveTo(wallX, cy + i)
    ctx.lineTo(wallX - 7, cy + i - 6)
    ctx.stroke()
  }
  const maxX = ex.w - 60
  const mx = wallX + 14 + (xc / 4) * (maxX - 14)
  drawSpring(st, wallX, cy, mx - 16, cy, 10, 8, a)
  // mass
  ctx.fillStyle = C.bgSoft
  ctx.strokeStyle = C.teal
  ctx.lineWidth = 2
  ctx.beginPath()
  roundRectPath(ctx, mx - 16, cy - 15, 30, 30, 6)
  ctx.fill()
  ctx.stroke()
  // force arrow grows with F
  arrow(ctx, mx + 18, cy, mx + 18 + 12 + Fc * 13, cy, C.gold, 2.5)
  ctx.font = `600 12px ${MONO}`
  ctx.fillStyle = C.gold
  ctx.textAlign = 'left'
  ctx.fillText(`F = ${Fc.toFixed(1)} N`, mx + 22, cy - 14)
  ctx.fillStyle = C.teal
  ctx.fillText(`x = ${xc.toFixed(1)} m`, mx - 14, cy + 32)
  ctx.restore()

  /* ---- graph: sweeping triangle ---- */
  const pv = new PlaneView(st, gr, { x: [0, 4.5], y: [0, 8.8] })
  pv.grid()
  pv.axes('x (m)', 'F (N)')
  pv.areaUnder((x) => K * x, 0, xc, { fill: C.mint, alpha: 0.3 * a })
  pv.curve((x) => K * x, { color: C.teal, width: 3, glow: 12, alpha: a })
  pv.vline(xc, { color: C.faint, width: 1, dash: [4, 5], alpha: 0.6 * a })
  pv.point(xc, Fc, { color: C.gold, halo: true, alpha: a })
  pv.text(pv.sx(xc / 2), pv.sy(Fc / 2), `A = ½·k·x² = ${((K * xc * xc) / 2).toFixed(1)} J`, {
    color: C.mint, size: 13, mono: true, weight: 600, align: 'center', bg: `${C.bg}e6`, alpha: a,
  })
  pv.hud('tr', [
    `x = ${xc.toFixed(2)} m`,
    `F = ${Fc.toFixed(2)} N`,
    `A = ∫F dx = ${((K * xc * xc) / 2).toFixed(2)} J`,
  ], { color: C.gold, width: 190 })
  pv.text(pv.sx(0.25), pv.sy(8.3), 'F = k·x — lực tăng dần, công là diện tích', {
    color: C.teal, size: 12, mono: true, alpha: a,
  })
}

/** Bước 5 — dao động điều hòa: con lắc lò xo ngang + hai đường x, v. */
function shmEra(st: Stage, full: Rect, ph: number, a: number) {
  const leftW = full.w * 0.38
  const gap = 14
  const ex: Rect = { x: full.x, y: full.y, w: leftW, h: full.h }
  const gr: Rect = { x: full.x + leftW + gap, y: full.y, w: full.w - leftW - gap, h: full.h }

  const A = 2.5
  const TAU = ph * 4 * Math.PI
  const xNow = A * Math.cos(TAU)
  const vNow = -A * Math.sin(TAU)

  /* ---- oscillating mass ---- */
  const ctx = st.ctx!
  ctx.save()
  ctx.globalAlpha = a
  const cy = ex.y + ex.h / 2
  const wallX = ex.x + 24
  ctx.strokeStyle = C.axis
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(wallX, cy - 70)
  ctx.lineTo(wallX, cy + 70)
  ctx.stroke()
  // equilibrium line
  const eqX = wallX + (ex.w - 48) / 2
  ctx.strokeStyle = C.faint
  ctx.lineWidth = 1
  ctx.setLineDash([5, 6])
  ctx.beginPath()
  ctx.moveTo(eqX, cy - 84)
  ctx.lineTo(eqX, cy + 84)
  ctx.stroke()
  ctx.setLineDash([])
  const mX = eqX + (xNow / A) * (ex.w * 0.3)
  drawSpring(st, wallX, cy, mX - 17, cy, 11, 8, a)
  ctx.fillStyle = C.bgSoft
  ctx.strokeStyle = C.mint
  ctx.lineWidth = 2
  ctx.shadowColor = C.mint
  ctx.shadowBlur = 10
  ctx.beginPath()
  roundRectPath(ctx, mX - 17, cy - 16, 34, 32, 7)
  ctx.fill()
  ctx.stroke()
  ctx.shadowBlur = 0
  // displacement arrow
  arrow(ctx, eqX, cy + 46, mX, cy + 46, C.gold, 2)
  ctx.font = `600 12px ${MONO}`
  ctx.fillStyle = C.gold
  ctx.textAlign = 'center'
  ctx.fillText(`x = ${xNow.toFixed(2)}`, (eqX + mX) / 2, cy + 66)
  ctx.fillStyle = C.faint
  ctx.fillText('vị trí cân bằng', eqX, cy - 92)
  ctx.restore()

  /* ---- rolling x and v curves ---- */
  const tMax = 4 * Math.PI
  const pv = new PlaneView(st, gr, { x: [0, tMax + 0.6], y: [-3.5, 3.5] })
  pv.grid()
  pv.axes('t (s)', 'x, v')
  segCurve(pv, (t) => A * Math.cos(t), 0, Math.min(TAU, tMax), { color: C.mint, width: 2.5, glow: 10, alpha: a })
  segCurve(pv, (t) => -A * Math.sin(t), 0, Math.min(TAU, tMax), { color: C.gold, width: 2.5, alpha: a })
  if (TAU <= tMax) {
    pv.point(Math.min(TAU, tMax), xNow, { color: C.mint, halo: true, alpha: a })
    pv.point(Math.min(TAU, tMax), vNow, { color: C.gold, r: 5, alpha: a })
  }
  pv.text(pv.sx(0.3), pv.sy(3.05), 'x = A·cos ωt', { color: C.mint, size: 12.5, mono: true, weight: 600, alpha: a })
  pv.text(pv.sx(0.3), pv.sy(2.35), 'v = −A·ω·sin ωt', { color: C.gold, size: 12.5, mono: true, weight: 600, alpha: a })
  pv.hud('tr', [
    `x = ${xNow.toFixed(2)} m`,
    `v = ${vNow.toFixed(2)} m/s`,
    `a = −x = ${(-xNow).toFixed(2)} m/s²`,
  ], { color: C.ink, width: 196 })
}

/* ============================== TỔNG KẾT ============================== */

/** Bước 6 — ba hình nhỏ: ∫v dt, ∫F dx, v = dx/dt. */
function recapEra(st: Stage, full: Rect, stage: Stage, a: number) {
  const pulse = 0.82 + 0.18 * Math.sin(stage.time * 2)
  const [r1, r2, r3] = split3(full)

  const p1 = new PlaneView(st, r1, { x: [0, 3.4], y: [0, 3.4] })
  p1.grid()
  p1.axes('t', 'v')
  p1.areaUnder((t) => t, 0, 3, { fill: C.mint, alpha: 0.3 * a * pulse })
  p1.curve((t) => t, { color: C.teal, width: 2.5, alpha: a })
  p1.text(p1.sx(1.7), p1.sy(2.1), '∫v dt = độ dời', {
    color: C.mint, size: 12.5, mono: true, weight: 600, align: 'center', bg: `${C.bg}e6`, alpha: a,
  })

  const p2 = new PlaneView(st, r2, { x: [0, 3.4], y: [0, 7] })
  p2.grid()
  p2.axes('x', 'F')
  p2.areaUnder((x) => 2 * x, 0, 3, { fill: C.mint, alpha: 0.3 * a * pulse })
  p2.curve((x) => 2 * x, { color: C.teal, width: 2.5, alpha: a })
  p2.text(p2.sx(1.7), p2.sy(4.2), '∫F dx = công', {
    color: C.mint, size: 12.5, mono: true, weight: 600, align: 'center', bg: `${C.bg}e6`, alpha: a,
  })

  const p3 = new PlaneView(st, r3, { x: [0, 6.6], y: [-2.4, 2.4] })
  p3.grid()
  p3.axes('t', 'x, v')
  p3.curve((t) => 2 * Math.cos(t), { color: C.mint, width: 2.5, glow: 8, alpha: a })
  p3.curve((t) => -2 * Math.sin(t), { color: C.gold, width: 2.5, alpha: a })
  p3.text(p3.sx(3.3), p3.sy(1.9), 'v = dx/dt', {
    color: C.gold, size: 12.5, mono: true, weight: 600, align: 'center', bg: `${C.bg}e6`, alpha: a,
  })
}

/* ============================== helpers =============================== */

function split2(full: Rect): [Rect, Rect] {
  const gap = 16
  const w = (full.w - gap) / 2
  return [
    { x: full.x, y: full.y, w, h: full.h },
    { x: full.x + w + gap, y: full.y, w, h: full.h },
  ]
}

function split3(full: Rect): [Rect, Rect, Rect] {
  const gap = 14
  const w = (full.w - 2 * gap) / 3
  return [
    { x: full.x, y: full.y, w, h: full.h },
    { x: full.x + w + gap, y: full.y, w, h: full.h },
    { x: full.x + 2 * (w + gap), y: full.y, w, h: full.h },
  ]
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
  const n = 96
  const pts: Array<[number, number]> = []
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n
    pts.push([x, fn(x)])
  }
  p.polyline(pts, opts)
}

/** coil spring from (x0,y0) to (x1,y1) — pixel space */
function drawSpring(st: Stage, x0: number, y0: number, x1: number, y1: number, coils: number, amp: number, alpha: number) {
  const ctx = st.ctx!
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const lead = Math.min(14, len * 0.12)
  const n = coils * 2
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = C.dim
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x0 + ux * lead, y0 + uy * lead)
  for (let i = 1; i < n; i++) {
    const t = lead + ((len - 2 * lead) * i) / n
    const side = i % 2 === 0 ? 1 : -1
    ctx.lineTo(x0 + ux * t + px * amp * side, y0 + uy * t + py * amp * side)
  }
  ctx.lineTo(x1 - ux * lead, y1 - uy * lead)
  ctx.lineTo(x1, y1)
  ctx.stroke()
  ctx.restore()
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
