import type { Lesson } from './types'
import { IntegralScene } from '../lessons/IntegralLesson'
import { integralTheory } from './theory'

export const integralLesson: Lesson = {
  id: 'tich-phan',
  number: 7,
  title: 'Tích phân',
  subtitle: 'Từ lát cắt đến định lý cơ bản',
  kind: 'calc',
  accent: '#5cd6c0',
  glyph: '∫',
  steps: [
    {
      title: 'Bài toán diện tích',
      body:
        'Từ thời Archimedes, con người đã hỏi: làm sao tính chính xác diện tích của một vùng bị giới hạn bởi đường cong? Hãy kéo hai mép $a$ và $b$ — và thử đoán xem vùng màu này rộng bao nhiêu?',
      duration: 8,
    },
    {
      title: 'Cắt lát như chiếc bánh',
      body:
        'Ý tưởng: chia $[a,b]$ thành $n$ dải nhỏ, mỗi dải thay bằng hình chữ nhật cao $f(x_i)$. Tổng diện tích là $S_n=\\sum f(x_i)\\,\\Delta x$. Khi $n$ còn nhỏ, kết quả thô bậc — nhưng hãy xem điều gì xảy ra khi số dải tăng dần.',
      duration: 9,
    },
    {
      title: 'Cho $n \\to \\infty$',
      body:
        'Dải càng mảnh, tổng $S_n$ càng tiến về một giá trị duy nhất — chính là diện tích thật của vùng cong. Giá trị giới hạn đó gọi là tích phân xác định: $\\int_a^b f(x)\\,dx=\\lim_{n\\to\\infty}\\sum f(x_i)\\,\\Delta x$. Thử đổi cách lấy mẫu ở thanh công cụ và so sánh tốc độ hội tụ!',
      duration: 12,
    },
    {
      title: 'Khi $f$ xuống dưới trục hoành',
      body:
        'Điều gì xảy ra nếu đồ thị chìm dưới trục $Ox$? Hình chữ nhật nằm dưới trục có chiều cao âm — nên diện tích của nó bị trừ đi. Đó là diện tích có dấu: $\\int_a^b f = A_+ - A_-$, với $A_+$ là phần trên trục, $A_-$ là phần dưới. Đây là nội dung được kiểm tra thường xuyên trong các bài thi.',
      duration: 10,
    },
    {
      title: 'Hàm tích lũy $A(x)$',
      body:
        'Đặt $A(x)$ là diện tích tích lũy từ $0$ tới $x$. Khi $x$ trượt từ trái sang phải, $A(x)$ vẽ nên một đường cong hoàn toàn mới (cửa sổ phải). Chú ý: chỗ $f$ cao thì $A$ leo nhanh, chỗ $f$ thấp thì $A$ leo chậm.',
      duration: 12,
    },
    {
      title: 'Định lý cơ bản của giải tích',
      body:
        'Vẽ tiếp tuyến lên đồ thị $A$ tại vị trí $x$: độ dốc của tiếp tuyến đúng bằng $f(x)$! Nói cách khác $A\'(x)=f(x)$ — tích phân và đạo hàm là hai phép toán ngược nhau. Đây là định lý quan trọng nhất của giải tích, và bạn vừa được nhìn thấy nó diễn ra.',
      duration: 12,
    },
    {
      title: 'Từ vận tốc đến quãng đường',
      body:
        'Giải tích ra đời từ vật lý. Nếu $v(t)$ là đồ thị vận tốc thì quãng đường chính là diện tích nằm dưới đồ thị: chỗ xe chạy nhanh (cột cao) thì diện tích dồn nhanh, xe bứt đi; chỗ chậm thì xe lết. Chiếc xe bên dưới chạy đúng theo diện tích tích lũy $s(t)=\\int_0^t v\\,dt$.',
      duration: 12,
    },
    {
      title: 'Nguyên hàm — chìa khóa tính nhanh',
      body:
        'Không ai ngồi cộng vô số hình chữ nhật! Định lý cơ bản cho lối thoát: tìm $F$ sao cho $F\'=f$ (gọi là nguyên hàm), khi đó $\\int_a^b f(x)\\,dx = F(b)-F(a)$ — chỉ cần trừ hai số. Với hàm trong bài, $F(x)=x-0.75\\cos(1.2x)+\\frac{x^2}{10}$: nhẩm nguyên hàm, thay $a$, $b$ vào là xong!',
      duration: 10,
    },
  ],
  Scene: IntegralScene,
  theory: integralTheory,
}
