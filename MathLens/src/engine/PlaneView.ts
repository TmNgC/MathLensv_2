/**
 * PlaneView — a rectangular viewport on a Stage with math↔pixel scales
 * and drawing primitives for coordinate-plane scenes (axes, curves,
 * tangents, Riemann bars, filled areas, draggable points).
 */
import { scaleLinear, type ScaleLinear } from 'd3-scale'
import type { Stage } from './Stage'
import { C, MONO, SANS } from './palette'
import { niceStep } from './easing'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Domain {
  x: [number, number]
  y: [number, number]
}

export type MathFn = (x: number) => number

export interface StrokeOpts {
  color?: string
  width?: number
  dash?: number[]
  alpha?: number
  /** neon glow radius in px (use sparingly — it costs fill rate) */
  glow?: number
}

export interface FillOpts {
  fill?: string
  alpha?: number
  stroke?: string
  strokeAlpha?: number
}

export type RiemannMethod = 'left' | 'right' | 'midpoint' | 'trapezoid'

/** inset a rect by m on all sides */
export const inset = (r: Rect, m: number): Rect => ({
  x: r.x + m,
  y: r.y + m,
  w: r.w - 2 * m,
  h: r.h - 2 * m,
})

/** split a rect vertically (side by side) with a gap */
export function vsplit(r: Rect, fractions: number[], gap = 12): Rect[] {
  const usable = r.w - gap * (fractions.length - 1)
  let x = r.x
  return fractions.map((f) => {
    const w = usable * f
    const out = { x, y: r.y, w, h: r.h }
    x += w + gap
    return out
  })
}

export class PlaneView {
  readonly stage: Stage
  readonly rect: Rect
  readonly dom: Domain
  private readonly xScale: ScaleLinear<number, number>
  private readonly yScale: ScaleLinear<number, number>
  readonly sx: (v: number) => number
  readonly sy: (v: number) => number
  readonly ix: (px: number) => number
  readonly iy: (py: number) => number

  constructor(stage: Stage, rect: Rect, dom: Domain) {
    this.stage = stage
    this.rect = rect
    this.dom = dom
    this.xScale = scaleLinear().domain(dom.x).range([rect.x, rect.x + rect.w])
    this.yScale = scaleLinear().domain(dom.y).range([rect.y + rect.h, rect.y])
    this.sx = (v) => this.xScale(v)
    this.sy = (v) => this.yScale(v)
    this.ix = (px) => this.xScale.invert(px)
    this.iy = (py) => this.yScale.invert(py)
  }

  get ctx() {
    return this.stage.ctx!
  }

  private clip() {
    const { x, y, w, h } = this.rect
    this.ctx.beginPath()
    this.ctx.rect(x, y, w, h)
    this.ctx.clip()
  }

  private strokePath(opts: StrokeOpts) {
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha = opts.alpha ?? 1
    ctx.strokeStyle = opts.color ?? C.ink
    ctx.lineWidth = opts.width ?? 2
    ctx.setLineDash(opts.dash ?? [])
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    if (opts.glow) {
      ctx.shadowColor = opts.color ?? C.ink
      ctx.shadowBlur = opts.glow
    }
    ctx.stroke()
    ctx.restore()
  }

  /* ---------------------------------------------------------- structure */

  grid(dx?: number, dy?: number) {
    const ctx = this.ctx
    const stepX = dx ?? niceStep(this.dom.x[1] - this.dom.x[0], 9)
    const stepY = dy ?? niceStep(this.dom.y[1] - this.dom.y[0], 6)
    ctx.save()
    this.clip()
    ctx.strokeStyle = C.grid
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let gx = Math.ceil(this.dom.x[0] / stepX) * stepX; gx <= this.dom.x[1]; gx += stepX) {
      const px = Math.round(this.sx(gx)) + 0.5
      ctx.moveTo(px, this.rect.y)
      ctx.lineTo(px, this.rect.y + this.rect.h)
    }
    for (let gy = Math.ceil(this.dom.y[0] / stepY) * stepY; gy <= this.dom.y[1]; gy += stepY) {
      const py = Math.round(this.sy(gy)) + 0.5
      ctx.moveTo(this.rect.x, py)
      ctx.lineTo(this.rect.x + this.rect.w, py)
    }
    ctx.stroke()
    ctx.restore()
  }

  axes(labelX?: string, labelY?: string) {
    const ctx = this.ctx
    ctx.save()
    this.clip()
    const x0 = this.sx(0)
    const y0 = this.sy(0)
    ctx.strokeStyle = C.axis
    ctx.lineWidth = 1.5
    ctx.beginPath()
    if (this.dom.x[0] <= 0 && this.dom.x[1] >= 0) {
      ctx.moveTo(x0, this.rect.y)
      ctx.lineTo(x0, this.rect.y + this.rect.h)
    }
    if (this.dom.y[0] <= 0 && this.dom.y[1] >= 0) {
      ctx.moveTo(this.rect.x, y0)
      ctx.lineTo(this.rect.x + this.rect.w, y0)
    }
    ctx.stroke()

    // integer ticks + numbers
    const stepX = niceStep(this.dom.x[1] - this.dom.x[0], 9)
    const stepY = niceStep(this.dom.y[1] - this.dom.y[0], 6)
    ctx.fillStyle = C.faint
    ctx.font = `500 10px ${MONO}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const tickY = Math.min(Math.max(y0 + 5, this.rect.y + 2), this.rect.y + this.rect.h - 14)
    for (let gx = Math.ceil(this.dom.x[0] / stepX) * stepX; gx <= this.dom.x[1]; gx += stepX) {
      if (Math.abs(gx) < 1e-9) continue
      ctx.fillText(fmtNum(gx, stepX), this.sx(gx), tickY)
    }
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const tickX = Math.min(Math.max(x0 + 5, this.rect.x + 3), this.rect.x + this.rect.w - 26)
    for (let gy = Math.ceil(this.dom.y[0] / stepY) * stepY; gy <= this.dom.y[1]; gy += stepY) {
      if (Math.abs(gy) < 1e-9) continue
      ctx.fillText(fmtNum(gy, stepY), tickX, this.sy(gy))
    }
    if (labelX) {
      ctx.font = `600 11px ${MONO}`
      ctx.fillStyle = C.dim
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText(labelX, this.rect.x + this.rect.w - 4, Math.min(y0 - 4, this.rect.y + this.rect.h - 4))
    }
    if (labelY) {
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(labelY, Math.max(x0 + 6, this.rect.x + 2), this.rect.y + 2)
    }
    ctx.restore()
  }

  /* ------------------------------------------------------------ strokes */

  /** plot y=f(x); breaks on non-finite values */
  curve(fn: MathFn, opts: StrokeOpts & { samples?: number } = {}) {
    const ctx = this.ctx
    const n = opts.samples ?? Math.ceil(this.rect.w / 2)
    ctx.save()
    this.clip()
    ctx.beginPath()
    let started = false
    for (let i = 0; i <= n; i++) {
      const mx = this.ix(this.rect.x + (this.rect.w * i) / n)
      const my = fn(mx)
      if (!Number.isFinite(my)) {
        started = false
        continue
      }
      const px = this.sx(mx)
      const py = this.sy(my)
      if (!started) {
        ctx.moveTo(px, py)
        started = true
      } else {
        ctx.lineTo(px, py)
      }
    }
    this.strokePath(opts)
    ctx.restore()
  }

  polyline(pts: Array<[number, number]>, opts: StrokeOpts = {}) {
    const ctx = this.ctx
    if (pts.length === 0) return
    ctx.save()
    this.clip()
    ctx.beginPath()
    ctx.moveTo(this.sx(pts[0][0]), this.sy(pts[0][1]))
    for (let i = 1; i < pts.length; i++) ctx.lineTo(this.sx(pts[i][0]), this.sy(pts[i][1]))
    this.strokePath(opts)
    ctx.restore()
  }

  segment(p: [number, number], q: [number, number], opts: StrokeOpts = {}) {
    this.polyline([p, q], opts)
  }

  /** infinite line through (x0,y0) with given slope, clipped to the view */
  ray(x0: number, y0: number, slope: number, opts: StrokeOpts = {}) {
    const xl = this.dom.x[0] - 1
    const xr = this.dom.x[1] + 1
    const p1: [number, number] = [xl, y0 + slope * (xl - x0)]
    const p2: [number, number] = [xr, y0 + slope * (xr - x0)]
    this.polyline([p1, p2], opts)
  }

  vline(x: number, opts: StrokeOpts = {}) {
    this.polyline(
      [
        [x, this.dom.y[0]],
        [x, this.dom.y[1]],
      ],
      opts,
    )
  }

  hline(y: number, opts: StrokeOpts = {}) {
    this.polyline(
      [
        [this.dom.x[0], y],
        [this.dom.x[1], y],
      ],
      opts,
    )
  }

  /* -------------------------------------------------------------- fills */

  /** filled region between curve and y = y0 over [a,b] */
  areaUnder(fn: MathFn, a: number, b: number, opts: FillOpts & { y0?: number; samples?: number } = {}) {
    const ctx = this.ctx
    if (b <= a) return
    const n = opts.samples ?? Math.ceil(this.rect.w / 2)
    ctx.save()
    this.clip()
    ctx.beginPath()
    const y0 = opts.y0 ?? 0
    ctx.moveTo(this.sx(a), this.sy(y0))
    for (let i = 0; i <= n; i++) {
      const mx = a + ((b - a) * i) / n
      ctx.lineTo(this.sx(mx), this.sy(fn(mx)))
    }
    ctx.lineTo(this.sx(b), this.sy(y0))
    ctx.closePath()
    ctx.globalAlpha = opts.alpha ?? 0.25
    ctx.fillStyle = opts.fill ?? C.mint
    ctx.fill()
    ctx.restore()
  }

  /** Riemann approximation; returns the computed sum. Bars below the
   *  x-axis use negativeFill when provided (signed-area teaching). */
  riemann(
    fn: MathFn,
    a: number,
    b: number,
    n: number,
    method: RiemannMethod,
    opts: FillOpts & { negativeFill?: string } = {},
  ): number {
    const ctx = this.ctx
    const dx = (b - a) / n
    let sum = 0
    const pos: Array<Array<[number, number]>> = []
    const neg: Array<Array<[number, number]>> = []
    for (let i = 0; i < n; i++) {
      const x0 = a + i * dx
      let y0: number, y1: number
      if (method === 'trapezoid') {
        y0 = fn(x0)
        y1 = fn(x0 + dx)
        sum += ((y0 + y1) / 2) * dx
      } else {
        const sample = method === 'left' ? x0 : method === 'right' ? x0 + dx : x0 + dx / 2
        y0 = fn(sample)
        y1 = y0
        sum += y0 * dx
      }
      const quad: Array<[number, number]> = [
        [x0, 0],
        [x0, y0],
        [x0 + dx, y1],
        [x0 + dx, 0],
      ]
      ;((y0 + y1) / 2 >= 0 ? pos : neg).push(quad)
    }
    ctx.save()
    this.clip()
    const trace = (quads: Array<Array<[number, number]>>) => {
      ctx.beginPath()
      for (const q of quads) {
        ctx.moveTo(this.sx(q[0][0]), this.sy(q[0][1]))
        for (let k = 1; k < 4; k++) ctx.lineTo(this.sx(q[k][0]), this.sy(q[k][1]))
        ctx.closePath()
      }
    }
    ctx.globalAlpha = opts.alpha ?? 0.3
    ctx.fillStyle = opts.fill ?? C.teal
    trace(pos)
    ctx.fill()
    if (neg.length) {
      ctx.fillStyle = opts.negativeFill ?? opts.fill ?? C.teal
      trace(neg)
      ctx.fill()
    }
    if (opts.stroke) {
      ctx.globalAlpha = opts.strokeAlpha ?? 0.7
      ctx.strokeStyle = opts.stroke
      ctx.lineWidth = 1
      trace(pos)
      trace(neg)
      ctx.stroke()
    }
    ctx.restore()
    return sum
  }

  /* ------------------------------------------------------------- points */

  point(
    x: number,
    y: number,
    opts: {
      color?: string
      r?: number
      halo?: boolean
      label?: string
      labelColor?: string
      labelDx?: number
      labelDy?: number
      alpha?: number
    } = {},
  ) {
    const ctx = this.ctx
    const px = this.sx(x)
    const py = this.sy(y)
    const color = opts.color ?? C.gold
    const r = opts.r ?? 5
    const alpha = opts.alpha ?? 1
    ctx.save()
    ctx.globalAlpha = alpha
    if (opts.halo) {
      ctx.globalAlpha = 0.25 * alpha
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(px, py, r * 2.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = alpha
    }
    ctx.fillStyle = color
    ctx.strokeStyle = C.bg
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
    if (opts.label) {
      this.text(px + (opts.labelDx ?? 10), py + (opts.labelDy ?? -10), opts.label, {
        color: opts.labelColor ?? color,
        size: 13,
        mono: true,
        weight: 600,
        align: 'left',
        alpha,
      })
    }
  }

  /** register a draggable point (immediate-mode; call every frame) */
  draggablePoint(
    x: number,
    y: number,
    onDrag: (mx: number, my: number) => void,
    opts: { hitRadius?: number; cursor?: string } = {},
  ) {
    const px = this.sx(x)
    const py = this.sy(y)
    const R = opts.hitRadius ?? 16
    this.stage.draggable({
      hit: (cx, cy) => (cx - px) ** 2 + (cy - py) ** 2 <= R * R,
      onDrag: (cx, cy) => onDrag(this.ix(cx), this.iy(cy)),
      cursor: opts.cursor ?? 'grab',
    })
  }

  /* --------------------------------------------------------------- text */

  /** pixel-space text (HUDs, captions) */
  text(
    px: number,
    py: number,
    str: string,
    opts: {
      color?: string
      size?: number
      mono?: boolean
      weight?: number
      align?: CanvasTextAlign
      baseline?: CanvasTextBaseline
      bg?: string
      bgPad?: number
      alpha?: number
    } = {},
  ) {
    const ctx = this.ctx
    const size = opts.size ?? 12
    const font = opts.mono ? MONO : SANS
    const weight = opts.weight ?? 500
    ctx.save()
    ctx.globalAlpha = opts.alpha ?? 1
    ctx.font = `${weight} ${size}px ${font}`
    ctx.textAlign = opts.align ?? 'left'
    ctx.textBaseline = opts.baseline ?? 'alphabetic'
    if (opts.bg) {
      const w = ctx.measureText(str).width
      const pad = opts.bgPad ?? 5
      const bx =
        opts.align === 'center' ? px - w / 2 : opts.align === 'right' ? px - w : px
      ctx.fillStyle = opts.bg
      const line = size * 0.85
      const by =
        opts.baseline === 'top'
          ? py
          : opts.baseline === 'middle'
            ? py - line / 2
            : py - line
      ctx.beginPath()
      roundRect(ctx, bx - pad, by - pad * 0.6, w + 2 * pad, line + 1.2 * pad, 5)
      ctx.fill()
    }
    ctx.fillStyle = opts.color ?? C.ink
    ctx.fillText(str, px, py)
    ctx.restore()
  }

  /** rounded info panel in the corner */
  hud(
    corner: 'tl' | 'tr' | 'bl' | 'br',
    lines: string[],
    opts: { color?: string; width?: number } = {},
  ) {
    const pad = 9
    const lh = 16
    const w = opts.width ?? 150
    const h = lines.length * lh + 2 * pad - 4
    const x =
      corner === 'tl' || corner === 'bl' ? this.rect.x + 8 : this.rect.x + this.rect.w - w - 8
    const y =
      corner === 'tl' || corner === 'tr' ? this.rect.y + 8 : this.rect.y + this.rect.h - h - 8
    drawHud(this.ctx, x, y, w, lines, opts.color)
  }
}

/** standalone HUD panel (for scenes that don't use a PlaneView) */
export function drawHud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  lines: string[],
  color: string = C.ink,
) {
  const pad = 9
  const lh = 16
  const h = lines.length * lh + 2 * pad - 4
  ctx.save()
  ctx.fillStyle = `${C.bg}e8`
  ctx.strokeStyle = C.axis
  ctx.lineWidth = 1
  roundRect(ctx, x, y, w, h, 8)
  ctx.fill()
  ctx.stroke()
  ctx.font = `500 12px ${MONO}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  lines.forEach((line, i) => ctx.fillText(line, x + pad, y + pad + 2 + i * lh))
  ctx.restore()
}

/** exported as roundRectPath for scenes drawing custom widgets */
export const roundRectPath = roundRect

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function fmtNum(v: number, step: number): string {
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9))
  const s = v.toFixed(Math.min(decimals, 4))
  return s === '-0' ? '0' : s
}
