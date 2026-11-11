/* ---- OpenAI-compatible LLM client (inlined: Vercel functions are kept self-contained) ---- */
/**
 * Shared OpenAI-compatible LLM client for the serverless functions.
 *
 * Env vars:
 *   LLM_API_KEY   (required — otherwise endpoints return 501)
 *   LLM_BASE_URL  (default https://api.openai.com/v1 — any OpenAI-compatible
 *                  endpoint: Gemini, Claude (https://api.anthropic.com/v1), GLM, Groq, ...)
 *   LLM_MODEL     (default gpt-4o-mini). May list several models separated by
 *                 commas: the next one is tried when a model is overloaded,
 *                 out of quota, retired or too slow.
 *   LLM_TIMEOUT_MS        total time budget per request (default 25000)
 *   LLM_REASONING_EFFORT  e.g. none | minimal | low | medium | high. Default "low"
 *                 for Gemini (its newer models "think" before answering, which
 *                 is slow); not sent for other providers unless set.
 */

interface LLMConfig {
  baseUrl: string
  apiKey: string
  models: string[]
  timeoutMs: number
  reasoningEffort: string | null
}

function llmConfig(): LLMConfig | null {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) return null
  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').trim().replace(/\/+$/, '')
  const models = (process.env.LLM_MODEL || 'gpt-4o-mini')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)
  const envEffort = process.env.LLM_REASONING_EFFORT?.trim()
  return {
    apiKey,
    baseUrl,
    models,
    timeoutMs: Math.min(55_000, Math.max(5_000, Number(process.env.LLM_TIMEOUT_MS) || 25_000)),
    reasoningEffort: envEffort ? envEffort : baseUrl.includes('generativelanguage.googleapis.com') ? 'low' : null,
  }
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

class LLMError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** one HTTP call to one model */
async function chatOnce(
  cfg: LLMConfig,
  model: string,
  messages: ChatMessage[],
  opts: { temperature: number; maxTokens: number; effort: string | null },
  signal: AbortSignal,
): Promise<string> {
  // Claude's OpenAI-compatible endpoint rejects response_format "json_object" and
  // (on Claude 4.7+) any temperature below 1, and its Claude 5 models think by
  // default — so send neither there and leave room for the thinking tokens.
  const anthropic = cfg.baseUrl.includes('api.anthropic.com')
  const body: Record<string, unknown> = { model, messages, max_tokens: anthropic ? opts.maxTokens * 2 : opts.maxTokens }
  if (!anthropic) {
    body.temperature = opts.temperature
    body.response_format = { type: 'json_object' }
  }
  if (opts.effort && !anthropic) body.reasoning_effort = opts.effort
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) throw new LLMError(res.status, `LLM HTTP ${res.status} (${model}): ${(await res.text()).slice(0, 400)}`)
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content ?? ''
}

function parseJSON(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    // some endpoints ignore response_format and wrap JSON in fences
    const m = text.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0]) as Record<string, unknown>
    throw new LLMError(502, 'LLM did not return JSON')
  }
}

/**
 * chat completion → parsed JSON object, within cfg.timeoutMs in total.
 * Falls through the model list on overload (429/5xx), retired models (404),
 * timeouts and malformed output; retries once without reasoning_effort when a
 * model rejects that parameter (400).
 */
async function chatJSON(
  cfg: LLMConfig,
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<{ data: Record<string, unknown>; model: string }> {
  const deadline = Date.now() + cfg.timeoutMs
  const errors: string[] = []
  for (const [mi, model] of cfg.models.entries()) {
    let effort = cfg.reasoningEffort
    for (let attempt = 0; attempt < 2; attempt++) {
      const left = deadline - Date.now()
      if (left < 1500) throw new LLMError(504, `LLM timeout after ${cfg.timeoutMs} ms. ${errors.join(' | ')}`.slice(0, 600))
      // with fallbacks still available, a slow model may use at most 60% of what is left
      const slice = mi < cfg.models.length - 1 ? Math.max(4000, left * 0.6) : left
      const ctl = new AbortController()
      const timer = setTimeout(() => ctl.abort(), Math.min(left, slice))
      try {
        const text = await chatOnce(
          cfg,
          model,
          messages,
          { temperature: opts.temperature ?? 0.8, maxTokens: opts.maxTokens ?? 4000, effort },
          ctl.signal,
        )
        return { data: parseJSON(text), model }
      } catch (e) {
        const err = e as Error & { status?: number; name?: string }
        if (err.name === 'AbortError') {
          errors.push(`${model}: timeout`)
          break // budget is spent on this model; the loop-top check decides whether another fits
        }
        const status = err.status ?? 0
        errors.push(`${model}: ${err.message.slice(0, 160)}`)
        if (status === 400 && effort && /reasoning|thinking|effort|unknown|invalid/i.test(err.message)) {
          effort = null // this model does not accept the parameter → same model, without it
          continue
        }
        if (status === 401 || status === 403) throw new LLMError(status, errors.join(' | ').slice(0, 600)) // bad key: no point trying others
        break // 404 / 429 / 5xx / bad JSON → next model
      } finally {
        clearTimeout(timer)
      }
    }
  }
  const timedOut = Date.now() >= deadline - 1500 || errors.every((x) => x.endsWith(': timeout'))
  throw new LLMError(timedOut ? 504 : 502, errors.join(' | ').slice(0, 600))
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

/* ---- endpoint ---- */
/**
 * POST /api/analyze  { score, count, totalMs, answers: [{skillTag, correct, ms}] }
 * → { overall, strengths[], weaknesses[], advice[] }
 */

/** Vercel Function (Web-standard handler): POST only */
export async function POST(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  const cfg = llmConfig()
  if (!cfg) {
    return json({ error: 'no_api_key', hint: 'Đặt LLM_API_KEY để bật phân tích bằng AI.' }, 501)
  }

  let body: {
    score?: number
    count?: number
    totalMs?: number
    lang?: string
    answers?: Array<{ skillTag?: string; correct?: boolean; ms?: number }>
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid JSON body' }, 400)
  }

  const LANG_NAMES: Record<string, string> = {
    en: 'English',
    vi: 'Vietnamese',
    fr: 'French',
    zh: 'Simplified Chinese',
    ja: 'Japanese',
  }
  const langName = LANG_NAMES[body.lang ?? 'vi'] ?? 'Vietnamese'

  const answers = Array.isArray(body.answers) ? body.answers : []
  if (answers.length === 0) return json({ error: 'no answers' }, 400)

  const summary = answers
    .map(
      (a, i) =>
        `Câu ${i + 1}: kỹ năng "${a.skillTag ?? '?'}" — ${a.correct ? 'đúng' : 'SAI'}, ${((a.ms ?? 0) / 1000).toFixed(1)}s`,
    )
    .join('\n')
  const score = Number(body.score) || 0
  const count = Number(body.count) || answers.length
  const totalS = ((Number(body.totalMs) || 0) / 1000).toFixed(0)

  try {
    const { data: out, model } = await chatJSON(
      cfg,
      [
        {
          role: 'system',
          content:
            'Bạn là cố vấn học tập môn Toán THPT Việt Nam. Phân tích kết quả bài trắc nghiệm của học sinh: ấm áp, cụ thể, khích lệ nhưng thẳng thắn. LUÔN trả về một JSON object duy nhất. Viết toàn bộ nội dung (cả JSON) bằng ' +
            langName +
            ' — không dùng ngôn ngữ nào khác.',
        },
        {
          role: 'user',
          content: `Kết quả: ${score}/${count} câu đúng, tổng thời gian ${totalS}s.

Chi tiết từng câu:
${summary}

Hãy phân tích và trả về JSON đúng dạng:
{"overall":"nhận xét tổng quan 2-3 câu, nhắc đúng/sai ratio và tốc độ","strengths":["kỹ năng chắc tay, dựa trên dữ liệu"],"weaknesses":["kỹ năng yếu hoặc chậm, kèm số liệu"],"advice":["2-4 việc cụ thể nên làm, ví dụ xem lại bài nào"]}

Các bài học trên web: gioi-han (Giới hạn), dao-ham (Đạo hàm), tich-phan (Tích phân), khoi-tron-xoay (Khối tròn xoay), thiet-dien (Thiết diện). Mỗi bài có phần "Trực quan" và "Lý thuyết".`,
        },
      ],
      { temperature: 0.7, maxTokens: 1200 },
    )

    const strs = (v: unknown) => (Array.isArray(v) ? v.map(String).slice(0, 6) : [])
    return json({
      overall: String(out.overall ?? ''),
      strengths: strs(out.strengths),
      weaknesses: strs(out.weaknesses),
      advice: strs(out.advice),
      model,
    })
  } catch (e) {
    const err = e as Error & { status?: number }
    return json({ error: err.status === 504 ? 'llm_timeout' : 'llm_error', detail: String(err.message).slice(0, 600) }, err.status === 504 ? 504 : 502)
  }
}
