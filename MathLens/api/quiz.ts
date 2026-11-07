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
 * POST /api/quiz  { lessonIds: string[], count: number, difficulty?: 'easy'|'mixed'|'hard' }
 * → { questions: QuizQuestion[] }   (501 when no LLM_API_KEY configured)
 */

const LESSON_TOPICS: Record<string, string> = {
  'tien-giai-tich':
    'Tiền giải tích: tập hợp & khoảng (N⊂Z⊂Q⊂R, (a;b), [a;b]), hàm số & miền xác định, các họ hàm cơ bản (bậc nhất, bậc hai, phân thức, sin/cos, e^x, ln x), hàm hợp (g∘f)(x)=g(f(x)), hàm ngược (ln là ngược của e^x, arcsin), biến đổi đồ thị, tư duy giải tích (tốc độ thay đổi — tích lũy — giới hạn — xấp xỉ tuyến tính)',
  'gioi-han':
    'Giới hạn: tính giới hạn dãy hữu tỉ, lim q^n với |q|<1, lim(1+1/n)^n=e, giới hạn hàm số & hai giới hạn một bên, chuỗi hội tụ/phân kỳ (Zeno, chuỗi điều hòa), ý nghĩa epsilon-delta',
  'gioi-han-nang-cao':
    'Giới hạn nâng cao: nguyên lý kẹp, các giới hạn tiêu chuẩn (sinx/x, ln(1+x)/x, (1+a/x)^x→e^a), quy tắc L\'Hôpital (dạng 0/0, ∞/∞ và các bẫy), khai triển Taylor, tiêu chuẩn Weierstrass cho dãy truy hồi u_{n+1}=f(u_n), định lý Stolz–Cesàro',
  'dao-ham':
    'Đạo hàm: định nghĩa bằng giới hạn của tỉ số hiệu, bảng đạo hàm cơ bản, ý nghĩa đơn điệu, điều kiện cực trị, phương trình tiếp tuyến',
  'quy-tac-dao-ham':
    'Quy tắc tính đạo hàm: quy tắc tổng hiệu (u±v)\', quy tắc tích (uv)\'=u\'v+uv\', quy tắc thương (u/v)\', hệ quả (1/u)\', quy tắc chuỗi (f(g(x)))\'=f\'(g)·g\' với ví dụ hàm hợp như sin(3x), √(x²+1), (x³-x+1)^5',
  'kham-sat':
    'Khảo sát hàm số: chiều biến thiên qua dấu f\', điều kiện cực trị (f\'=0 và đổi dấu, kiểm tra bằng f″), lồi lõm và điểm uốn (f″ đổi dấu), tiệm cận đứng/ngang/xiên của hàm phân thức, bảng biến thiên, vẽ đồ thị y=ax³+bx²+cx+d và y=(ax+b)/(cx+d)',
  'tich-phan':
    'Tích phân: nguyên hàm cơ bản, định lý cơ bản của giải tích ∫=F(b)−F(a), diện tích có dấu khi f đổi dấu, tổng Riemann, ứng dụng vận tốc–quãng đường',
  'khoi-tron-xoay':
    'Khối tròn xoay: thể tích V=π∫f²(x)dx khi quay quanh Ox, π∫φ²(y)dy khi quay quanh Oy, phương pháp đĩa, bài toán vòng xuyến R²−r²',
  'thiet-dien':
    'Thiết diện: công thức V=∫S(x)dx, nguyên lý Cavalieri (hai khối cùng diện tích thiết diện thì cùng thể tích), thể tích nón ⅓πR²H và khối cầu 4/3πR³ qua tích phân',
  'toan-ly':
    'Từ toán học đến vật lý: đạo hàm theo thời gian (v=dx/dt, a=dv/dt, I=dq/dt, e=−NdΦ/dt, P=dW/dt), tích phân cộng dồn (độ dời ∫v dt, điện tích ∫I dt, công ∫F ds), diện tích dưới đồ thị v–t và F–s, dao động điều hòa x=Acos(ωt+φ) với v và a là đạo hàm, thế năng đàn hồi ½kx² từ tích phân',
}

interface GenQuestion {
  lessonId?: string
  skillTag?: string
  question?: string
  options?: unknown
  correctIndex?: number
  explanation?: string
}

function validate(raw: unknown, lessonIds: string[]) {
  const arr = Array.isArray(raw) ? raw : []
  const out = []
  for (let i = 0; i < arr.length; i++) {
    const q = arr[i] as GenQuestion
    const opts = Array.isArray(q.options) ? q.options.map(String) : []
    const ci = Number(q.correctIndex)
    if (
      typeof q.question === 'string' &&
      typeof q.explanation === 'string' &&
      opts.length === 4 &&
      Number.isInteger(ci) &&
      ci >= 0 &&
      ci <= 3 &&
      lessonIds.includes(q.lessonId ?? '')
    ) {
      out.push({
        id: `ai-${Date.now()}-${i}`,
        lessonId: q.lessonId!,
        skillTag: String(q.skillTag ?? 'chung'),
        question: q.question,
        options: opts,
        correctIndex: ci,
        explanation: q.explanation,
      })
    }
  }
  return out
}

/** Vercel Function (Web-standard handler): POST only */
export async function POST(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  const cfg = llmConfig()
  if (!cfg) {
    return json({ error: 'no_api_key', hint: 'Đặt biến môi trường LLM_API_KEY trên Vercel để bật AI.' }, 501)
  }

  let body: { lessonIds?: string[]; count?: number; difficulty?: string; lang?: string }
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

  const lessonIds = (body.lessonIds ?? []).filter((id) => id in LESSON_TOPICS)
  const count = Math.min(15, Math.max(3, Number(body.count) || 10))
  const difficulty = body.difficulty === 'easy' || body.difficulty === 'hard' ? body.difficulty : 'mixed'
  if (lessonIds.length === 0) return json({ error: 'no valid lessonIds' }, 400)

  const topicList = lessonIds.map((id) => `- ${id}: ${LESSON_TOPICS[id]}`).join('\n')

  try {
    const out = await chatJSON(
      cfg,
      [
        {
          role: 'system',
          content:
            'Bạn là giáo viên Toán THPT Việt Nam nhiều kinh nghiệm ra đề. Bạn soạn câu hỏi trắc nghiệm chính xác về mặt toán học, bám chương trình lớp 11-12. Công thức toán viết trong cặp $...$ (LaTeX). LUÔN trả về một JSON object duy nhất, không thêm chữ nào khác. Viết toàn bộ câu hỏi, phương án, skillTag và explanation bằng ' +
            langName +
            ' — không dùng ngôn ngữ nào khác (ký hiệu toán vẫn giữ LaTeX).',
        },
        {
          role: 'user',
          content: `Soạn đúng ${count} câu hỏi trắc nghiệm (độ khó: ${difficulty}) về các chủ đề sau:

${topicList}

Yêu cầu:
- Mỗi câu đúng 4 phương án, chỉ một đúng; các phương án sai phải "hấp dẫn" (phản ánh lỗi thường gặp thật).
- skillTag: nhãn kỹ năng ngắn bằng tiếng Việt (2-4 từ, ví dụ "cực trị", "bảng đạo hàm").
- explanation: giải thích ngắn (2-3 câu) vì sao chọn đúng, có công thức khi cần.
- Phân bố câu đều giữa các lessonId được chọn.

Trả về JSON đúng dạng:
{"questions":[{"lessonId":"...","skillTag":"...","question":"... $x^2$ ...","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."}]}`,
        },
      ],
      { temperature: 0.9, maxTokens: 6000 },
    )
    const questions = validate(out.questions, lessonIds)
    if (questions.length === 0) return json({ error: 'generation_failed_validation' }, 502)
    return json({ questions })
  } catch (e) {
    return json({ error: 'llm_error', detail: String((e as Error).message).slice(0, 300) }, 502)
  }
}
