/** One multiple-choice question (fields may contain $latex$). */
export interface QuizQuestion {
  id: string
  lessonId: string
  /** skill tag used for per-skill analytics, e.g. "cực trị" */
  skillTag: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface AnswerRecord {
  questionId: string
  skillTag: string
  chosen: number
  correct: boolean
  ms: number
}

/** Persisted attempt summary (question snapshots kept only in-session). */
export interface AttemptSummary {
  date: number
  lessonIds: string[]
  score: number
  count: number
  totalMs: number
  weakSkills: string[]
  /** leaderboard points earned (see quiz/scoring.ts); absent on old records */
  points?: number
}

/** Structured feedback from the AI analyzer (or the offline rule engine). */
export interface QuizAnalysis {
  overall: string
  strengths: string[]
  weaknesses: string[]
  advice: string[]
  offline?: boolean
}
