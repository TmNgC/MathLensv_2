import { lazy, Suspense } from 'react'
import type { Lesson } from './types'
import { crossSectionTheory } from './theory'

/** three.js weighs ~1MB — only load it when this lesson opens. */
const CrossSectionScene = lazy(() =>
  import('../lessons/CrossSectionLesson').then((m) => ({ default: m.CrossSectionScene })),
)

const Scene = (props: { step: number }) => (
  <Suspense fallback={<div className="absolute inset-0 grid place-items-center text-dim">đang tải…</div>}>
    <CrossSectionScene {...props} />
  </Suspense>
)

export const crossSectionLesson: Lesson = {
  id: 'thiet-dien',
  number: 9,
  title: 'Thiết diện',
  subtitle: 'Cắt lát khối không gian & nguyên lý Cavalieri',
  kind: 'geo3d',
  accent: '#97e3a2',
  glyph: '◫',
  steps: [
    {
      title: 'Thiết diện là gì?',
      body:
        'Cắt một khối trụ bằng mặt phẳng vuông góc với trục: thiết diện là hình tròn bán kính $R$ — và giống hệt nhau ở mọi độ cao. Mẹo của cả bài này: nếu biết hình dạng của mọi lát cắt, ta có thể \"ghép\" lại toàn bộ khối — và tính thể tích của nó.',
      duration: 8,
    },
    {
      title: 'Hình nón: lát cắt co dần',
      body:
        'Cắt hình nón cao $H$, bán kính đáy $R$: ở độ cao $h$, lát là hình tròn bán kính $r(h)=R\\left(1-\\frac{h}{H}\\right)$ — càng lên cao càng nhỏ. Thể tích là tổng các lát: $V=\\int_0^H S(h)\\,dh=\\int_0^H \\pi r(h)^2\\,dh=\\frac{1}{3}\\pi R^2 H$. Công thức quen thuộc được \"sinh ra\" ngay trước mắt bạn!',
      duration: 12,
    },
    {
      title: 'Nguyên lý Cavalieri',
      body:
        'Hai khối (teal và tím) được ghép từ đúng một số đồng xu như nhau — chỉ khác cách xếp lệch. Tại mọi độ cao, tổng diện tích tiết diện của chúng bằng nhau. Cavalieri kết luận: thể tích bằng nhau! Điều kiện duy nhất: $S_1(h)=S_2(h)$ với mọi $h$ — hình dáng bên ngoài không quan trọng.',
      duration: 12,
    },
    {
      title: 'Bán cầu — khoảnh khắc đẹp nhất',
      body:
        'Cắt bán cầu bán kính $R$: ở độ cao $h$, bán kính lát cắt là $r(h)=\\sqrt{R^2-h^2}$. Tích phân ngay: $V=\\int_0^R \\pi(R^2-h^2)\\,dh=\\frac{2}{3}\\pi R^3$ — và khối cầu trọn vẹn là $\\frac{4}{3}\\pi R^3$. Xem số thể tích tích lũy chạy dần về đúng giá trị ấy.',
      duration: 12,
    },
  ],
  Scene,
  theory: crossSectionTheory,
}
