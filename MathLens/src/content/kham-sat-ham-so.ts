import type { Lesson } from './types'
import { KhaoSatScene } from '../lessons/KhaoSatLesson'

/**
 * Bài "Khảo sát hàm số" — ứng dụng tổng hợp của đạo hàm.
 * Hàm mẫu: y = x³/3 − x² − 3x + 1 (cực trị + uốn), y = (2x+1)/(x−1) (tiệm cận).
 */
export const curveSketchingLesson: Lesson = {
  id: 'kham-sat',
  number: 6,
  title: 'Khảo sát hàm số',
  subtitle: 'Đạo hàm vẽ nên bức tranh hoàn cảnh.', 
  kind: 'calc',
  accent: '#ff9ecd',
  glyph: '∿',
  steps: [
    {
      title: 'Tư duy khảo sát',
      duration: 8,
      body:
        'Khảo sát là trả lời ba câu hỏi về một hàm số: nó đang đi lên hay đi xuống (hỏi $f\'$), nó cong về phía nào (hỏi $f^{\\prime\\prime}$), và chạy về đâu khi $x$ tiến tới vô cùng (hỏi giới hạn). Ba câu hỏi trên đã giúp học sinh phần nào hình dung được đồ thị.',
      funFact: {
        title: 'Khảo sát thời tiền đạo hàm',
        body:
          'Trước khi khái niệm đạo hàm ra đời, để biết khảo sát một đường cong, người ta lập bảng giá trị: thay hàng chục giá trị của $x$, tính tay hàng chục giá trị của $f(x)$, rồi nối các điểm lại. Khảo sát một hàm mất hàng giờ và sai số phụ thuộc vào độ kiên nhẫn. Đạo hàm biến toàn bộ công việc đó thành quy trình chỉ mất vài phút.',
      },
    },
    {
      title: 'Dấu f′',
      duration: 9,
      body:
        'Trên khoảng nào $f\' > 0$ thì $f$ đồng biến (đường đi lên, tô xanh); $f\' < 0$ thì nghịch biến (tô đỏ). Với hàm mẫu, $f\'(x)=x^2-2x-3=(x+1)(x-3)$: âm giữa hai nghiệm, dương ngoài — đồ thị lên, xuống, lên. Bên phải chính là đường parabol của $f\'$: dấu của nó đọc được ngay từ vị trí so với trục hoành.',
      funFact: {
        title: 'Fermat tìm cực đại từ 1638',
        body:
          'Trước cả khi Newton và Leibniz sinh ra khái niệm đạo hàm, Fermat đã có "thủ thuật" riêng: đặt đạo hàm bằng 0 để tìm cực đại, cực tiểu. Ông gợi ý rằng tại đỉnh của đường cong, độ dốc phải bằng không — dù không có khái niệm giới hạn để nói điều đó chặt chẽ. Đó là lý do điều kiện $f\'(x_0)=0$ hôm nay vẫn mang tinh thần của Fermat.',
      },
    },
    {
      title: 'Cực trị',
      duration: 9,
      body:
        'Ứng viên cực trị nằm tại nghiệm của $f\'(x)=0$. Kiểm tra nhanh bằng $f^{\\prime\\prime}$: nếu $f^{\\prime\\prime}(x_0)<0$ thì $x_0$ là cực đại, nếu $f^{\\prime\\prime}(x_0)>0$ thì cực tiểu. Xem tiếp tuyến quét qua đồ thị: nó nghiêng dần, nằm ngang đúng tại đỉnh, rồi nghiêng ngược lại — "phẳng" tại đúng khoảnh khắc đổi chiều.',
      funFact: {
        title: 'Bài toán cái hộp',
        body:
          'Bài toán ứng dụng kinh điển của cực trị: cắt bốn góc vuông cạnh $x$ từ tấm bìa vuông rồi gấp thành hộp không nắp. Thể tích $V(x)$ là hàm lập phương, có $V\'(x)=0$ tại đúng một điểm cho hộp to nhất. Mọi cuốn sách giải tích trên thế giới đều có bài này để cho thấy ứng dụng mạnh mẽ của cực trị trong đời sống.',
      },
    },
    {
      title: 'Tiệm cận',
      duration: 9,
      body:
        'Với hàm phân thức, thêm một câu hỏi: giá trị cấm và hành vi ở vô cực. $y=\\dfrac{2x+1}{x-1}$ bùng nổ khi $x\\to1$: tiệm cận đứng $x=1$. Khi $x\\to\\pm\\infty$, hàm tiến về $2$: tiệm cận ngang $y=2$. Lưu ý: đồ thị KHÔNG bao giờ cắt tiệm cận đứng, nhưng hoàn toàn CÓ THỂ cắt tiệm cận ngang/xiên ở phần hữu hạn — tiệm cận ngang chỉ mô tả xu hướng khi tiến ra vô cực.',
      funFact: {
        title: 'Asymptote — "không bao giờ rơi xuống trùng"',
        body:
          'Từ "tiệm cận" (asymptote) do Apollonius đặt từ thời Hy Lạp cổ. Hơn hai nghìn năm sau, khái niệm này được định nghĩa chặt chẽ bằng giới hạn. Nhiều người lầm tưởng đồ thị "không bao giờ chạm" tiệm cận, nhưng thực tế với hàm như $y = \\frac{\\sin x}{x}$, nó cắt tiệm cận ngang $y=0$ vô số lần trước khi tắt dần!',
      },
    },
    {
      title: 'Bảng biến thiên',
      duration: 9,
      body:
        'Toàn bộ thông tin khảo sát gói trong bảng biến thiên: dòng $x$ ghi các điểm đến hạn, dòng $f\'$ ghi dấu, dòng $f$ vẽ mũi tên lên xuống kèm giá trị cực trị. Bảng biến thiên là "tóm tắt khái quát" của đồ thị.',
      funFact: {
        title: 'Bảng biến thiên kiểu Pháp',
        body:
          'Bảng biến thiên (tableau de variations) là nét đặc trưng của trường phái dạy toán Pháp — Việt Nam kế thừa qua chương trình giáo dục, nên học sinh Việt quen thuộc với nó hơn cả nước Anh hay Mỹ, nơi người ta vẽ "sign diagram" đơn giản hơn. Đây là một trong những di sản giáo dục còn lại từ ảnh hưởng Pháp ở Việt Nam.',
      },
    },
    {
      title: 'Quy trình sáu bước',
      duration: 8,
      body:
        'Tập xác định → nghiệm của $f\'$ và $f^{\\prime\\prime}$ → chiều biến thiên và cực trị → lồi lõm và điểm uốn → tiệm cận → giao trục và vẽ đồ thị. Sáu bước, một bức tranh hoàn chỉnh. Sang Phòng thí nghiệm nhập hàm khác và tự khảo sát — quy trình không đổi.',
    },
  ],
  Scene: KhaoSatScene,
  theory: [
    {
      heading: 'Từ bảng giá trị đến bảng biến thiên',
      kind: 'history',
      body:
        'Trước giải tích, "khảo sát" một hàm số là lập bảng giá trị: tính $f$ tại nhiều điểm rồi nối. Fermat (1638) đưa ra thủ thuật đặt đạo hàm bằng 0 để tìm cực trị — trước cả khi đạo hàm được định nghĩa chặt chẽ. Thế kỷ 19, quy trình khảo sát chuẩn hóa thành thuật toán đọc toàn bộ hành vi hàm số từ hai đạo hàm, và bảng biến thiên — sản phẩm của trường phái giáo dục Pháp — trở thành công cụ trình bày chuẩn mà chương trình Việt Nam kế thừa đến hôm nay.',
    },
    {
      heading: 'Quy trình sáu bước',
      kind: 'def',
      body:
        'Một bài khảo sát hàm số đầy đủ đi qua sáu bước: (1) tìm tập xác định; (2) tính $f\'$, $f^{\\prime\\prime}$ và tìm nghiệm của chúng; (3) lập bảng biến thiên — chiều biến thiên và cực trị; (4) lồi lõm và điểm uốn; (5) tiệm cận nếu hàm là phân thức; (6) tìm giao điểm với trục và vẽ đồ thị đối chiếu với bảng. Trình tự này áp dụng cho mọi hàm số sơ cấp trong chương trình.',
    },
    {
      heading: 'Chiều biến thiên và cực trị',
      kind: 'def',
      body:
        'Chiều biến thiên: $f\'(x)>0$ trên khoảng thì $f$ đồng biến, $f\'(x)<0$ thì nghịch biến. Điều kiện cực trị: $f\'(x_0)=0$ và $f\'$ đổi dấu qua $x_0$. Kiểm tra nhanh bằng đạo hàm cấp hai: nếu $f\'(x_0)=0$ và $f^{\\prime\\prime}(x_0)<0$ thì $x_0$ là điểm cực đại; nếu $f^{\\prime\\prime}(x_0)>0$ thì cực tiểu. Lưu ý $f\'(x_0)=0$ chỉ là điều kiện cần — với $f(x)=x^3$, $f\'(0)=0$ nhưng không có cực trị vì $f\'$ không đổi dấu.',
      table: [
        { sym: '$f\'(x_0) = 0$, $f\'$ đổi dấu $-$ thành $+$', meaning: '$x_0$ là điểm cực tiểu' },
        { sym: '$f\'(x_0) = 0$, $f\'$ đổi dấu $+$ thành $−$', meaning: '$x_0$ là điểm cực đại' },
        { sym: '$f\'(x_0) = 0$, $f^{\\prime\\prime}(x_0) > 0$', meaning: 'cực tiểu (kiểm tra bằng cấp hai)' },
        { sym: '$f\'(x_0) = 0$, $f^{\\prime\\prime}(x_0) < 0$', meaning: 'cực đại (kiểm tra bằng cấp hai)' },
      ],
    },
    {
      heading: 'Lồi, lõm và điểm uốn',
      kind: 'def',
      body:
        'Trên khoảng nào $f^{\\prime\\prime}(x)>0$ thì đồ thị lồi ("mỉm cười"), $f^{\\prime\\prime}(x)<0$ thì đồ thị lõm. Điểm $I(x_0; f(x_0))$ là điểm uốn nếu $f^{\\prime\\prime}$ đổi dấu qua $x_0$ — khi đó tiếp tuyến tại $I$ cắt qua đồ thị. Cách tìm: giải $f^{\\prime\\prime}(x)=0$ rồi kiểm tra đổi dấu của $f^{\\prime\\prime}$ quanh mỗi nghiệm.',
    },
    {
      heading: 'Tiệm cận',
      kind: 'def',
      body:
        'Tiệm cận đứng: đường $x=a$ khi $\\lim\\limits_{x\\to a^+}f(x)=\\pm\\infty$ hoặc $\\lim\\limits_{x\\to a^-}f(x)=\\pm\\infty$ — thường xảy ra tại nghiệm của mẫu thức (tử khác 0) với hàm phân thức. Tiệm cận ngang: đường $y=b$ khi $\\lim\\limits_{x\\to\\pm\\infty}f(x)=b$. Tiệm cận xiên $y=ax+b$ ($a\\ne0$) khi bậc tử hơn mẫu đúng một: $a=\\lim\\dfrac{f(x)}{x}$, $b=\\lim[f(x)-ax]$. Ví dụ $y=\\dfrac{x^2+1}{x-1}$ có tiệm cận xiên $y=x+1$.',
      table: [
        { sym: '$x = a$', meaning: 'tiệm cận đứng — hàm bùng nổ gần $a$' },
        { sym: '$y = b$', meaning: 'tiệm cận ngang — hàm tiệm cận hằng số ở vô cùng' },
        { sym: '$y = ax + b$', meaning: 'tiệm cận xiên — hàm "chạy theo" một đường thẳng' },
      ],
    },
    {
      heading: 'Khảo sát trọn vẹn y = x³/3 − x² − 3x + 1',
      kind: 'example',
      body:
        'Tập xác định $\\mathbb{R}$. $y\'=x^2-2x-3=(x+1)(x-3)$, nghiệm $x=-1$ và $x=3$. $y^{\\prime\\prime}=2x-2$, nghiệm $x=1$. Bảng biến thiên: đồng biến trên $(-\\infty;-1)$ và $(3;+\\infty)$, nghịch biến trên $(-1;3)$; cực đại $y(-1)=\\frac83$, cực tiểu $y(3)=-8$. Điểm uốn $(1;-\\frac83)$ vì $y^{\\prime\\prime}$ đổi dấu. Hàm đa thức nên không có tiệm cận. Giao trục $Oy$: $(0;1)$; giao trục $Ox$: giải $y=0$.',
    },
    {
      heading: 'Phân thức y = (2x+1)/(x−1)',
      kind: 'example',
      body:
        'Tập xác định $\\mathbb{R}\\setminus\\{1\\}$. Tiệm cận đứng $x=1$ vì mẫu bằng 0 tại đó; tiệm cận ngang $y=2$ vì $\\lim\\limits_{x\\to\\pm\\infty}\\frac{2x+1}{x-1}=2$ (tỉ số hệ số bậc cao nhất). Giao $Oy$: $(0;-1)$; giao $Ox$: $\\left(-\\frac12;0\\right)$. Chú ý nhánh trái tiến về $-\\infty$ khi $x\\to1^-$ còn nhánh phải bùng lên $+\\infty$ khi $x\\to1^+$ — hai phía của tiệm cận đứng có thể trái dấu nhau.',
    },
    {
      heading: 'Sai lầm thường gặp',
      kind: 'warn',
      body:
        '1) Kết luận cực trị chỉ vì $f\'(x_0)=0$ — phải kiểm tra $f\'$ đổi dấu hoặc dùng $f^{\\prime\\prime}$; phản ví dụ $y=x^3$ tại $x=0$. 2) Mẫu bằng 0 nhưng tử cũng bằng 0 — chưa vội kết luận tiệm cận đứng, phải rút gọn trước. 3) Điểm uốn đòi hỏi $f^{\\prime\\prime}$ đổi dấu, không chỉ $f^{\\prime\\prime}(x_0)=0$ — hàm bậc bốn $y=x^4$ có $y^{\\prime\\prime}(0)=0$ nhưng không uốn. 4) Quên kiểm tra cả hai phía của tiệm cận đứng và cả hai chiều $+\\infty$, $-\\infty$ của tiệm cận ngang.',
    },
  ],
}
