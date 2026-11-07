/* ---- OpenAI-compatible LLM client (inlined: Vercel functions are kept self-contained) ---- */
/**
 * Shared OpenAI-compatible LLM client for the serverless functions.
 *
 * Env vars:
 *   LLM_API_KEY  (required — otherwise endpoints return 501)
 *   LLM_BASE_URL (default https://api.openai.com/v1 — works with any
 *                 OpenAI-compatible endpoint: GLM, Groq, Together, ...)
 *   LLM_MODEL    (default gpt-4o-mini)
 */

interface LLMConfig {
  baseUrl: string
  apiKey: string
  model: string
}

function llmConfig(): LLMConfig | null {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) return null
  return {
    apiKey,
    baseUrl: (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
  }
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** chat completion → parsed JSON object (handles ```json fences defensively) */
async function chatJSON(
  cfg: LLMConfig,
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<Record<string, unknown>> {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: opts.temperature ?? 0.8,
      max_tokens: opts.maxTokens ?? 4000,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    throw new Error(`LLM HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = data.choices?.[0]?.message?.content ?? ''
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    // some endpoints ignore response_format and wrap JSON in fences
    const m = text.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0]) as Record<string, unknown>
    throw new Error('LLM did not return JSON')
  }
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
    const out = await chatJSON(
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
    })
  } catch (e) {
    return json({ error: 'llm_error', detail: String((e as Error).message).slice(0, 300) }, 502)
  }
}
