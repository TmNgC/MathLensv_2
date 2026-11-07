/**
 * Stage — the 2D canvas runtime every math scene draws on.
 *
 * Owns: DPR-aware sizing, the requestAnimationFrame loop, frame-rate
 * independent smoothing for animated values, and immediate-mode drag
 * targets (scenes register hit regions every frame; pointer events
 * resolve against the last frame's list).
 */
import { clamp } from './easing'

export interface DragTarget {
  /** pixel-space hit test against the last frame */
  hit: (px: number, py: number) => boolean
  /** called with stage-local pixel coords while dragging */
  onDrag: (px: number, py: number) => void
  cursor?: string
}

export class Stage {
  canvas: HTMLCanvasElement | null = null
  ctx: CanvasRenderingContext2D | null = null
  /** CSS-pixel size of the canvas */
  width = 0
  height = 0
  /** seconds since attach (paused-safe: accumulates real frame deltas) */
  time = 0

  private dpr = 1
  private drawFn: ((stage: Stage) => void) | null = null
  private raf = 0
  private ro: ResizeObserver | null = null
  private last = 0
  private lastDt = 1 / 60
  private smoothMap = new Map<string, number>()
  private frameTargets: DragTarget[] = []
  private dragging: DragTarget | null = null
  private cleanup: (() => void)[] = []

  attach(canvas: HTMLCanvasElement, drawFn: (stage: Stage) => void) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.drawFn = drawFn
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      this.width = Math.max(1, Math.round(r.width))
      this.height = Math.max(1, Math.round(r.height))
      canvas.width = Math.round(this.width * this.dpr)
      canvas.height = Math.round(this.height * this.dpr)
    }
    resize()
    this.ro = new ResizeObserver(resize)
    this.ro.observe(canvas)

    const local = (e: PointerEvent): [number, number] => {
      const r = canvas.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top]
    }

    const onDown = (e: PointerEvent) => {
      const [px, py] = local(e)
      for (let i = this.frameTargets.length - 1; i >= 0; i--) {
        const t = this.frameTargets[i]
        if (t.hit(px, py)) {
          this.dragging = t
          canvas.setPointerCapture(e.pointerId)
          canvas.style.cursor = t.cursor ?? 'grabbing'
          t.onDrag(px, py)
          e.preventDefault()
          return
        }
      }
    }
    const onMove = (e: PointerEvent) => {
      const [px, py] = local(e)
      if (this.dragging) {
        this.dragging.onDrag(px, py)
        e.preventDefault()
        return
      }
      const over = [...this.frameTargets].reverse().find((t) => t.hit(px, py))
      canvas.style.cursor = over ? (over.cursor ?? 'grab') : 'default'
    }
    const onUp = (e: PointerEvent) => {
      if (this.dragging) {
        this.dragging = null
        try {
          canvas.releasePointerCapture(e.pointerId)
        } catch {
          /* pointer already released */
        }
        canvas.style.cursor = 'default'
      }
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    this.cleanup.push(() => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    })

    this.last = performance.now()
    const loop = (now: number) => {
      this.lastDt = clamp((now - this.last) / 1000, 0, 0.05)
      this.last = now
      this.time += this.lastDt
      this.frameTargets = []
      if (this.ctx && this.drawFn) {
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
        this.ctx.clearRect(0, 0, this.width, this.height)
        try {
          this.drawFn(this)
        } catch (e) {
          // a throwing scene must not kill the rAF loop silently
          const msg = '⚠ draw error: ' + String((e as Error).message).slice(0, 120)
          if (this.canvas && this.canvas.title !== msg) {
            this.canvas.title = msg
            console.error('[Stage] draw error:', e)
          }
        }
      }
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  detach() {
    cancelAnimationFrame(this.raf)
    this.ro?.disconnect()
    this.cleanup.forEach((fn) => fn())
    this.cleanup = []
    this.smoothMap.clear()
    this.frameTargets = []
    this.dragging = null
    this.drawFn = null
    this.canvas = null
    this.ctx = null
  }

  /**
   * Exponentially-smoothed value. Call every frame with the current
   * target; returns the eased current value. When targets jump (e.g. a
   * step change), everything animated through this transitions smoothly.
   */
  smooth(key: string, target: number, speed = 8): number {
    const cur = this.smoothMap.get(key) ?? target
    const next = cur + (target - cur) * (1 - Math.exp(-speed * this.lastDt))
    this.smoothMap.set(key, next)
    return next
  }

  /** register a draggable region for this frame (immediate-mode) */
  draggable(t: DragTarget) {
    this.frameTargets.push(t)
  }
}
