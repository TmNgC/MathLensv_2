import type { Lesson } from './types'

/**
 * Bài "Giới hạn nâng cao" — theory-only, soạn theo chuyên đề
 * "Giới hạn dãy số, hàm số" (Hồ Tuấn Phát): nguyên lý kẹp, tiêu chuẩn
 * Weierstrass cho dãy truy hồi, L'Hôpital, Taylor, Stolz–Cesàro.
 */
export const advancedLimitsLesson: Lesson = {
  id: 'gioi-han-nang-cao',
  number: 3,
  title: 'Giới hạn nâng cao',
  subtitle: 'Kẹp · Weierstrass · L\'Hôpital · Stolz–Cesàro',
  kind: 'theory',
  accent: '#ff7a7a',
  glyph: '∞',
  steps: [
    {
      title: 'Tài liệu chuyên đề',
      body: 'Các định lý quan trọng của chương trình chuyên.',
    },
  ],
  theory: [
    {
      heading: 'Từ giáo trình đầu tiên đến các định lý tinh chỉnh',
      kind: 'history',
      body:
        'Quy tắc L\'Hôpital đến từ cuốn giáo trình giải tích đầu tiên của nhân loại — "Analyse des infiniment petits" (1696) của marquis de l\'Hôpital — nhưng phần chứng minh thật ra do Johann Bernoulli soạn và bán cho ông theo một hợp đồng trả phí. Brook Taylor (1715) đưa ra chuỗi mang tên mình để xấp xỉ hàm bằng đa thức, ban đầu không để ý đến điều kiện hội tụ — phải chờ thế kỷ 19 mới được làm chặt. Tiêu chuẩn Weierstrass về dãy đơn điệu bị chặn và định lý Stolz (1885) – Cesàro (1888) thuộc về giai đoạn xây nền móng: khi các nhà toán học thay trực giác bằng chứng minh nghiêm ngặt, chuyên đề này là kết quả của tiến trình đó.',
    },
    {
      heading: 'Nguyên lý kẹp',
      kind: 'def',
      body:
        'Nếu $v_n \\le x_n \\le w_n$ từ một vị trí nào đó và $\\lim v_n=\\lim w_n=L$ thì $\\lim x_n=L$. Ví dụ điển hình: chứng minh $\\lim\\sqrt[n]{n}=1$ bằng AM-GM: $1\\le\\sqrt[n]{n}=\\sqrt[n]{\\sqrt{n}\\cdot\\sqrt{n}\\cdot1\\cdots1}\\le\\dfrac{2\\sqrt{n}+n-2}{n}\\to1$. Hoặc $\\lim\\dfrac{\\cos(n+3)}{n}=0$ vì $\\left|\\dfrac{\\cos(n+3)}{n}\\right|\\le\\dfrac1n\\to0$. Nguyên tắc sử dụng: áp dụng khi $x_n$ kẹp được vào giữa hai dãy dễ tính và cùng hội tụ.',
    },
    {
      heading: 'Các công thức thiết yếu',
      kind: 'note',
      body: 'Các giới hạn tiêu chuẩn sau xuất hiện liên tục trong mọi bài tính giới hạn:',
      table: [
        { sym: '$\\lim\\limits_{x\\to0}\\dfrac{\\sin x}{x}=\\lim\\limits_{x\\to0}\\dfrac{\\tan x}{x}=1$', meaning: 'dạng sin trên sin' },
        { sym: '$\\lim\\limits_{x\\to0}\\dfrac{\\ln(1+x)}{x}=1$', meaning: 'logarit gần 1' },
        { sym: '$\\lim\\limits_{x\\to0}\\dfrac{a^x-1}{x}=\\ln a$', meaning: 'mũ gần 1' },
        { sym: '$\\lim\\limits_{x\\to+\\infty}\\left(1+\\dfrac{a}{x}\\right)^x=e^a$', meaning: 'mở rộng của số $e$' },
        { sym: '$\\lim q^n=0$ khi $|q|<1$', meaning: 'cơ sở Zeno' },
        { sym: '$\\lim\\limits_{x\\to0}(1+x)^{1/x}=e$', meaning: 'dạng "$1^\\infty$" — mượn logarit' },
      ],
    },
    {
      heading: 'Quy tắc L\'Hôpital',
      kind: 'def',
      body:
        'Nếu $\\dfrac{f(x)}{g(x)}$ có dạng $\\dfrac00$ hoặc $\\dfrac{\\infty}{\\infty}$ khi $x\\to c$, và $\\lim\\dfrac{f\'(x)}{g\'(x)}$ tồn tại thì $\\lim\\dfrac{f(x)}{g(x)}=\\lim\\dfrac{f\'(x)}{g\'(x)}$. Ví dụ: $\\lim\\limits_{x\\to0}\\dfrac{\\ln(1+x)}{x}=\\lim\\dfrac{1/(1+x)}{1}=1$. Một hệ quả quan trọng: $\\lim\\limits_{x\\to+\\infty}\\dfrac{P(x)}{a^x}=0$ với mọi đa thức $P$ và $a>1$ — hàm mũ luôn tăng nhanh hơn mọi đa thức.',
    },
    {
      heading: 'Khi nào quy tắc L\'Hôpital không áp dụng được',
      kind: 'warn',
      body:
        '1) Chỉ được dùng khi biểu thức có dạng $\\frac00$ hoặc $\\frac{\\infty}{\\infty}$ — dùng khi chưa kiểm tra dạng là một lỗi nghiêm trọng. 2) Ví dụ kinh điển: $\\lim\\limits_{x\\to+\\infty}\\dfrac{x+\\sin x}{x}$ — dùng L\'Hôpital ra $\\dfrac{1+\\cos x}{1}$ không tồn tại, nhưng giới hạn gốc bằng $1+\\dfrac{\\sin x}{x}\\to1$! Việc $\\lim\\dfrac{f\'}{g\'}$ không tồn tại KHÔNG kéo theo giới hạn gốc không tồn tại.',
    },
    {
      heading: 'Khai triển Taylor',
      kind: 'def',
      body:
        '$f(x)=f(x_0)+\\dfrac{f\'(x_0)}{1!}(x-x_0)+\\dots+\\dfrac{f^{(n)}(x_0)}{n!}(x-x_0)^n+\\dots$. Các khai triển dùng nhiều: $e^x=1+x+\\dfrac{x^2}{2!}+\\dfrac{x^3}{3!}+\\dots$; $\\sin x=x-\\dfrac{x^3}{3!}+\\dfrac{x^5}{5!}-\\dots$; $\\cos x=1-\\dfrac{x^2}{2!}+\\dfrac{x^4}{4!}-\\dots$; $\\dfrac{1}{1-x}=1+x+x^2+\\dots$ khi $|x|<1$. Đây cũng là nguồn gốc của các bất đẳng thức quen thuộc: $e^x\\ge1+x$, $x-\\frac{x^3}{6}\\le\\sin x\\le x$ ($x\\ge0$), $\\tan x\\ge x$.',
    },
    {
      heading: 'Tiêu chuẩn Weierstrass & dãy truy hồi',
      kind: 'def',
      body:
        'Dãy đơn điệu tăng và bị chặn trên thì hội tụ (đây chính là "tiêu chuẩn Weierstrass"). Kèm theo hai sự kiện phụ: (1) dãy hội tụ khi và chỉ khi MỌI dãy con của nó hội tụ về cùng giới hạn — nên đủ xét $u_{2n}$ và $u_{2n+1}$; (2) với dãy truy hồi $u_{n+1}=f(u_n)$, $f$ liên tục: nếu $(u_n)$ hội tụ về $L$ thì $L=f(L)$.',
    },
    {
      heading: 'Định lý Stolz–Cesàro',
      kind: 'def',
      body:
        'Nếu $(b_n)$ tăng ngặt lên $+\\infty$ và $\\lim\\dfrac{a_{n+1}-a_n}{b_{n+1}-b_n}=L$ thì $\\lim\\dfrac{a_n}{b_n}=L$. Ví dụ: $\\lim\\dfrac{1+2+\\dots+n}{n^2}$: lấy $a_n=\\dfrac{n(n+1)}{2}$, $b_n=n^2$, tỉ số hiệu $=\\dfrac{n+1}{2n+1}\\to\\dfrac12$. Định lý này rất hiệu quả với tổng tích lũy và trung bình Cesàro $\\left(\\lim\\dfrac{a_1+\\dots+a_n}{n}=\\lim a_n\\right)$.',
    },
  ],
}
