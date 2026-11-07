import type { TheorySection } from './types'

/** Lý thuyết — Giới hạn */
export const limitsTheory: TheorySection[] = [
  {
    heading: 'Từ nghịch lý Zeno đến định nghĩa ε–δ',
    kind: 'history',
    body:
      'Hơn hai nghìn năm trước, các nghịch lý của Zeno (mũi tên "đứng yên" trong từng khoảnh khắc, Achilles không bao giờ đuổi kịp con rùa) cho thấy tư duy thông thường chưa đủ để nói về "tiến đến giới hạn". Eudoxus và Archimedes trả lời một phần bằng phương pháp vét cạn — kẹp hình cong giữa hai họ hình đa giác. Đến thế kỷ 17, Newton và Leibniz dùng đại lượng vô cùng nhỏ một cách tự tin nhưng thiếu nền tảng; Giám mục Berkeley chế giễu chúng là "bóng ma của các đại lượng đã biến mất" (1734). Cauchy (1821) định nghĩa giới hạn bằng ngôn ngữ chuyển động; Weierstrass (khoảng 1872) loại bỏ hoàn toàn trực giác bằng cặp ε–δ nghiêm ngặt — bộ khung mà mọi giáo trình ngày nay vẫn dùng.',
  },
  {
    heading: 'Giới hạn của dãy số',
    kind: 'def',
    body:
      'Dãy số $(u_n)$ có giới hạn $L$ khi $n \\to \\infty$ nếu: với mọi số $\\varepsilon > 0$ nhỏ tùy ý cho trước, luôn tồn tại một vị trí $N_0$ sao cho kể từ $n > N_0$ trở đi, khoảng cách $|u_n - L| < \\varepsilon$. Khi đó dãy hội tụ và ta viết $\\lim_{n\\to\\infty}u_n=L$. Nếu không có giới hạn hữu hạn nào, dãy phân kỳ.',
    table: [
      { sym: '$\\lim_{n\\to\\infty}u_n=L$', meaning: 'dãy $(u_n)$ hội tụ về $L$' },
      { sym: '$u_n \\to +\\infty$', meaning: 'dãy phân kỳ, tăng không giới hạn' },
      { sym: '$\\lim_{n\\to\\infty}q^n=0$', meaning: 'khi $|q|<1$ (cơ sở của Zeno!)' },
      { sym: '$\\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n=e$', meaning: 'định nghĩa số $e \\approx 2{,}71828$' },
    ],
  },
  {
    heading: 'Giới hạn của hàm số',
    kind: 'def',
    body:
      '$\\lim_{x\\to x_0}f(x)=L$ nghĩa là: khi $x$ tiến đủ gần $x_0$ từ hai phía (không cần bằng $x_0$) thì $f(x)$ tiến gần $L$. Giới hạn mô tả xu hướng — hàm có thể không xác định ngay tại $x_0$ nhưng vẫn có giới hạn tại đó, như $f(x)=\\frac{x^2-1}{x-1}$ tại $x_0=1$.',
    table: [
      { sym: '$\\lim_{x\\to x_0^+}f(x)$', meaning: 'giới hạn một bên phải (tiến từ $x>x_0$)' },
      { sym: '$\\lim_{x\\to x_0^-}f(x)$', meaning: 'giới hạn một bên trái' },
      { sym: '$\\lim_{x\\to x_0}f(x)=L$', meaning: 'tồn tại khi và chỉ khi hai giới hạn một bên đều bằng $L$' },
    ],
  },
  {
    heading: 'Ví dụ mẫu — giới hạn "cách đều vô cùng"',
    kind: 'example',
    body:
      'Tính $\\lim_{n\\to\\infty}\\frac{2n^2+1}{n^2-3}$. Chia tử và mẫu cho $n^2$: $\\lim\\frac{2+1/n^2}{1-3/n^2}=\\frac{2+0}{1-0}=2$. Mẹo: khi tử và mẫu cùng bậc, giới hạn bằng tỉ số hệ số bậc cao nhất; mẫu "nhanh" hơn thì bằng 0; tử "nhanh" hơn thì vô cùng.',
  },
  {
    heading: 'Sai lầm thường gặp',
    kind: 'warn',
    body:
      '1) Nhầm "không xác định tại $x_0$" với "không có giới hạn tại $x_0$" — hai việc khác nhau. 2) Tin rằng mọi dãy giảm dần về 0 thì tổng hội tụ: chuỗi điều hòa $1+\\frac12+\\frac13+\\dots$ là phản ví dụ kinh điển. 3) Quên kiểm tra CẢ hai giới hạn một bên trước khi kết luận $\\lim_{x\\to x_0}$ tồn tại.',
  },
  {
    heading: 'Công thức thiết yếu',
    kind: 'note',
    body:
      '$\\lim_{n\\to\\infty}q^n=0$ nếu $|q|<1$ · $\\lim_{n\\to\\infty}\\left(1+\\frac1n\\right)^n=e$ · $\\lim_{x\\to0}\\frac{\\sin x}{x}=1$. Ba kết quả này được dùng xuyên suốt từ giới hạn, đạo hàm đến tích phân.',
  },
]

/** Lý thuyết — Đạo hàm */
export const derivativeTheory: TheorySection[] = [
  {
    heading: 'Từ tiếp tuyến của Fermat đến đạo hàm',
    kind: 'history',
    body:
      'Bài toán vẽ tiếp tuyến và tìm cực đại được Fermat giải khéo léo từ 1629 bằng "đẳng thức giả" — cho $h$ nhỏ rồi cho nó triệt tiêu. Newton (1665–1666) gọi đạo hàm là tỷ lệ lưu số của các đại lượng đang chảy; Leibniz (1675–1684) phát triển ký hiệu $\\frac{dy}{dx}$ vẫn dùng đến hôm nay và chứng minh các quy tắc cơ bản. Sau hai thế kỷ tranh cãi về vô cùng nhỏ, Cauchy (1821) định nghĩa đạo hàm là giới hạn của tỉ số hiệu — đúng như biểu thức ở dưới: tiếp tuyến là giới hạn của cát tuyến.',
  },
  {
    heading: 'Đạo hàm tại một điểm',
    kind: 'def',
    body:
      'Cho hàm số $f$ xác định quanh $x_0$. Đạo hàm của $f$ tại $x_0$ là $f\'(x_0)=\\lim_{\\Delta x\\to0}\\frac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x}$, nếu giới hạn này tồn tại. Về hình học: độ dốc của tiếp tuyến với đồ thị tại điểm $A(x_0,\\,f(x_0))$. Về vật lý: vận tốc tức thời nếu $f$ là quãng đường.',
    table: [
      { sym: '$f\'(x)$', meaning: 'hàm số phái sinh — đạo hàm tại mỗi điểm' },
      { sym: '$\\frac{dy}{dx}$, $y\'$', meaning: 'cách viết khác của đạo hàm (Leibniz / Lagrange)' },
      { sym: '$f\'\'(x)$', meaning: 'đạo hàm cấp hai — độ cong, gia tốc' },
    ],
  },
  {
    heading: 'Tiếp tuyến và chiều biến thiên',
    kind: 'def',
    body:
      'Phương trình tiếp tuyến tại $x_0$: $y=f(x_0)+f\'(x_0)(x-x_0)$. Định lý (chiều biến thiên): cho hàm số $f$ có đạo hàm trên khoảng $K$ — nếu $f\'(x)\\ge0$ với mọi $x\\in K$ thì $f$ đồng biến trên $K$; nếu $f\'(x)\\le0$ với mọi $x\\in K$ thì $f$ nghịch biến trên $K$; nếu dấu bằng chỉ xảy ra tại hữu hạn điểm thì tính đơn điệu là ngặt. Điểm $x_0$ thỏa $f\'(x_0)=0$ là ứng viên cực trị — như bạn thấy ở bước 5 của phần trực quan.',
  },
  {
    heading: 'Suy ra công thức chuẩn từ định nghĩa',
    kind: 'example',
    body:
      'Mọi công thức trong bảng dưới đều được suy ra trực tiếp từ định nghĩa $f\'(x)=\\lim_{\\Delta x\\to0}\\frac{f(x+\\Delta x)-f(x)}{\\Delta x}$. Xét $(x^2)\'$: $\\lim_{h\\to0}\\frac{(x+h)^2-x^2}{h}=\\lim_{h\\to0}\\frac{2xh+h^2}{h}=\\lim_{h\\to0}(2x+h)=2x$. Tương tự, khai triển $(x+h)^3=x^3+3x^2h+3xh^2+h^3$ cho kết quả $3x^2$ — và quy luật tổng quát là $(x^n)\'=nx^{n-1}$. Với lượng giác, dùng công thức cộng: $\\frac{\\sin(x+h)-\\sin x}{h}=\\frac{2\\cos\\left(x+\\frac{h}{2}\\right)\\sin\\frac{h}{2}}{h}\\xrightarrow{h\\to0}\\cos x$ (nhờ $\\lim_{t\\to0}\\frac{\\sin t}{t}=1$). Riêng $(e^x)\'=e^x$ — hàm duy nhất bằng chính đạo hàm của mình — là tính chất đặc trưng của số $e$.',
  },
  {
    heading: 'Công thức thiết yếu',
    kind: 'note',
    body: 'Bảng đạo hàm và các quy tắc thường dùng nhất của phép tính đạo hàm.',
    table: [
      { sym: '$x^n$', meaning: '$nx^{n-1}$' },
      { sym: '$\\sin x$', meaning: '$\\cos x$' },
      { sym: '$\\cos x$', meaning: '$-\\sin x$' },
      { sym: '$e^x$', meaning: '$e^x$ (bằng chính nó)' },
      { sym: '$\\ln x$', meaning: '$1/x$' },
      { sym: '$u\\cdot v$', meaning: '$u\'v+uv\'$ (tích)' },
      { sym: '$\\frac{u}{v}$', meaning: '$\\frac{u\'v-uv\'}{v^2}$ (thương)' },
      { sym: '$f(g(x))$', meaning: '$f\'(g(x))\\cdot g\'(x)$ (quy tắc chuỗi)' },
    ],
  },
  {
    heading: 'Ví dụ mẫu — từ định nghĩa đến công thức',
    kind: 'example',
    body:
      'Tính đạo hàm của $f(x)=x^2$ bằng định nghĩa: $f\'(x)=\\lim_{h\\to0}\\frac{(x+h)^2-x^2}{h}=\\lim_{h\\to0}\\frac{2xh+h^2}{h}=\\lim_{h\\to0}(2x+h)=2x$ — khớp với hàng $x^n$ của bảng. Đúng như hoạt hình: độ dốc đường parabol $y=x^2/4$ tại $x=a$ là $a/2$.',
  },
  {
    heading: 'Định lý giá trị trung gian',
    kind: 'def',
    body:
      'Nếu $f$ liên tục trên $[a;b]$ và $f(a)\\cdot f(b)<0$ thì tồn tại ít nhất một $c\\in(a;b)$ sao cho $f(c)=0$. Ứng dụng: chứng minh phương trình $f(x)=0$ có nghiệm trên một khoảng — biến đổi tương đương để đưa về dấu trái nhau tại hai đầu mút, rồi kết luận bằng định lý này.',
  },
  {
    heading: 'Định lý Rolle',
    kind: 'def',
    body:
      'Nếu $f$ liên tục trên $[a;b]$, có đạo hàm trên $(a;b)$ và $f(a)=f(b)$ thì tồn tại ít nhất một $c\\in(a;b)$ sao cho $f\'(c)=0$. Hình học: giữa hai điểm cùng độ cao, đồ thị phải có điểm có tiếp tuyến nằm ngang.',
  },
  {
    heading: 'Định lý Lagrange (giá trị trung bình)',
    kind: 'def',
    body:
      'Nếu $f$ liên tục trên $[a;b]$ và có đạo hàm trên $(a;b)$ thì tồn tại ít nhất một $c\\in(a;b)$ sao cho $f\'(c)=\\dfrac{f(b)-f(a)}{b-a}$. Hình học: luôn có điểm mà tiếp tuyến song song với dây nối hai đầu mút $A(a,f(a))$ và $B(b,f(b))$. Rolle chính là trường hợp riêng $f(a)=f(b)$ của định lý này. Đây là công cụ chuẩn để chứng minh bất đẳng thức dạng $|f(b)-f(a)|\\le M|b-a|$ khi chặn được $|f\'|\\le M$.',
  },
  {
    heading: 'Định lý Cauchy (giá trị trung gian mở rộng)',
    kind: 'def',
    body:
      'Nếu $f$ và $g$ liên tục trên $[a;b]$, có đạo hàm trên $(a;b)$ và $g\'(x)\\ne0$ với mọi $x\\in(a;b)$ thì tồn tại ít nhất một $c\\in(a;b)$ sao cho $\\dfrac{f(b)-f(a)}{g(b)-g(a)}=\\dfrac{f\'(c)}{g\'(c)}$. Lagrange là trường hợp riêng khi $g(x)=x$. Định lý Cauchy cũng chính là nền tảng để chứng minh quy tắc L\'Hôpital (xem bài Giới hạn nâng cao).',
  },
  {
    heading: 'Khai triển Taylor',
    kind: 'def',
    body:
      'Nếu $f$ có đạo hàm đến cấp $n+1$ trong một lân cận của $x_0$ thì với mọi $x$ trong lân cận đó: $f(x)=f(x_0)+\\dfrac{f\'(x_0)}{1!}(x-x_0)+\\dfrac{f\'\'(x_0)}{2!}(x-x_0)^2+\\dots+\\dfrac{f^{(n)}(x_0)}{n!}(x-x_0)^n+R_n(x)$, với số dư $R_n(x)=\\dfrac{f^{(n+1)}(c)}{(n+1)!}(x-x_0)^{n+1}$ ($c$ nằm giữa $x$ và $x_0$). Khi $x_0=0$, khai triển được gọi là khai triển Mac-laurin. Các khai triển quen thuộc của $e^x$, $\\sin x$, $\\cos x$ và cách dùng chúng để tính giới hạn xem ở bài Giới hạn nâng cao.',
  },
  {
    heading: 'Chiều lồi lõm và bất đẳng thức Jensen',
    kind: 'def',
    body:
      'Định lý (lồi — lõm): nếu $f\'\'(x)\\ge0$ với mọi $x\\in K$ thì đồ thị của $f$ lồi trên $K$; nếu $f\'\'(x)\\le0$ thì đồ thị lõm trên $K$ (dấu ngặt cho lồi/lõm ngặt). Định lý Jensen: nếu $f$ lồi trên $K$, các số $x_1,\\dots,x_n\\in K$ và $p_1,\\dots,p_n\\ge0$ với $p_1+\\dots+p_n=1$ thì $p_1f(x_1)+\\dots+p_nf(x_n)\\ge f\\left(p_1x_1+\\dots+p_nx_n\\right)$. Với $p_i=\\frac1n$ đây chính là bất đẳng thức trung bình của hàm lồi; dấu đổi chiều với hàm lõm.',
  },
  {
    heading: 'Hàm số mũ và đa thức',
    kind: 'note',
    body:
      'Với mọi đa thức $P(x)$ và mọi $a>1$: $\\lim\\limits_{x\\to+\\infty}\\dfrac{P(x)}{a^x}=0$ — hàm số mũ luôn tăng nhanh hơn mọi đa thức. Đây là sự thật nền tảng khi so sánh tốc độ tăng trưởng (chứng minh bằng quy tắc L\'Hôpital lặp hoặc khai triển Taylor, xem bài Giới hạn nâng cao).',
  },
  {
    heading: 'Các bất đẳng thức và giới hạn quen thuộc',
    kind: 'note',
    body: 'Bộ công thức sau suy ra từ khai triển Taylor, dùng thường xuyên trong chứng minh bất đẳng thức và tính giới hạn:',
    table: [
      { sym: '$\\dfrac{x}{1+x}\\le\\ln(1+x)\\le x$ ($x>-1$)', meaning: 'logarit kẹp giữa hai hàm bậc nhất' },
      { sym: '$e^x\\ge1+x$ với mọi $x$', meaning: 'tiếp tuyến của $e^x$ tại $x=0$' },
      { sym: '$x-\\dfrac{x^3}{6}\\le\\sin x\\le x$ ($x\\ge0$)', meaning: 'sin kẹp giữa hai đa thức' },
      { sym: '$\\tan x\\ge x$ ($0\\le x<\\frac{\\pi}{2}$)', meaning: 'dùng để so sánh với $\\sin x$' },
      { sym: '$\\lim\\limits_{x\\to0}\\dfrac{\\sin x}{x}=\\lim\\limits_{x\\to0}\\dfrac{\\tan x}{x}=1$', meaning: 'hai giới hạn lượng giác nền tảng' },
      { sym: '$\\lim\\limits_{x\\to+\\infty}\\left(1+\\dfrac{a}{x}\\right)^x=e^a$', meaning: 'dạng tổng quát của số $e$' },
      { sym: '$\\lim\\limits_{x\\to0}\\dfrac{\\ln(1+x)}{x}=1$', meaning: 'logarit gần $1$' },
      { sym: '$\\lim\\limits_{x\\to0}\\dfrac{a^x-1}{x}=\\ln a$', meaning: 'mũ gần $1$' },
    ],
  },
  {
    heading: 'Sai lầm thường gặp',
    kind: 'warn',
    body:
      '1) Kết luận cực trị chỉ vì $f\'(x_0)=0$ — điều kiện cần chứ không đủ; phải xét dấu $f\'$ đổi qua $x_0$ (hoặc dùng $f\'\'$). 2) Quên quy tắc chuỗi với hàm hợp như $\\sin(3x)$ — kết quả phải là $3\\cos(3x)$, không phải $\\cos(3x)$. 3) Đạo hàm của tích: KHÔNG phải $u\'v\'$.',
  },
]

/** Lý thuyết — Tích phân */
export const integralTheory: TheorySection[] = [
  {
    heading: 'Từ diện tích parabol của Archimedes đến Riemann',
    kind: 'history',
    body:
      'Archimedes (thế kỷ 3 TCN) tính được diện tích hình phẳng giới hạn bởi parabol bằng cách chia nó thành các lát tam giác — kết quả bằng $\\frac{2}{3}$ diện tích tam giác ngoại tiếp, mà không dùng một biểu thức đại số nào. Cavalieri (1635) nối tiếp bằng phương pháp indivisibles (những lát không thể chia nhỏ). Bước quyết định thuộc về Newton và Leibniz: tích phân và đạo hàm là hai phép ngược nhau — định lý cơ bản của giải tích — biến việc tính diện tích từ nghệ thuật thành quy trình. Riemann (1854) đưa định nghĩa tổng và giới hạn mà ta học hôm nay; Lebesgue (1902) mở rộng thành lý thuyết đo lường hiện đại.',
  },
  {
    heading: 'Tích phân xác định và tổng Riemann',
    kind: 'def',
    body:
      'Chia đoạn $[a;b]$ thành $n$ khoảng con bằng nhau, mỗi khoảng rộng $\\Delta x=\\frac{b-a}{n}$. Trên mỗi khoảng lấy điểm đại diện $x_i$ và lập tổng diện tích các hình chữ nhật cao $f(x_i)$: $S_n=\\sum_{i=1}^{n}f(x_i)\\,\\Delta x$. Khi $n\\to\\infty$, nếu giới hạn tồn tại thì nó là tích phân xác định: $\\int_a^b f(x)\\,dx=\\lim_{n\\to\\infty}\\sum_{i=1}^{n}f(x_i)\\,\\Delta x$. Về hình học: diện tích có dấu của hình thang cong giới hạn bởi đồ thị $f$, trục $Ox$ và hai đường $x=a$, $x=b$. Điều kiện đủ quan trọng: nếu $f$ liên tục trên $[a;b]$ thì tích phân luôn tồn tại.',
    table: [
      { sym: '$\\int_a^b f(x)\\,dx$', meaning: 'tích phân xác định — một SỐ' },
      { sym: '$a$, $b$', meaning: 'cận dưới và cận trên của phép tích phân' },
      { sym: '$dx$', meaning: 'biến tích phân — "cộng dồn theo $x$"' },
      { sym: '$f(x_i)\\,\\Delta x$', meaning: 'diện tích hình chữ nhật thứ $i$ trong tổng Riemann' },
    ],
  },
  {
    heading: 'Các tính chất của tích phân xác định',
    kind: 'def',
    body: 'Với $f$, $g$ liên tục trên $[a;b]$, các tính chất sau được dùng liên tục trong tính toán:',
    table: [
      { sym: '$\\int_a^b[\\alpha f(x)+\\beta g(x)]dx=\\alpha\\int_a^bf+\\beta\\int_a^bg$', meaning: 'tuyến tính' },
      { sym: '$\\int_a^bf=\\int_a^cf+\\int_c^bf$', meaning: 'chia đoạn tích phân theo điểm $c$' },
      { sym: '$\\int_a^af=0$ và $\\int_a^bf=-\\int_b^af$', meaning: 'đổi chiều cận thì đổi dấu' },
      { sym: '$f\\le g$ trên $[a;b]\\Rightarrow\\int_a^bf\\le\\int_a^bg$', meaning: 'bảo toàn thứ tự' },
      { sym: '$m\\lef\\le M\\Rightarrow m(b-a)\\le\\int_a^bf\\le M(b-a)$', meaning: 'ước lượng tích phân دون tính toán' },
    ],
  },
  {
    heading: 'Nguyên hàm',
    kind: 'def',
    body:
      '$F$ là nguyên hàm của $f$ trên khoảng $K$ nếu $F\'(x)=f(x)$ với mọi $x\\in K$. Nếu $f$ có một nguyên hàm $F$ thì mọi nguyên hàm của nó có dạng $F(x)+C$ — họ nguyên hàm; hằng số $C$ là lý do phải ghi $+C$ trong tích phân bất định.',
    table: [
      { sym: '$\\int f(x)\\,dx$', meaning: 'tích phân bất định — họ nguyên hàm $F(x)+C$' },
      { sym: '$F(x)\\Big|_a^b$', meaning: 'viết gọn của $F(b)-F(a)$' },
      { sym: '$C$', meaning: 'hằng số tùy ý — nguyên hàm chỉ xác định đến một hằng số' },
    ],
  },
  {
    heading: 'Hai định lý cơ bản của giải tích',
    kind: 'def',
    body:
      'Định lý 1 (đạo hàm của tích phân với cận biến): nếu $f$ liên tục và $A(x)=\\int_a^x f(t)\\,dt$ thì $A\'(x)=f(x)$. Tổng quát với cận trên là hàm số: $\\dfrac{d}{dx}\\displaystyle\\int_a^{u(x)}f(t)\\,dt=f(u(x))\\cdot u\'(x)$ — nhân thêm $u\'$ theo quy tắc chuỗi. Đây chính là hàm tích lũy ở bước 5 phần trực quan. Định lý 2 (công thức Newton–Leibniz): nếu $f$ liên tục trên $[a;b]$ và $F$ là một nguyên hàm bất kỳ của $f$ thì $\\int_a^bf(x)\\,dx=F(b)-F(a)$ — hằng số $C$ tự triệt tiêu khi trừ. Hai định lý khẳng định cùng một sự thật: đạo hàm và tích phân là hai phép toán ngược của nhau.',
  },
  {
    heading: 'Định lý giá trị trung bình của tích phân',
    kind: 'def',
    body:
      'Nếu $f$ liên tục trên $[a;b]$ thì tồn tại ít nhất một $c\\in[a;b]$ sao cho $\\int_a^bf(x)\\,dx=f(c)(b-a)$. Số $\\bar{f}=\\dfrac{1}{b-a}\\displaystyle\\int_a^bf(x)\\,dx$ gọi là giá trị trung bình của $f$ trên $[a;b]$. Hình học: tồn tại một hình chữ nhật cao $f(c)$ có diện tích đúng bằng hình thang cong — cùng nền, diện tích bằng nhau.',
  },
  {
    heading: 'Công thức thiết yếu',
    kind: 'note',
    body: 'Bảng nguyên hàm thường dùng nhất — mỗi hàng đọc từ phải sang trái chính là một công thức đạo hàm.',
    table: [
      { sym: '$x^n$ ($n\\ne-1$)', meaning: '$\\dfrac{x^{n+1}}{n+1}+C$' },
      { sym: '$\\dfrac{1}{x}$', meaning: '$\\ln|x|+C$' },
      { sym: '$\\sin x$', meaning: '$-\\cos x+C$' },
      { sym: '$\\cos x$', meaning: '$\\sin x+C$' },
      { sym: '$e^x$', meaning: '$e^x+C$' },
      { sym: '$a^x$ ($a>0$)', meaning: '$\\dfrac{a^x}{\\ln a}+C$' },
      { sym: '$\\dfrac{1}{1+x^2}$', meaning: '$\\arctan x+C$' },
      { sym: '$\\dfrac{1}{\\sqrt{1-x^2}}$', meaning: '$\\arcsin x+C$' },
      { sym: '$\\tan x$', meaning: '$-\\ln|\\cos x|+C$' },
      { sym: '$\\cot x$', meaning: '$\\ln|\\sin x|+C$' },
      { sym: '$\\sin^2 x$', meaning: '$\\dfrac{x}{2}-\\dfrac{\\sin 2x}{4}+C$' },
      { sym: '$\\cos^2 x$', meaning: '$\\dfrac{x}{2}+\\dfrac{\\sin 2x}{4}+C$' },
    ],
  },
  {
    heading: 'Hạ bậc lượng giác — hạ về công thức quen thuộc',
    kind: 'example',
    body:
      'Lũy thừa chẵn của sin, cos không có nguyên hàm trực tiếp — hạ bậc bằng công thức nhân đôi: $\\sin^2x=\\dfrac{1-\\cos2x}{2}$, $\\cos^2x=\\dfrac{1+\\cos2x}{2}$. Ví dụ: $\\displaystyle\\int_0^{\\pi/2}\\sin^2x\\,dx=\\frac12\\int_0^{\\pi/2}(1-\\cos2x)\\,dx=\\frac12\\left[x-\\frac{\\sin2x}{2}\\right]_0^{\\pi/2}=\\frac{\\pi}{4}$. Lũy thừa lẻ thì tách một nhân tử rồi đổi biến: $\\displaystyle\\int\\sin^3x\\,dx=\\int(1-\\cos^2x)\\sin x\\,dx$ — đặt $u=\\cos x$, $du=-\\sin x\\,dx$, kết quả $-\\cos x+\\dfrac{\\cos^3x}{3}+C$.',
  },
  {
    heading: 'Kỹ thuật 1: phương pháp đổi biến số',
    kind: 'def',
    body:
      'Đặt $u=u(x)$, khi đó $\\displaystyle\\int_a^bf(u(x))\\,u\'(x)\\,dx=\\int_{u(a)}^{u(b)}f(u)\\,du$ (nhớ đổi cả hai cận), hoặc với tích phân bất định thì tính theo $u$ rồi thay ngược lại $u=u(x)$. Dấu hiệu nhận biết: trong biểu thức có hàm hợp $f(u(x))$ và ngay cạnh nó có (hoặc bóc ra được) nhân tử $u\'(x)$. Phương pháp này chính là quy tắc chuỗi viết ngược. Ví dụ: tính $\\displaystyle\\int_0^1\\frac{x}{x^2+1}\\,dx$. Đặt $u=x^2+1$, $u\'=2x$, cận đổi từ $[0;1]$ sang $[1;2]$: $\\frac12\\int_1^2\\frac{du}{u}=\\frac12\\ln2$. Ví dụ thứ hai: $\\displaystyle\\int x\\sqrt{x^2+3}\\,dx=\\frac12\\int\\sqrt{u}\\,du=\\frac13(x^2+3)^{3/2}+C$.',
  },
  {
    heading: 'Kỹ thuật 2: tích phân từng phần',
    kind: 'def',
    body:
      '$\\displaystyle\\int u\\,dv=uv-\\int v\\,du$. Dùng khi tích phân là tích của hai loại hàm khác nhau (đa thức nhân mũ, đa số nhân lượng giác, logarit, hàm ngược). Quy tắc chọn $u$ — ưu tiên theo thứ tự: hàm số ngược, logarit, đa thức, lượng giác, mũ. Ví dụ 1: $\\displaystyle\\int_0^1xe^x\\,dx$: chọn $u=x$, $dv=e^xdx$ thì $du=dx$, $v=e^x$, kết quả $xe^x\\Big|_0^1-\\int_0^1e^xdx=e-(e-1)=1$. Ví dụ 2: $\\displaystyle\\int\\ln x\\,dx$: chọn $u=\\ln x$, $dv=dx$, kết quả $x\\ln x-x+C$. ',
  },
  {
    heading: 'Tích phân hàm số chẵn, hàm số lẻ',
    kind: 'note',
    body:
      'Trên đoạn đối xứng $[-a;a]$: nếu $f$ chẵn thì $\\displaystyle\\int_{-a}^{a}f(x)\\,dx=2\\int_0^af(x)\\,dx$; nếu $f$ lẻ thì $\\displaystyle\\int_{-a}^{a}f(x)\\,dx=0$. Ví dụ: $\\displaystyle\\int_{-2}^{2}x^3\\cos(x^2)\\,dx=0$ không cần tính — hàm dưới dấu tích phân là hàm lẻ. Dùng để rút ngắn đáng kể thời gian làm bài.',
  },
  {
    heading: 'Ứng dụng: diện tích hình phẳng',
    kind: 'def',
    body:
      'Diện tích hình phẳng giới hạn bởi $y=f(x)$, $y=g(x)$ và hai đường $x=a$, $x=b$ ($f\\geg$ trên $[a;b]$): $S=\\displaystyle\\int_a^b[f(x)-g(x)]\\,dx$. Khi hai đồ thị cắt nhau, tách đoạn theo các giao điểm và lấy giá trị tuyệt đối từng phần. Trường hợp riêng với trục $Ox$ chính là $g\\equiv0$. Với hình giới hạn bởi đồ thị hàm của $y$: $S=\\displaystyle\\int_c^d[\\varphi(y)-\\psi(y)]\\,dy$.',
  },
  {
    heading: 'Ứng dụng: thể tích khối',
    kind: 'def',
    body:
      'Hình phẳng giới hạn bởi $y=f(x)$ ($f\\ge0$), trục $Ox$, $x=a$, $x=b$ quay quanh $Ox$ tạo khối tròn xoay với $V=\\pi\\displaystyle\\int_a^bf^2(x)\\,dx$. Tổng quát nhất: nếu mỗi thiết diện vuông góc với $Ox$ tại $x$ có diện tích $S(x)$ thì $V=\\displaystyle\\int_a^bS(x)\\,dx$ — chi tiết và minh họa động xem hai bài Khối tròn xoay và Thiết diện.',
  },
  {
    heading: 'Ví dụ mẫu',
    kind: 'example',
    body:
      'Tính $\\int_0^2(x^2+1)\\,dx$. Nguyên hàm: $F(x)=\\frac{x^3}{3}+x$. Vậy $\\int_0^2=F(2)-F(0)=\\left(\\frac83+2\\right)-0=\\frac{14}{3}\\approx4{,}667$. Kiểm tra bằng trực quan: diện tích dưới parabol dịch chuyển lên 1 đơn vị trên $[0,2]$ — đúng bằng con số này.',
  },
  {
    heading: 'Sai lầm thường gặp',
    kind: 'warn',
    body:
      '1) Khi $f$ đổi dấu trên $[a;b]$: $\\int_a^b f$ là diện tích có dấu (phần dưới trục bị trừ) — muốn diện tích hình học phải tách khoảng theo nghiệm của $f(x)=0$ rồi lấy giá trị tuyệt đối từng đoạn. 2) Quên ghi $dx$ hoặc quên đổi dấu khi hoán vị cận: $\\int_a^b=-\\int_b^a$; tính bằng $F(a)-F(b)$ là sai dấu. 3) Đổi biến mà không đổi cận — hoặc đổi cận mà vẫn thay ngược về $x$ trước khi thay số. 4) Từng phần chọn $u$ ngược thứ tự ưu tiên khiến tích phân mới khó hơn tích phân cũ. 5) Nghĩ rằng $\\int f\\cdot g=\\int f\\cdot\\int g$ — không có quy tắc tích phân của tích; phải dùng đổi biến hoặc từng phần.',
  },
]

/** Lý thuyết — Khối tròn xoay */
export const revolutionTheory: TheorySection[] = [
  {
    heading: 'Từ quả cầu của Archimedes đến thùng rượu của Kepler',
    kind: 'history',
    body:
      'Archimedes tự hào nhất về kết quả khối cầu chiếm đúng $\\frac{2}{3}$ thể tích hình trụ ngoại tiếp — hình đó được khắc trên mộ ông theo di nguyện. Kepler (1615), khi mua rượu và phải trả tiền theo dung tích thùng, viết luận văn Nghiên cứu khối học mới, tính thể tích thùng rượu bằng cách coi nó là vô số lát mỏng chồng lên nhau. Cavalieri (1635) chính thức hóa cách nghĩ này thành nguyên lý cộng dồn diện tích thiết diện. Ngày nay mọi bài khối tròn xoay gói trong một dòng tích phân $V=\\pi\\int f^2(x)\\,dx$ — chính là công thức đĩa mà phần trực quan minh họa.',
  },
  {
    heading: 'Thể tích khối tròn xoay',
    kind: 'def',
    body:
      'Khi hình phẳng giới hạn bởi đồ thị $y=f(x)$ ($f\\ge0$), trục $Ox$ và hai đường $x=a$, $x=b$ quay quanh $Ox$, ta được khối tròn xoay với thể tích $V=\\pi\\int_a^bf^2(x)\\,dx$. Tương tự khi quay quanh $Oy$: $V=\\pi\\int_c^d\\varphi^2(y)\\,dy$.',
    table: [
      { sym: '$V=\\pi\\int_a^bf^2(x)\\,dx$', meaning: 'quay quanh trục $Ox$' },
      { sym: '$V=\\pi\\int_c^d\\varphi^2(y)\\,dy$', meaning: 'quay quanh trục $Oy$' },
      { sym: '$dV=\\pi f^2(x)\\,dx$', meaning: 'thể tích đĩa vô cùng mỏng (phương pháp đĩa)' },
      { sym: '$V=\\pi\\int_a^b\\left(R^2-r^2\\right)dx$', meaning: 'vòng xuyến (washer) — khi khối có "lỗ"' },
    ],
  },
  {
    heading: 'Ví dụ mẫu',
    kind: 'example',
    body:
      'Cho $y=\\sqrt{x}$ trên $[0,4]$ quay quanh $Ox$: $V=\\pi\\int_0^4\\left(\\sqrt{x}\\right)^2dx=\\pi\\int_0^4x\\,dx=\\pi\\cdot\\frac{16}{2}=8\\pi$. Mỗi đĩa bán kính $\\sqrt{x}$ — đúng như hoạt hình ở bước 3.',
  },
  {
    heading: 'Sai lầm thường gặp',
    kind: 'warn',
    body:
      '1) Quên bình phương: $\\pi\\int f^2(x)dx$ chứ không phải $\\pi\\int f(x)dx$. 2) Bài "vòng xuyến" (miền giữa hai đường $y=f$ và $y=g$): phải dùng $R^2-r^2=\\left(f^2-g^2\\right)$, không thể lấy $\\pi\\int f^2$ trừ dần tùy hứng. 3) Quay quanh $Oy$ mà vẫn tích phân theo $x$ — phải đổi biến sang $y$.',
  },
  {
    heading: 'Liên hệ với bài Thiết diện',
    kind: 'note',
    body:
      'Khối tròn xoay chỉ là trường hợp đặc biệt của công thức tổng quát $V=\\int_a^bS(x)\\,dx$ với $S(x)$ là diện tích thiết diện: ở đây mỗi thiết diện là hình tròn nên $S(x)=\\pi f^2(x)$. Hiểu được điều này là hiểu được toàn bộ chương "thể tích" của chương trình 12.',
  },
]

/** Lý thuyết — Thiết diện */
export const crossSectionTheory: TheorySection[] = [
  {
    heading: 'Cavalieri và những lát không thể chia nhỏ',
    kind: 'history',
    body:
      'Ý tưởng so sánh hai khối qua các thiết diện xuất hiện trong tác phẩm "Phương pháp" của Archimedes — bản thảo thất truyền đến năm 1906 mới được tìm lại tại Constantinople. Bonaventura Cavalieri (1635) phát biểu thành nguyên lý mang tên ông: hai khối có diện tích thiết diện tương ứng bằng nhau thì có thể tích bằng nhau — bất kể hình dạng bên ngoài. Nguyên lý này là tiền thân trực tiếp của công thức $V=\\int S(x)\\,dx$ và là cội nguồn của mọi công thức thể tích, từ nón và cầu cho đến các khối hiện đại.',
  },
  {
    heading: 'Thiết diện & công thức thể tích tổng quát',
    kind: 'def',
    body:
      'Thiết diện của khối $H$ bởi mặt phẳng $(P)$ là phần chung của $(P)$ và $H$. Nếu mọi thiết diện vuông góc với trục $Ox$ tại $x$ đều có diện tích $S(x)$ (liên tục), thì $V=\\int_a^bS(x)\\,dx$. Toàn bộ phép tính thể tích trong chương trình 12 là một câu duy nhất: "cắt mỏng, cộng lại".',
    table: [
      { sym: '$S(x)$', meaning: 'diện tích thiết diện tại vị trí $x$' },
      { sym: '$V=\\int_a^bS(x)\\,dx$', meaning: 'công thức thể tích tổng quát' },
      { sym: '$S(h)=\\pi r^2(h)$', meaning: 'thiết diện tròn — khối tròn xoay, hình nón, hình cầu' },
    ],
  },
  {
    heading: 'Nguyên lý Cavalieri',
    kind: 'def',
    body:
      'Hai khối nằm giữa hai mặt phẳng song song. Nếu mọi thiết diện tương ứng (cắt bởi mặt phẳng song song với hai mặt trên) có diện tích bằng nhau thì hai khối có thể tích bằng nhau. Hình dáng bên ngoài có thể khác hẳn nhau — như hai chồng đồng xu ở phần trực quan.',
  },
  {
    heading: 'Ví dụ mẫu — hình nón',
    kind: 'example',
    body:
      'Nón cao $H$, bán kính đáy $R$: thiết diện ở độ cao $h$ là hình tròn bán kính $r(h)=R\\left(1-\\frac{h}{H}\\right)$. Vậy $V=\\int_0^H\\pi R^2\\left(1-\\frac{h}{H}\\right)^2dh=\\frac13\\pi R^2H$ — công thức quen thuộc của tiểu học được sinh ra từ một tích phân.',
  },
  {
    heading: 'Sai lầm thường gặp',
    kind: 'warn',
    body:
      '1) Trong bài hình hộp/lăng trụ ("thiết diện qua ba điểm"), vẽ nhầm thiết diện vì quên tìm giao tuyến của mặt phẳng với các mặt còn lại — hãy kéo dài các đường và tìm điểm chung trước. 2) Cavalieri chỉ bảo đảm THỂ TÍCH bằng nhau, không bảo đảm hai khối đồng dạng. 3) Với hình cầu: $S(h)=\\pi(R^2-h^2)$ — quên bình phương bán kính là mất ngay hệ số $\\frac43$.',
  },
  {
    heading: 'Khoảnh khắc đẹp nhất: khối cầu',
    kind: 'note',
    body:
      'Áp dụng cho bán kính $R$: $V=\\int_{-R}^{R}\\pi(R^2-h^2)\\,dh=\\frac43\\pi R^3$. Người ta đã biết công thức này hơn 2000 năm (Archimedes chứng minh bằng cách cân khối cầu với hình nón và hình trụ) — nhưng chỉ với thiết diện + tích phân, bạn tự chứng minh lại nó trong ba dòng.',
  },
]
