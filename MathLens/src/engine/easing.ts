export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** map v from [a,b] to [c,d] with clamping */
export const remap = (v: number, a: number, b: number, c: number, d: number) =>
  lerp(c, d, clamp((v - a) / (b - a)))

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export const easeOutExpo = (t: number) =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)

export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

/** "nice" axis tick step (1, 2, 5 × 10^k) covering range in ~count ticks */
export function niceStep(range: number, count = 8): number {
  const raw = range / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const mult = norm >= 5 ? 5 : norm >= 2 ? 2 : 1
  return mult * mag
}
