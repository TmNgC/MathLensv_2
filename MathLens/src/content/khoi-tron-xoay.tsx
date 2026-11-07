import { lazy, Suspense } from 'react'
import type { Lesson } from './types'
import { revolutionTheory } from './theory'

/** three.js weighs ~1MB — only load it when this lesson opens. */
const RevolutionScene = lazy(() =>
  import('../lessons/RevolutionLesson').then((m) => ({ default: m.RevolutionScene })),
)

const Scene = (props: { step: number }) => (
  <Suspense fallback={<div className="absolute inset-0 grid place-items-center text-dim">đang tải…</div>}>
    <RevolutionScene {...props} />
  </Suspense>
)

export const revolutionLesson: Lesson = {
  id: 'khoi-tron-xoay',
  number: 8,
  title: 'Khối tròn xoay',
  subtitle: 'Khi đường cong quay quanh trục',
  kind: 'geo3d',
  accent: '#ffd35c',
  glyph: '◉',
  steps: [
    {
      title: 'Một đường cong trong không gian',
      body:
        'Hãy tưởng tượng một chiếc lọ hoa: nó được sinh ra từ một đường cong $y=f(x)$ quay tròn quanh trục $Ox$. Cửa sổ này là không gian ba chiều thật — hãy **kéo chuột** để xoay góc nhìn, lăn con lăn để phóng to!',
      duration: 8,
    },
    {
      title: 'Quay một vòng: $\\varphi : 0 \\to 2\\pi$',
      body:
        'Đường cong vàng bắt đầu quay. Mỗi điểm của nó vạch nên một đường tròn bán kính $f(x)$ — và toàn bộ đường cong quét nên một bề mặt: mặt tròn xoay. Khối bên trong bề mặt đó chính là khối tròn xoay.',
      duration: 10,
    },
    {
      title: 'Phương pháp đĩa',
      body:
        'Để tính thể tích, cắt khối thành $n$ đĩa mỏng vuông góc với trục. Đĩa tại vị trí $x$ là hình trụ bán kính $f(x)$, cao $\\Delta x$, thể tích $\\pi f(x)^2 \\Delta x$. Cộng lại: $V \\approx \\sum \\pi f(x_i)^2 \\Delta x$.',
      duration: 12,
    },
    {
      title: 'Một lát cắt sống',
      body:
        'Nhìn riêng một lát: thiết diện vuông góc với trục tại $x$ là hình tròn bán kính đúng bằng $f(x)$ — chỗ cong cao thì tròn to, chỗ cong thấp thì tròn nhỏ. Khối tròn xoay thực chất là \"xếp chồng vô số hình tròn\".',
      duration: 10,
    },
    {
      title: 'Từ tổng đến tích phân',
      body:
        'Cho $n \\to \\infty$: tổng thể tích các đĩa tiến về $V=\\pi\\int_a^b f(x)^2\\,dx$. Kéo thanh trượt và xem sai số teo dần về 0 — thêm một lần nữa, tích phân xuất hiện như giới hạn của một phép cộng!',
      duration: 12,
    },
  ],
  Scene,
  theory: revolutionTheory,
}
