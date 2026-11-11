import { FALLBACK_BANK } from './fallback'
import type { QuizQuestion } from './types'

export type QuestionSource = 'ai' | 'offline'

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function fromBank(lessonIds: string[], count: number) {
  const pool = FALLBACK_BANK.filter((q) => lessonIds.includes(q.lessonId))
  return { questions: shuffle(pool).slice(0, Math.min(count, pool.length)), offline: true }
}

/** the server gives the AI ~25 s; past this the client stops waiting and uses the offline bank */
export const AI_CLIENT_TIMEOUT_MS = 35_000

/** fetch that gives up after `ms` */
export async function fetchWithTimeout(url: string, init: RequestInit, ms = AI_CLIENT_TIMEOUT_MS): Promise<Response> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: ctl.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** questions from the AI endpoint when available, otherwise the offline bank */
export async function loadQuestions(
  source: QuestionSource,
  lessonIds: string[],
  count: number,
  lang: string,
): Promise<{ questions: QuizQuestion[]; offline: boolean }> {
  if (source === 'offline') return fromBank(lessonIds, count)
  try {
    const res = await fetchWithTimeout('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonIds, count, lang }),
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data.questions) || data.questions.length === 0) throw new Error('empty')
    return { questions: data.questions as QuizQuestion[], offline: false }
  } catch {
    return fromBank(lessonIds, count)
  }
}
