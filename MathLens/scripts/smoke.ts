/**
 * Local smoke test for the serverless handlers (run: `node scripts/smoke.ts`).
 * Kept outside api/ so Vercel does not deploy it as a function.
 * Verifies the no-key (501), bad-body (400), and provider-error (502) paths.
 */
import { POST as quiz } from '../api/quiz.ts'
import { POST as analyze } from '../api/analyze.ts'

const post = (path: string, body: unknown) =>
  new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

delete process.env.LLM_API_KEY
const r1 = await quiz(post('/api/quiz', { lessonIds: ['dao-ham'], count: 3 }))
console.log('quiz, no key      →', r1.status, (await r1.text()).slice(0, 90))

process.env.LLM_API_KEY = 'sk-fake-key-for-error-path'
const r2 = await quiz(post('/api/quiz', {}))
console.log('quiz, no lessons  →', r2.status, (await r2.text()).slice(0, 90))

const r3 = await quiz(post('/api/quiz', { lessonIds: ['dao-ham'], count: 3 }))
console.log('quiz, fake key    →', r3.status, (await r3.text()).slice(0, 120))

const r4 = await analyze(
  post('/api/analyze', {
    score: 1,
    count: 2,
    totalMs: 30000,
    answers: [
      { skillTag: 'bảng đạo hàm', correct: true, ms: 10000 },
      { skillTag: 'cực trị', correct: false, ms: 20000 },
    ],
  }),
)
console.log('analyze, fake key →', r4.status, (await r4.text()).slice(0, 120))
console.log('done')
