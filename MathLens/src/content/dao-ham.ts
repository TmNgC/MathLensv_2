import type { Lesson } from './types'
import { DerivativeScene } from '../lessons/DerivativeLesson'
import { derivativeTheory } from './theory'

export const derivativeLesson: Lesson = {
  id: 'dao-ham',
  number: 4,
  title: 'Đạo hàm',
  subtitle: 'Độ dốc tức thời & hàm phái sinh',
  kind: 'calc',
  accent: '#58c4dd',
  glyph: 'ƒ′',
  steps: [
    {
      title: 'Cát tuyến — đường cắt đồ thị',
      body:
        'Hai điểm $A$ và $B$ nằm trên đồ thị $y=f(x)$. Đường thẳng nối chúng gọi là cát tuyến, với độ dốc $\\frac{\\Delta y}{\\Delta x}$ — mức thay đổi trung bình của $f$ khi đi từ $A$ tới $B$. Hãy kéo điểm $B$ dọc theo đồ thị và quan sát bảng số liệu.',
      duration: 10,
    },
    {
      title: 'Cho $B$ trượt về $A$',
      body:
        'Giữ $A$ cố định, cho $B$ tiến dần về phía $A$: $\\Delta x \\to 0$. Độ dốc của cát tuyến tiến về một giá trị duy nhất — đó là độ dốc thực sự của đồ thị ngay tại điểm $A$.',
      duration: 8,
    },
    {
      title: 'Tiếp tuyến và đạo hàm',
      body:
        'Khi $\\Delta x \\to 0$, cát tuyến trở thành tiếp tuyến — đường thẳng \"chạm nhẹ\" vào đồ thị tại $A$. Độ dốc này có tên riêng là đạo hàm của $f$ tại $a$: $f\'(a)=\\lim_{\\Delta x \\to 0}\\frac{f(a+\\Delta x)-f(a)}{\\Delta x}$. Thử kéo $A$ dọc đồ thị xem!',
      duration: 6,
    },
    {
      title: 'Từ tiếp tuyến đến hàm số $f\'$',
      body:
        'Giờ ta trượt điểm tiếp xúc liên tục từ trái sang phải (cửa sổ trái) và ghi lại độ dốc tại từng vị trí. Tập hợp những giá trị $f\'(x)$ ấy vẽ nên một đồ thị hoàn toàn mới (cửa sổ phải) — đồ thị của hàm phái sinh $f\'$, chiếc \"máy đo độ dốc\" của $f$.',
      duration: 12,
    },
    {
      title: 'Đọc vị cực trị từ $f\'$',
      body:
        'Đồ thị $f$ đi lên đúng ở nơi $f\' > 0$ và đi xuống ở nơi $f\' < 0$. Vậy tại đỉnh và đáy, tiếp tuyến nằm ngang — tức $f\'(x) = 0$. Đây chính là chìa khóa tìm cực đại, cực tiểu..',
      duration: 12,
    },
  ],
  Scene: DerivativeScene,
  theory: derivativeTheory,
}
