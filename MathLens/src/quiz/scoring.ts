/**
 * Leaderboard points for one quiz attempt.
 *
 * Each correct answer is worth 10 points plus a speed bonus of up to 5 points
 * that shrinks linearly to 0 at 60 s, so accuracy always matters most and
 * a wrong answer is worth nothing however fast it was.
 *   points = Σ_correct [ 10 + round(5 · max(0, 1 − t/60 s)) ]
 * The serverless endpoint (api/leaderboard.ts) recomputes the same formula.
 */
export const BASE_POINTS = 10
export const MAX_BONUS = 5
export const BONUS_WINDOW_MS = 60_000

export function questionPoints(correct: boolean, ms: number): number {
  if (!correct) return 0
  const bonus = Math.round(MAX_BONUS * Math.max(0, 1 - Math.max(0, ms) / BONUS_WINDOW_MS))
  return BASE_POINTS + bonus
}

export function attemptPoints(answers: Array<{ correct: boolean; ms: number }>): number {
  return answers.reduce((s, a) => s + questionPoints(a.correct, a.ms), 0)
}
