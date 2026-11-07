import type { QuizQuestion } from './types'

/**
 * Offline question bank — used when the AI endpoint is unreachable or no
 * API key is configured. Same shape the serverless generator returns.
 */
export const FALLBACK_BANK: QuizQuestion[] = [
  // ---------- Tiền giải tích ----------
  {
    id: 'tg-1',
    lessonId: 'tien-giai-tich',
    skillTag: 'miền xác định',
    question: 'Miền xác định của hàm số $f(x)=\\dfrac{1}{x-2}$ là?',
    options: [
      '$\\mathbb{R}$',
      '$\\mathbb{R} \\setminus \\{2\\}$',
      '$[2; +\\infty)$',
      '$(-\\infty; 2)$',
    ],
    correctIndex: 1,
    explanation:
      'Phân thức chỉ yêu cầu mẫu khác 0: $x - 2 \\ne 0 \\Leftrightarrow x \\ne 2$. Miền xác định là mọi số thực trừ 2.',
  },
  {
    id: 'tg-2',
    lessonId: 'tien-giai-tich',
    skillTag: 'hàm hợp',
    question:
      'Cho $f(x)=x+1$ và $g(x)=x^2$. Khi đó hàm hợp $(g \\circ f)(x)$ bằng?',
    options: ['$x^2 + 1$', '$(x+1)^2$', '$x^2 + x + 1$', '$2x + 1$'],
    correctIndex: 1,
    explanation:
      'Hàm hợp lấy đầu ra của $f$ làm đầu vào của $g$: $(g \\circ f)(x) = g(f(x)) = g(x+1) = (x+1)^2$. Thứ tự quan trọng: $(f \\circ g)(x) = x^2 + 1$ là hàm khác.',
  },
  {
    id: 'tg-3',
    lessonId: 'tien-giai-tich',
    skillTag: 'hàm ngược',
    question: 'Hàm số ngược của $y = 2x + 3$ là?',
    options: [
      '$y = 2x - 3$',
      '$y = \\dfrac{x - 3}{2}$',
      '$y = \\dfrac{x + 3}{2}$',
      '$y = \\dfrac{1}{2x + 3}$',
    ],
    correctIndex: 1,
    explanation:
      'Đổi vai trò $x \\leftrightarrow y$: $x = 2y + 3 \\Rightarrow y = \\frac{x-3}{2}$. Kiểm tra: $f^{-1}(f(x)) = \\frac{(2x+3)-3}{2} = x$ — trả đúng đầu vào ban đầu.',
  },
  // ---------- Giới hạn ----------
  {
    id: 'gh-1',
    lessonId: 'gioi-han',
    skillTag: 'giới hạn dãy số',
    question: 'Tính $\\lim_{n\\to\\infty}\\frac{2n^2+1}{n^2-3}$?',
    options: ['$0$', '$2$', '$+\\infty$', '$\\frac{1}{3}$'],
    correctIndex: 1,
    explanation:
      'Tử và mẫu cùng bậc 2 nên giới hạn bằng tỉ số hệ số bậc cao nhất: $\\frac{2}{1}=2$. Hoặc chia cả tử và mẫu cho $n^2$.',
  },
  {
    id: 'gh-2',
    lessonId: 'gioi-han',
    skillTag: 'giới hạn nổi tiếng',
    question: '$\\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n$ bằng bao nhiêu?',
    options: ['$1$', '$2$', '$e\\approx 2{,}71828$', '$+\\infty$'],
    correctIndex: 2,
    explanation:
      'Đây chính là định nghĩa của số $e$ — "lãi kép 100% chia thành $n$ kỳ" không bao giờ vượt qua $e$.',
  },
  {
    id: 'gh-3',
    lessonId: 'gioi-han',
    skillTag: 'hội tụ & phân kỳ',
    question: 'Chuỗi $1+\\frac{1}{2}+\\frac{1}{3}+\\frac{1}{4}+\\dots$ (chuỗi điều hòa) có tính chất gì?',
    options: [
      'Hội tụ về 2',
      'Hội tụ về một số nhỏ hơn 10',
      'Phân kỳ — tổng tăng không ngừng',
      'Hội tụ về $e$',
    ],
    correctIndex: 2,
    explanation:
      'Mặc dù các số hạng nhỏ dần về 0, tổng vẫn phân kỳ (Oresme, thế kỷ 14). Cần hơn 12.000 số hạng mới vượt 10 — chậm nhưng không bao giờ dừng. Chuỗi $1+\\frac12+\\frac14+\\dots$ mới hội tụ về 2.',
  },
  // ---------- Đạo hàm ----------
  {
    id: 'dh-1',
    lessonId: 'dao-ham',
    skillTag: 'bảng đạo hàm',
    question: 'Cho $f(x)=x^3$. Tính $f\'(2)$?',
    options: ['$6$', '$8$', '$12$', '$4$'],
    correctIndex: 2,
    explanation: '$f\'(x)=3x^2$ nên $f\'(2)=3\\cdot4=12$. Đạo hàm cho độ dốc tiếp tuyến, không phải giá trị hàm số.',
  },
  {
    id: 'dh-2',
    lessonId: 'dao-ham',
    skillTag: 'cực trị',
    question: 'Biết $f\'(x_0)=0$. Kết luận nào CHÍNH XÁC?',
    options: [
      '$x_0$ chắc chắn là điểm cực trị',
      'Hàm số đạt cực tiểu tại $x_0$',
      'Chưa đủ kết luận — cần xét dấu $f\'$ đổi qua $x_0$',
      'Hàm số không có cực trị',
    ],
    correctIndex: 2,
    explanation:
      '$f\'(x_0)=0$ chỉ là điều kiện CẦN. Ví dụ $f(x)=x^3$ có $f\'(0)=0$ nhưng không có cực trị tại 0 vì $f\'$ không đổi dấu.',
  },
  {
    id: 'dh-3',
    lessonId: 'dao-ham',
    skillTag: 'quy tắc chuỗi',
    question: 'Đạo hàm của $y=\\sin(3x)$ là?',
    options: ['$\\cos(3x)$', '$3\\cos(3x)$', '$-3\\cos(3x)$', '$3\\cos x$'],
    correctIndex: 1,
    explanation:
      'Quy tắc chuỗi: $(f(g(x)))\'=f\'(g(x))\\cdot g\'(x)$. Ở đây $f=\\sin$, $g=3x$ nên kết quả là $\\cos(3x)\\cdot 3$. Quên nhân $g\'$ là lỗi phổ biến nhất!',
  },
  // ---------- Khảo sát hàm số ----------
  {
    id: 'ks-1',
    lessonId: 'kham-sat',
    skillTag: 'cực trị',
    question:
      'Hàm số $y=\\dfrac{x^3}{3}-x^2-3x+1$ đạt cực đại tại điểm nào?',
    options: ['$x = -1$', '$x = 3$', '$x = 1$', '$x = -3$'],
    correctIndex: 0,
    explanation:
      '$y\'=x^2-2x-3=(x+1)(x-3)$, nghiệm $x=-1$ và $x=3$. $y^{\\prime\\prime}(-1)=-4<0$ nên $x=-1$ là điểm cực đại (còn $y^{\\prime\\prime}(3)=4>0$ — cực tiểu).',
  },
  {
    id: 'ks-2',
    lessonId: 'kham-sat',
    skillTag: 'tiệm cận',
    question:
      'Đồ thị hàm số $y=\\dfrac{2x+1}{x-1}$ có tiệm cận đứng là đường nào?',
    options: ['$x = 1$', '$x = -\\dfrac{1}{2}$', '$y = 2$', '$x = 0$'],
    correctIndex: 0,
    explanation:
      'Tiệm cận đứng xảy ra tại nghiệm của mẫu: $x-1=0\\Leftrightarrow x=1$ (tử $\\ne0$ tại đó). $y=2$ là tiệm cận NGANG, $x=-\\frac12$ là giao điểm với trục $Ox$ — ba khái niệm dễ nhầm.',
  },
  {
    id: 'ks-3',
    lessonId: 'kham-sat',
    skillTag: 'điểm uốn',
    question:
      'Để điểm $I(x_0;\\,f(x_0))$ là điểm uốn của đồ thị $y=f(x)$, điều kiện cần là gì?',
    options: [
      '$f^{\\prime\\prime}(x_0) = 0$ là đủ',
      '$f^{\\prime\\prime}$ đổi dấu qua $x_0$',
      '$f\'(x_0) = 0$',
      '$f$ đạt cực trị tại $x_0$',
    ],
    correctIndex: 1,
    explanation:
      'Điểm uốn đòi hỏi đạo hàm cấp hai ĐỔI DẤU qua $x_0$ — $f^{\\prime\\prime}(x_0)=0$ một mình chưa đủ: $y=x^4$ có $y^{\\prime\\prime}(0)=0$ nhưng không có điểm uốn.',
  },
  // ---------- Tích phân ----------
  {
    id: 'tp-1',
    lessonId: 'tich-phan',
    skillTag: 'nguyên hàm cơ bản',
    question: 'Tính $\\int_0^2 (x^2+1)\\,dx$?',
    options: ['$\\frac{14}{3}$', '$6$', '$\\frac{10}{3}$', '$4$'],
    correctIndex: 0,
    explanation:
      'Nguyên hàm $F(x)=\\frac{x^3}{3}+x$; $F(2)-F(0)=\\frac83+2=\\frac{14}{3}$. Định lý cơ bản: $\\int_a^b f = F(b)-F(a)$.',
  },
  {
    id: 'tp-2',
    lessonId: 'tich-phan',
    skillTag: 'diện tích có dấu',
    question:
      'Trên $[a,b]$, đồ thị $f$ có đoạn nằm dưới trục $Ox$. Khi đó $\\int_a^b f(x)\\,dx$ cho ta điều gì?',
    options: [
      'Tổng diện tích hình học (mọi phần đều dương)',
      'Diện tích có dấu — phần dưới trục bị TRỪ đi',
      'Chỉ diện tích phần trên trục',
      'Chu vi của hình',
    ],
    correctIndex: 1,
    explanation:
      'Hình chữ nhật nằm dưới trục có chiều cao âm nên đóng góp âm vào tích phân. Muốn diện tích hình học: tách khoảng theo nghiệm $f(x)=0$ rồi lấy $\\left|\\int\\right|$ từng đoạn.',
  },
  {
    id: 'tp-3',
    lessonId: 'tich-phan',
    skillTag: 'định lý cơ bản',
    question: 'Nếu $F\'(x)=f(x)$ thì $\\int_a^b f(x)\\,dx$ bằng?',
    options: ['$F(a)-F(b)$', '$F(a)+F(b)$', '$F(b)-F(a)$', '$f(b)-f(a)$'],
    correctIndex: 2,
    explanation:
      'Định lý cơ bản của giải tích: tích phân và đạo hàm là hai phép ngược nhau — chỉ cần trừ hai số $F(b)-F(a)$. Sai dấu ($F(a)-F(b)$) là một lỗi phổ biến trong bài kiểm tra.',
  },
  // ---------- Khối tròn xoay ----------
  {
    id: 'ktx-1',
    lessonId: 'khoi-tron-xoay',
    skillTag: 'thể tích tròn xoay',
    question:
      'Cho $y=\\sqrt{x}$ trên $[0;4]$ quay quanh trục $Ox$. Thể tích khối tròn xoay bằng?',
    options: ['$4\\pi$', '$8\\pi$', '$16\\pi$', '$\\frac{16\\pi}{3}$'],
    correctIndex: 1,
    explanation:
      '$V=\\pi\\int_0^4(\\sqrt{x})^2dx=\\pi\\int_0^4x\\,dx=\\pi\\cdot\\frac{16}{2}=8\\pi$. Nhớ bình phương hàm trước khi tích phân!',
  },
  {
    id: 'ktx-2',
    lessonId: 'khoi-tron-xoay',
    skillTag: 'công thức thể tích',
    question: 'Công thức thể tích khi quay hình phẳng giới hạn bởi $y=f(x)\\ (f\\ge0)$, $Ox$, $x=a$, $x=b$ quanh $Ox$?',
    options: [
      '$V=\\pi\\int_a^b f(x)\\,dx$',
      '$V=\\int_a^b f^2(x)\\,dx$',
      '$V=\\pi\\int_a^b f^2(x)\\,dx$',
      '$V=\\left(\\pi\\int_a^b f(x)\\,dx\\right)^2$',
    ],
    correctIndex: 2,
    explanation:
      'Mỗi đĩa mỏng có thể tích $dV=\\pi f^2(x)\\,dx$ (bán kính $f(x)$ thì diện tích $\\pi f^2$). Cần cả hệ số $\\pi$ lẫn bình phương.',
  },
  {
    id: 'ktx-3',
    lessonId: 'khoi-tron-xoay',
    skillTag: 'thể tích tròn xoay',
    question: 'Quay $y=x^2$ trên $[0;2]$ quanh $Ox$, thể tích bằng?',
    options: ['$\\frac{32\\pi}{5}$', '$\\frac{8\\pi}{3}$', '$\\frac{16\\pi}{3}$', '$4\\pi$'],
    correctIndex: 0,
    explanation:
      '$V=\\pi\\int_0^2(x^2)^2dx=\\pi\\int_0^2x^4\\,dx=\\pi\\cdot\\frac{32}{5}$. Bình phương $x^2$ thành $x^4$ — nhiều bạn quên đúng ở bước này.',
  },
  // ---------- Thiết diện ----------
  {
    id: 'td-1',
    lessonId: 'thiet-dien',
    skillTag: 'công thức thiết diện',
    question: 'Công thức $V=\\int_a^b S(x)\\,dx$ (với $S(x)$ là diện tích thiết diện tại $x$) có ý nghĩa gì?',
    options: [
      'Cộng dồn vô số lát mỏng dày $dx$ để được thể tích',
      'Tính diện tích bề mặt khối',
      'Tìm trọng tâm của khối',
      'Tính chu vi thiết diện lớn nhất',
    ],
    correctIndex: 0,
    explanation:
      'Cắt khối thành lát dày vô cùng mỏng $dx$, mỗi lát có thể tích $S(x)\\,dx$ — cộng lại (tích phân) thành thể tích. Đây là ý tưởng thống nhất của mọi công thức thể tích.',
  },
  {
    id: 'td-2',
    lessonId: 'thiet-dien',
    skillTag: 'nguyên lý Cavalieri',
    question:
      'Hai khối nằm giữa hai mặt phẳng song song, mọi thiết diện tương ứng có diện tích bằng nhau. Theo nguyên lý Cavalieri?',
    options: [
      'Hai khối đồng dạng',
      'Hai khối có thể tích bằng nhau',
      'Hai khối có khối lượng bằng nhau',
      'Chưa kết luận được gì',
    ],
    correctIndex: 1,
    explanation:
      'Cavalieri: cùng diện tích thiết diện tại mọi độ cao ⇒ cùng thể tích — dù hình dáng ngoài khác hẳn (như hai chồng đồng xu: xếp thẳng và xếp lệch).',
  },
  {
    id: 'td-3',
    lessonId: 'thiet-dien',
    skillTag: 'thể tích nón',
    question:
      'Hình nón cao $H=3$, bán kính đáy $R=2$. Dùng $V=\\int_0^H\\pi R^2(1-\\frac{h}{H})^2dh$, thể tích bằng?',
    options: ['$4\\pi$', '$6\\pi$', '$12\\pi$', '$\\frac{8\\pi}{3}$'],
    correctIndex: 0,
    explanation:
      '$V=\\frac{1}{3}\\pi R^2H=\\frac13\\pi\\cdot4\\cdot3=4\\pi$. Tích phân các lát tròn co dần sinh ra đúng công thức nón quen thuộc $\\frac13\\pi R^2H$.',
  },
  // ---------- Quy tắc tính đạo hàm ----------
  {
    id: 'qt-1',
    lessonId: 'quy-tac-dao-ham',
    skillTag: 'quy tắc chuỗi',
    question: 'Đạo hàm của $f(x)=\\sqrt{x^2+1}$ là?',
    options: ['$\\frac{1}{2\\sqrt{x^2+1}}$', '$\\frac{x}{\\sqrt{x^2+1}}$', '$\\frac{2x}{\\sqrt{x^2+1}}$', '$\\sqrt{2x}$'],
    correctIndex: 1,
    explanation:
      'Chuỗi: lớp ngoài $\\sqrt{u}$ có đạo hàm $\\frac{u\'}{2\\sqrt{u}}$, với $u=x^2+1$, $u\'=2x$. Kết quả $\\frac{2x}{2\\sqrt{x^2+1}}=\\frac{x}{\\sqrt{x^2+1}}$.',
  },
  {
    id: 'qt-2',
    lessonId: 'quy-tac-dao-ham',
    skillTag: 'quy tắc tích & thương',
    question: 'Đạo hàm của $f(x)=x^2\\sin x$ là?',
    options: ['$2x\\cos x$', '$2x\\sin x+x^2\\cos x$', '$2x\\sin x-x^2\\cos x$', '$x^2\\cos x$'],
    correctIndex: 1,
    explanation:
      'Quy tắc tích: $(uv)\'=u\'v+uv\'$ — đạo hàm của tích bằng tổng hai số hạng "đạo hàm nhân": $(2x)(\\sin x)+(x^2)(\\cos x)$. Đáp án $2x\\sin x+x^2\\cos x$ — chú ý KHÔNG phải $u\'v\'$.',
  },
  // ---------- Giới hạn nâng cao ----------
  {
    id: 'ghnc-1',
    lessonId: 'gioi-han-nang-cao',
    skillTag: "quy tắc L'Hôpital",
    question: 'Tính $\\lim_{x\\to0}\\frac{\\ln(1+x)}{x}$ bằng L\'Hôpital. Kết quả là?',
    options: ['$0$', '$1$', '$e$', 'không tồn tại'],
    correctIndex: 1,
    explanation:
      'Dạng $\\frac00$ thỏa điều kiện: đạo hàm tử $\\frac{1}{1+x}$, đạo hàm mẫu $1$ → giới hạn $\\frac{1}{1+0}=1$. Đây cũng là một trong các giới hạn tiêu chuẩn nên ghi nhớ.',
  },
  {
    id: 'ghnc-2',
    lessonId: 'gioi-han-nang-cao',
    skillTag: "bẫy L'Hôpital",
    question: 'Xét $\\lim_{x\\to+\\infty}\\frac{x+\\sin x}{x}$. Khẳng định nào ĐÚNG?',
    options: [
      'L\'Hôpital cho $\\frac{1+\\cos x}{1}$ không giới hạn nên giới hạn gốc không tồn tại',
      'Giới hạn bằng 1 — không thể kết luận từ L\'Hôpital, nhưng viết $1+\\frac{\\sin x}{x}$ ra ngay kết quả',
      'Giới hạn bằng 0',
      'Phải dùng khai triển Taylor',
    ],
    correctIndex: 1,
    explanation:
      'Bẫy kinh điển: L\'Hôpital chỉ cho kết luận KHI giới hạn của $f\'/g\'$ tồn tại — ở đây nó không tồn tại, nhưng giới hạn gốc vẫn tồn tại: $\\frac{x+\\sin x}{x}=1+\\frac{\\sin x}{x}\\to1+0=1$.',
  },
  {
    id: 'ghnc-3',
    lessonId: 'gioi-han-nang-cao',
    skillTag: 'dãy truy hồi Weierstrass',
    question: 'Dãy $u_1=\\sqrt2$, $u_{n+1}=\\sqrt{2u_n}$. Nếu $(u_n)$ hội tụ về $L$ thì $L$ bằng?',
    options: ['$L=1$', '$L=2$', '$L=4$', '$L=\\sqrt2$'],
    correctIndex: 1,
    explanation:
      'Cho $n\\to\\infty$ trong công thức truy hồi: $L=\\sqrt{2L}$ ⇒ $L^2=2L$ ⇒ $L=0$ hoặc $L=2$. Dãy tăng từ $\\sqrt2$ nên loại 0 → $L=2$ (đúng như bước Zeno: nhân đôi mãi "gần" 2).',
  },
  // ---------- Dạng đề AP Calculus (tham khảo Varsity Tutors) ----------
  {
    id: 'ap-1',
    lessonId: 'dao-ham',
    skillTag: 'tiếp tuyến',
    question:
      'Viết phương trình tiếp tuyến của đồ thị $f(x)=x^3-2x$ tại điểm có hoành độ $x=1$?',
    options: ['$y=x-2$', '$y=x+2$', '$y=3x-2$', '$y=-x-2$'],
    correctIndex: 0,
    explanation:
      '$f(1)=1-2=-1$ và $f\'(x)=3x^2-2$ nên $f\'(1)=1$. Tiếp tuyến: $y=f(1)+f\'(1)(x-1)=-1+(x-1)=x-2$. Hai dữ kiện cần và đủ: tung độ điểm và độ dốc.',
  },
  {
    id: 'ap-2',
    lessonId: 'quy-tac-dao-ham',
    skillTag: 'quy tắc chuỗi',
    question: 'Đạo hàm của $y=\\sin\\left(2x^2\\right)$ là?',
    options: [
      '$4x\\cos\\left(2x^2\\right)$',
      '$2x\\cos\\left(2x^2\\right)$',
      '$\\cos\\left(2x^2\\right)$',
      '$4x^2\\cos\\left(2x^2\\right)$',
    ],
    correctIndex: 0,
    explanation:
      'Quy tắc chuỗi với $u=2x^2$: $y\'=\\cos(u)\\cdot u\'=\\cos(2x^2)\\cdot4x$. Đạo hàm của lớp trong ($4x$) luôn nhân vào cùng.',
  },
  {
    id: 'ap-3',
    lessonId: 'dao-ham',
    skillTag: 'chiều biến thiên',
    question: 'Hàm số $f(x)=x^2-4x+5$ nghịch biến trên khoảng nào?',
    options: ['$(-\\infty;2)$', '$(2;+\\infty)$', '$\\mathbb{R}$', '$(-2;2)$'],
    correctIndex: 0,
    explanation:
      '$f\'(x)=2x-4<0 \\Leftrightarrow x<2$. Theo định lý chiều biến thiên, $f$ nghịch biến trên $(-\\infty;2)$ và đồng biến trên $(2;+\\infty)$.',
  },
  {
    id: 'ap-4',
    lessonId: 'tich-phan',
    skillTag: 'định lý cơ bản',
    question: 'Tính $\\dfrac{d}{dx}\\displaystyle\\int_0^x\\sin\\left(t^2\\right)dt$?',
    options: [
      '$\\sin\\left(x^2\\right)$',
      '$\\cos\\left(x^2\\right)$',
      '$2x\\sin\\left(x^2\\right)$',
      '$\\sin\\left(t^2\\right)$',
    ],
    correctIndex: 0,
    explanation:
      'Định lý cơ bản (phần 1): đạo hàm của $\\int_0^x f(t)\\,dt$ theo $x$ chính là $f(x)$ — phép đạo hàm triệt tiêu phép tích phân, chỉ thay biến $t$ bằng cận trên $x$.',
  },
  {
    id: 'ap-5',
    lessonId: 'gioi-han',
    skillTag: 'giới hạn hữu tỉ',
    question: 'Tính $\\lim\\limits_{x\\to+\\infty}\\dfrac{3x^2-2x+1}{5x^2+x}$?',
    options: ['$\\dfrac{3}{5}$', '$\\dfrac{1}{5}$', '$+\\infty$', '$0$'],
    correctIndex: 0,
    explanation:
      'Tử và mẫu cùng bậc hai nên giới hạn bằng tỉ số hệ số bậc cao nhất: $\\frac{3}{5}$. Cách khác: chia cả tử và mẫu cho $x^2$ rồi cho các số hạng $\\frac{1}{x}$ tiến về 0.',
  },
  {
    id: 'ap-6',
    lessonId: 'khoi-tron-xoay',
    skillTag: 'thể tích tròn xoay',
    question:
      'Quay hình bán cầu phẳng $y=\\sqrt{4-x^2}$ trên $[-2;2]$ quanh trục $Ox$. Thể tích khối tạo thành bằng?',
    options: [
      '$\\dfrac{32\\pi}{3}$',
      '$\\dfrac{16\\pi}{3}$',
      '$8\\pi$',
      '$\\dfrac{32\\pi}{5}$',
    ],
    correctIndex: 0,
    explanation:
      '$V=\\pi\\int_{-2}^{2}\\left(4-x^2\\right)dx=\\pi\\left[4x-\\frac{x^3}{3}\\right]_{-2}^{2}=\\pi\\left(\\frac{16}{3}+\\frac{16}{3}\\right)=\\frac{32\\pi}{3}$. Kiểm tra: khối vừa tạo là hình cầu bán kính 2, đúng bằng $\\frac{4}{3}\\pi R^3=\\frac{32\\pi}{3}$.',
  },
  {
    id: 'ap-7',
    lessonId: 'dao-ham',
    skillTag: 'đạo hàm ẩn',
    question:
      'Cho đường tròn $x^2+y^2=25$. Tại điểm $(3;4)$, hệ số góc của tiếp tuyến bằng?',
    options: ['$-\\dfrac{3}{4}$', '$\\dfrac{3}{4}$', '$-\\dfrac{4}{3}$', '$\\dfrac{4}{3}$'],
    correctIndex: 0,
    explanation:
      'Lấy đạo hàm hai vế theo $x$ (kỹ thuật đạo hàm ẩn): $2x+2y\\cdot y\'=0 \\Rightarrow y\'=-\\frac{x}{y}$. Tại $(3;4)$: $y\'=-\\frac34$. Lưu ý $y$ được xem như hàm của $x$ nên phải nhân $y\'$ theo quy tắc chuỗi.',
  },
  // ---------- Từ toán học đến vật lý ----------
  {
    id: 'tl-1',
    lessonId: 'toan-ly',
    skillTag: 'đồ thị vận tốc',
    question:
      'Một ô tô chạy thẳng với $v(t)=5t$ (m/s) trong $4$ giây đầu. Độ dời của ô tô trong khoảng thời gian đó bằng?',
    options: ['$40$ m', '$20$ m', '$80$ m', '$10$ m'],
    correctIndex: 0,
    explanation:
      'Độ dời là diện tích dưới đồ thị $v$–$t$, tức $\\int_0^4 5t\\,dt=\\frac{5t^2}{2}\\Big|_0^4=40$ m. Diện tích tam giác (đáy 4, cao 20) cho cùng kết quả.',
  },
  {
    id: 'tl-2',
    lessonId: 'toan-ly',
    skillTag: 'đạo hàm trong vật lý',
    question:
      'Một chất điểm dao động điều hòa với li độ $x=5\\cos(2t)$ (cm). Vận tốc của chất điểm là $v=\\dfrac{dx}{dt}$ bằng?',
    options: [
      '$-10\\sin(2t)$ cm/s',
      '$10\\sin(2t)$ cm/s',
      '$-2\\sin(2t)$ cm/s',
      '$5\\sin(2t)$ cm/s',
    ],
    correctIndex: 0,
    explanation:
      'Đạo hàm hàm hợp: $v=(5\\cos 2t)\'=5\\cdot(-\\sin 2t)\\cdot2=-10\\sin(2t)$. Hệ số $\\omega=2$ từ phía trong nhân lên ngoài — đúng quy tắc chuỗi của bài Quy tắc tính đạo hàm.',
  },
  {
    id: 'tl-3',
    lessonId: 'toan-ly',
    skillTag: 'cảm ứng điện từ',
    question:
      'Từ thông qua khung dây (10 vòng) giảm đều từ $0{,}5$ Wb xuống $0{,}1$ Wb trong $0{,}2$ s. Suất điện động cảm ứng xuất hiện có độ lớn bằng?',
    options: ['$20$ V', '$2$ V', '$40$ V', '$8$ V'],
    correctIndex: 0,
    explanation:
      '$|e|=N\\left|\\dfrac{\\Delta\\Phi}{\\Delta t}\\right|=10\\cdot\\dfrac{0{,}4}{0{,}2}=20$ V. Vì từ thông giảm đều nên giá trị trung bình bằng giá trị tức thời — nếu $\\Phi(t)$ cong thì phải lấy đạo hàm $e=-N\\Phi\'(t)$.',
  },
  {
    id: 'ap-8',
    lessonId: 'tich-phan',
    skillTag: 'đổi biến số',
    question: 'Tính $\\displaystyle\\int_0^1 2x\\,e^{x^2}\\,dx$?',
    options: ['$e-1$', '$e$', '$e+1$', '$1$'],
    correctIndex: 0,
    explanation:
      'Đặt $u=x^2$ thì $du=2x\\,dx$, hai cận giữ nguyên $0\\to0$, $1\\to1$: $\\int_0^1e^u\\,du=e^u\\Big|_0^1=e-1$. Dấu hiệu nhận biết: có $u\'=2x$ đứng ngay cạnh hàm hợp $e^{x^2}$.',
  },
  {
    id: 'ap-9',
    lessonId: 'tich-phan',
    skillTag: 'tích phân từng phần',
    question: 'Tính $\\displaystyle\\int_0^1 x e^x\\,dx$?',
    options: ['$1$', '$e-1$', '$e$', '$e-2$'],
    correctIndex: 0,
    explanation:
      'Chọn $u=x$, $dv=e^x\\,dx$ (đa thức trước mũ) thì $du=dx$, $v=e^x$: $\\int_0^1xe^x\\,dx=xe^x\\Big|_0^1-\\int_0^1e^x\\,dx=e-(e-1)=1$.',
  },
  {
    id: 'ap-10',
    lessonId: 'tich-phan',
    skillTag: 'giá trị trung bình',
    question: 'Giá trị trung bình của hàm số $f(x)=x^2$ trên đoạn $[0;3]$ bằng?',
    options: ['$3$', '$9$', '$\\dfrac{3}{2}$', '$\\sqrt{3}$'],
    correctIndex: 0,
    explanation:
      '$\\bar{f}=\\dfrac{1}{b-a}\\int_a^bf=\\dfrac13\\int_0^3x^2\\,dx=\\dfrac13\\cdot\\dfrac{27}{3}=3$. Lưu ý: giá trị trung bình khác giá trị trung bình cộng hai đầu mút $\\frac{f(0)+f(3)}{2}=\\frac92$.',
  },
  {
    id: 'ap-11',
    lessonId: 'tich-phan',
    skillTag: 'định lý cơ bản',
    question: 'Tính $\\dfrac{d}{dx}\\displaystyle\\int_0^{x^2}\\cos t\\,dt$?',
    options: [
      '$2x\\cos\\left(x^2\\right)$',
      '$\\cos\\left(x^2\\right)$',
      '$x\\cos\\left(x^2\\right)$',
      '$\\sin\\left(x^2\\right)$',
    ],
    correctIndex: 0,
    explanation:
      'Định lý cơ bản (phần 1) kết hợp quy tắc chuỗi vì cận trên là hàm $u(x)=x^2$: kết quả bằng $f(u)\\cdot u\'=\\cos(x^2)\\cdot2x$. So sánh với câu $\\int_0^x$: cận là $x$ thì chỉ thay trực tiếp.',
  },
  {
    id: 'ap-12',
    lessonId: 'tich-phan',
    skillTag: 'diện tích hình học',
    question: 'Tính $\\displaystyle\\int_{-2}^{2}\\sqrt{4-x^2}\\,dx$?',
    options: ['$2\\pi$', '$4\\pi$', '$\\pi$', '$8$'],
    correctIndex: 0,
    explanation:
      'Đồ thị $y=\\sqrt{4-x^2}$ chính là nửa trên đường tròn tâm $O$ bán kính 2. Tích phân là diện tích nửa đĩa: $\\frac12\\pi R^2=\\frac12\\pi\\cdot4=2\\pi$. Nhận diện hình học nhanh hơn nhiều so với tìm nguyên hàm.',
  },
  {
    id: 'ap-13',
    lessonId: 'tich-phan',
    skillTag: 'tổng Riemann',
    question:
      'Biết $\\lim\\limits_{n\\to\\infty}\\left(\\dfrac{1^2}{n^3}+\\dfrac{2^2}{n^3}+\\dots+\\dfrac{n^2}{n^3}\\right)$ là tổng Riemann của một tích phân. Giá trị của giới hạn bằng?',
    options: [
      '$\\dfrac{1}{3}$',
      '$1$',
      '$\\dfrac{1}{2}$',
      '$0$',
    ],
    correctIndex: 0,
    explanation:
      'Viết lại thành $\\sum_{i=1}^{n}\\left(\\frac{i}{n}\\right)^2\\cdot\\frac1n$: đây là tổng Riemann của $f(x)=x^2$ trên $[0;1]$ với $\\Delta x=\\frac1n$, $x_i=\\frac{i}{n}$. Giới hạn bằng $\\int_0^1x^2\\,dx=\\frac13$.',
  },
]
