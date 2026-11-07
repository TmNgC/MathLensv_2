import type { Lesson } from './types'

/**
 * Bài "Quy tắc tính đạo hàm" — theory-only (no visualizer).
 * Chain rule deep dive + all HS calculus rules with derivations.
 */
export const derivativeRulesLesson: Lesson = {
  id: 'quy-tac-dao-ham',
  number: 5,
  title: 'Quy tắc tính đạo hàm',
  subtitle: 'Tổng · tích · thương · chuỗi',
  kind: 'theory',
  accent: '#4dffa0',
  glyph: '⚙',
  steps: [
    {
      title: 'Tài liệu lý thuyết',
      body: 'Bốn quy tắc cơ bản của phép tính đạo hàm — kỹ năng tính toán quan trọng nhất của toàn bộ giải tích.',
    },
  ],
  theory: [
    {
      heading: 'Leibniz và bộ quy tắc đầu tiên',
      kind: 'history',
      body:
        'Năm 1684, trong bài báo "Nova Methodus pro Maximis et Minimis" — công trình giải tích đầu tiên được công bố — Leibniz không chỉ nêu khái niệm đạo hàm mà còn ghi sẵn các quy tắc tổng, hiệu, tích, thương và lũy thừa, kèm ký hiệu $\\frac{dy}{dx}$ tiện dụng đến mức hơn ba thế kỷ sau chúng ta vẫn viết nguyên vẹn. Quy tắc chuỗi xuất hiện trong thư từ của ông và được ứng dụng ngay vào quang học. Các chứng minh nghiêm ngặt bằng giới hạn chỉ hoàn thiện vào thế kỷ 19 — nội dung bạn đọc hôm nay là kết tinh của cả một tiến trình dài.',
    },
    {
      heading: 'Quy tắc tổng & hiệu',
      kind: 'def',
      body:
        '$(u \\pm v)\' = u\' \\pm v\'$ — đạo hàm phân phối qua cộng trừ. Chứng minh thẳng từ định nghĩa: $\\frac{(u+v)(x+h)-(u+v)(x)}{h}=\\frac{u(x+h)-u(x)}{h}+\\frac{v(x+h)-v(x)}{h}$, cho $h\\to0$ là xong. Hệ quả trực tiếp: $(C\\cdot u)\'=C\\cdot u\'$ với hằng số $C$ (hằng số "kéo ra ngoài").',
    },
    {
      heading: 'Quy tắc tích',
      kind: 'def',
      body:
        '$(u\\cdot v)\'=u\'v+uv\'$. Chứng minh (thêm bớt một số hạng ở tử số): $$\\frac{u(x+h)v(x+h)-u(x)v(x)}{h}=\\frac{u(x+h)-u(x)}{h}v(x+h)+u(x)\\frac{v(x+h)-v(x)}{h}$$ rồi cho $h\\to0$. Ví dụ: $(x^2\\sin x)\'=2x\\sin x+x^2\\cos x$.',
    },
    {
      heading: 'Quy tắc thương',
      kind: 'def',
      body:
        '$\\left(\\dfrac{u}{v}\\right)\'=\\dfrac{u\'v-uv\'}{v^2}$ (với $v\\ne0$). Có thể ghi nhớ theo nhịp: "tử đạo nhân mẫu, trừ tử nhân mẫu đạo, trên mẫu bình phương". Hệ quả dùng nhiều: $\\left(\\dfrac{1}{u}\\right)\'=-\\dfrac{u\'}{u^2}$. Ví dụ: $\\left(\\dfrac{x}{x^2+1}\\right)\'=\\dfrac{(x^2+1)-x\\cdot 2x}{(x^2+1)^2}=\\dfrac{1-x^2}{(x^2+1)^2}$.',
    },
    {
      heading: 'Quy tắc chuỗi (hàm hợp)',
      kind: 'def',
      body:
        '$\\big(f(g(x))\\big)\'=f\'(g(x))\\cdot g\'(x)$: đạo hàm lớp ngoài giữ nguyên phần trong, nhân thêm đạo hàm lớp trong. Trực giác: nếu $g$ đổi nhanh gấp 3 lần và $f$ khuếch đại gấp 2 lần thì hàm hợp đổi nhanh gấp 6 lần. Ví dụ điển hình: $\\big(\\sin(3x)\\big)\'=\\cos(3x)\\cdot 3=3\\cos 3x$; $\\big(\\sqrt{x^2+1}\\big)\'=\\dfrac{2x}{2\\sqrt{x^2+1}}=\\dfrac{x}{\\sqrt{x^2+1}}$.',
    },
    {
      heading: 'Bảng quy tắc + hàm hợp tổng hợp',
      kind: 'note',
      body:
        'Viết với $u=u(x)$ — chú ý nhân thêm $u\'$ ở mọi hàng: đó chính là quy tắc chuỗi.',
      table: [
        { sym: '$C$', meaning: '$0$' },
        { sym: '$u^n$', meaning: '$n\\,u\'\\,u^{n-1}$' },
        { sym: '$\\sin u$', meaning: '$u\'\\cos u$' },
        { sym: '$\\cos u$', meaning: '$-u\'\\sin u$' },
        { sym: '$e^u$', meaning: '$u\'\\,e^u$' },
        { sym: '$\\ln u$', meaning: '$\\dfrac{u\'}{u}$' },
        { sym: '$\\log_a u$', meaning: '$\\dfrac{u\'}{u\\ln a}$' },
        { sym: '$\\sqrt{u}$', meaning: '$\\dfrac{u\'}{2\\sqrt{u}}$' },
      ],
    },
    {
      heading: 'Bài mẫu tổng hợp — chuỗi hai tầng',
      kind: 'example',
      body:
        'Tính $f\'(x)$ với $f(x)=\\sqrt{x^4-3x^2+7}$. Đặt $g=x^4-3x^2+7$ thì $g\'=4x^3-6x$. Áp chuỗi: $f\'=\\dfrac{g\'}{2\\sqrt{g}}=\\dfrac{4x^3-6x}{2\\sqrt{x^4-3x^2+7}}=\\dfrac{2x^3-3x}{\\sqrt{x^4-3x^2+7}}$. Nếu có thêm tầng ngoài nữa (ví dụ $\\sin\\sqrt{g}$) thì cứ lặp lại: đạo ngoài × đạo trong, và "trong" lại là một bài chuỗi mới.',
    },
    {
      heading: 'Sai lầm thường gặp',
      kind: 'warn',
      body:
        '1) $(uv)\'\\ne u\'v\'$ — quy tắc tích là phép cộng hai số hạng, không phải phép nhân. 2) Quên $u\'$ khi đạo hàm hàm hợp: $(\\sin 3x)\'$ không phải $\\cos 3x$. 3) $(ku)\'=ku\'$ nhưng $(u^k)\'=ku^{k-1}u\'$ — hằng số nhân khác hằng số mũ. 4) Chuỗi hai tầng: chỉ nhân $g\'$ MỘT lần cho MỖI tầng.',
    },
  ],
}
