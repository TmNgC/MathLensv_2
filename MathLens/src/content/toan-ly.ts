import type { Lesson } from './types'
import { PhysicsScene } from '../lessons/PhysicsLesson'

/**
 * Bài "Từ toán học đến vật lý" — trực quan + lý thuyết.
 * Động học (bước 0–2) và Động lực học (bước 3–5), tổng kết ở bước 6.
 * Mỗi bước là một đồ thị động; câu chuyện lịch sử trong "Bạn có biết?".
 */
export const mathPhysicsLesson: Lesson = {
  id: 'toan-ly',
  number: 11,
  title: 'Từ toán học đến vật lý',
  subtitle: 'Động học & Động lực học qua đạo hàm và tích phân',
  kind: 'calc',
  accent: '#b78bff',
  glyph: 'Φ',
  steps: [
    {
      title: 'Vận tốc tức thời',
      duration: 9,
      body:
        'Quãng đường là hàm số của thời gian: $x(t)$. Vận tốc tức thời là đạo hàm $v=\\dfrac{dx}{dt}$ — xem cát tuyến $\\dfrac{\\Delta x}{\\Delta t}$ co dần về $0$: vận tốc trung bình trở thành vận tốc tức thời, đúng như cát tuyến tiến hóa thành tiếp tuyến ở bài Đạo hàm. Bên phải: cùng một đồng hồ $t$, quả cầu rơi theo đúng $x(t)=\\frac12gt^2$.',
      funFact: {
        title: 'Mũi tên của Zeno',
        body:
          'Hơn 2000 năm trước, Zeno nêu nghịch lý: tại mỗi khoảnh khắc, mũi tên đứng ở một vị trí xác định — vậy nó "chuyển động" ở đâu? Câu trả lời của giải tích: chuyển động không nằm trong một khoảnh khắc riêng lẻ, mà trong xu hướng — giới hạn của các vận tốc trung bình khi khoảng thời gian thu hẹp về 0. Chính nghịch lý này là một trong những động cơ đầu tiên của khái niệm đạo hàm.',
      },
    },
    {
      title: 'Gia tốc',
      duration: 8,
      body:
        'Đạo hàm của vận tốc cho gia tốc: $a=\\dfrac{dv}{dt}=\\dfrac{d^2x}{dt^2}$. Với rơi tự do, $v=gt$ là đường thẳng — độ dốc không đổi của đồ thị $v$–$t$ chính là $g=9{,}8$ m/s². Bên phải, lấy tích phân ngược lại: $x=\\int v\\,dt=\\frac12gt^2$ là parabol. Ba đại lượng $x$, $v$, $a$ chỉ là một hàm số và hai đạo hàm của nó.',
      funFact: {
        title: 'Mặt dốc và đồng hồ nước của Galileo',
        body:
          'Thế kỷ 17 chưa có đồng hồ bấm giây chính xác. Để đo rơi tự do, Galileo "pha loãng" trọng lực bằng cách cho quả cầu lăn trên mặt dốc, và đo thời gian bằng khối nước chảy ra từ một bình — cân nước để biết thời gian. Từ các số liệu đó ông phát hiện $x$ tỉ lệ với $t^2$, tức $x \\propto t^2$ — chính là hệ số $\\frac12g$ trong $\\frac12gt^2$, và điều đó có nghĩa gia tốc không đổi.',
      },
    },
    {
      title: 'Độ dời từ đồ thị v–t',
      duration: 10,
      body:
        'Tích phân ngược chiều đồng hồ: $\\Delta x=\\displaystyle\\int_{t_1}^{t_2}v\\,dt$ — diện tích có dấu giữa đồ thị $v$–$t$ và trục thời gian. Xe tăng tốc, chạy đều, hãm rồi lùi: phần trên trục cộng vào độ dời, phần dưới trừ đi. Quãng đường thì luôn cộng $|v|$ — vì thế hai số ở bảng chỉ bằng nhau khi $v$ không đổi dấu.',
    },
    {
      title: 'Thí nghiệm lò xo',
      duration: 10,
      body:
        'Động lực học: treo thêm quả nặng, lò xo giãn thêm. Ghi lại từng cặp $(x, F)$: các điểm nằm chính xác trên một đường thẳng $F=k\\cdot x$ — định luật Hooke, với hệ số đàn hồi $k$ (N/m) là độ dốc. Đây là cách "sinh ra" một hàm số từ thí nghiệm: vật lý cung cấp dữ kiện, toán học cung cấp mô hình.',
      funFact: {
        title: 'Định luật bị giấu trong một câu đố',
        body:
          'Năm 1676, Robert Hooke công bố định luật lò xo dưới dạng anagram "ceiiinosssttuv" — chuỗi chữ loạn xạ không ai hiểu. Hai năm sau ông mới giải mã: "ut tensio, sic vis" (tiếng Latin: "độ giãn nào, lực ấy"). Lý do: ông sợ đối thủ lấy mất phát minh nên mã hoá nó, sau này trở thành một trong những định luật đơn giản nhất của vật lý.',
      },
    },
    {
      title: 'Công của lực',
      duration: 9,
      body:
        'Với lực không đổi, $A=F\\cdot s$. Nhưng lực lò xo tăng dần theo $x$ — công phải là tích phân $A=\\displaystyle\\int_0^x k s\\,ds=\\dfrac12kx^2$: diện tích tam giác dưới đường $F=kx$. Con số $\\frac12kx^2$ quen thuộc chính là thế năng đàn hồi — không cần học thuộc, nó tự xuất hiện từ diện tích.',
      funFact: {
        title: 'Sức ngựa của James Watt',
        body:
          'Khi bán máy hơi nước, Watt phải so sánh với... ngựa. Ông đo các con ngựa kéo than trong mỏ than: mỗi con nâng 33.000 foot-pound trong một phút — và lấy con số đó (phóng đại chút ít) làm đơn vị "horsepower". Câu chuyện này cho thấy ý nghĩa thực dụng của công suất $P=\\frac{dW}{dt}$: không phải "mạnh cỡ nào" mà là "làm được bao nhiêu việc mỗi giây".',
      },
    },
    {
      title: 'Dao động điều hòa',
      duration: 10,
      body:
        'Kéo khối lệch khỏi vị trí cân bằng rồi buông: $x=A\\cos\\omega t$. Đạo hàm cho vận tốc $v=-A\\omega\\sin\\omega t$ (đường vàng) — lệch pha một phần tư chu kì: $v$ lớn nhất khi $x=0$ và bằng 0 khi $x$ ở biên. Đạo hàm cấp hai cho $a=-\\omega^2x$: gia tốc luôn ngược dấu li độ — đặc trưng của dao động điều hòa.',
      funFact: {
        title: 'Cây cầu Galloping Gertie',
        body:
          "Cầu Tacoma Narrows (Mỹ, 1940) dao động dữ dội mỗi khi có gió và chỉ bốn tháng sau khi khánh thành đã sụp đổ — quay lại toàn bộ thảm kịch trên phim. Nguyên nhân là hiện tượng rung động cưỡng bức cộng hưởng: gió bơm năng lượng đúng tần số dao động riêng của cầu, biên độ tăng dần theo thời gian — đúng như khối lò xo của chúng ta nếu có ngoại lực đẩy liên tục. Bài học đó thay đổi cách thiết kế cầu mãi mãi.",
      },
    },
    {
      title: 'Tổng kết',
      duration: 8,
      body:
        'Ba hình quen thuộc nhất của bài học: $\\int v\\,dt$ = độ dời, $\\int F\\,dx$ = công, $v=\\dfrac{dx}{dt}$ = vận tốc.',
    },
  ],
  Scene: PhysicsScene,
  theory: [
    {
      heading: 'Giải tích sinh ra từ vật lý',
      kind: 'history',
      body:
        'Aristotle mô tả chuyển động bằng tính chất — "tự nhiên" hay "bị ép" — mà không định lượng được. Galileo (1604–1638) lật ngược cách làm: thí nghiệm, đo đạc, tìm quy luật — phát hiện rơi tự do thỏa $x \\propto t^2$. Newton (Principia, 1687) chứng minh chuyển động thiên vũ tuân theo các định luật viết bằng ngôn ngữ đạo hàm; Leibniz phát triển song song chính bộ ký hiệu ấy. Euler và Lagrange đưa cơ học thành một nhánh của giải tích; Maxwell (1865) viết phương trình trường điện từ bằng đạo hàm riêng.',
    },
    {
      heading: 'Quan điểm của bài học',
      kind: 'def',
      body:
        'Mọi đại lượng vật lý trong chương trình phổ thông chia thành hai họ. Họ thứ nhất trả lời câu hỏi "nhanh hay chậm đến mức nào" — vận tốc, gia tốc, dòng điện, công suất, suất điện động cảm ứng: tất cả là đạo hàm theo thời gian. Họ thứ hai trả lời câu hỏi "cộng dồn được bao nhiêu" — quãng đường, điện tích, công: tất cả là tích phân. Nắm hai phép toán của giải tích là giải được cả hai họ trong một khung duy nhất.',
      table: [
        { sym: '$\\dfrac{d}{dt}$', meaning: 'họ "tốc độ biến đổi": $v$, $a$, $I$, $e$, $P$' },
        { sym: '$\\int \\dots\\,dt$', meaning: 'họ "cộng dồn": $s$, $q$, $W$' },
      ],
    },
    {
      heading: 'Vận tốc tức thời — đạo hàm theo thời gian',
      kind: 'def',
      body:
        'Chuyển động thẳng có phương trình tọa độ $x(t)$. Vận tốc tức thời và gia tốc là các đạo hàm: $v(t)=\\dfrac{dx}{dt}$ và $a(t)=\\dfrac{dv}{dt}=\\dfrac{d^2x}{dt^2}$. Ví dụ rơi tự do: $x=\\dfrac{1}{2}gt^2$ nên $v=gt$ và $a=g$ — trọng lực tạo gia tốc không đổi chính là hệ số $g$ đứng trước $t^2$. "Vận tốc trung bình $\\dfrac{\\Delta x}{\\Delta t}$" trong SGK Vật lí 10 chính là tỉ số hiệu; khi $\\Delta t\\to0$ nó trở thành đạo hàm — đúng như cát tuyến tiến hóa thành tiếp tuyến ở bài Đạo hàm.',
    },
    {
      heading: 'Quãng đường — tích phân theo thời gian',
      kind: 'def',
      body:
        'Biết vận tốc thì lấy tích phân để có độ dời: $\\Delta x=\\displaystyle\\int_{t_1}^{t_2}v(t)\\,dt$. Trên đồ thị vận tốc – thời gian, tích phân chính là diện tích có dấu giữa đồ thị và trục thời gian: phần trên trục cộng vào, phần dưới trục trừ đi. Muốn quãng đường (không âm) thì tách theo thời điểm $v=0$ và lấy giá trị tuyệt đối từng đoạn — hoàn toàn giống diện tích có dấu của bài Tích phân. Đây là kĩ năng đọc đồ thị $v$–$t$ cơ bản trong yêu cầu cần đạt của chương trình môn học Vật Lý.',
    },
    {
      heading: 'Một bài tích phân dựng lại toàn bộ chuyển động biến đổi đều',
      kind: 'example',
      body:
        'Xuất phát từ một dữ kiện duy nhất: gia tốc $a$ không đổi. Lần thứ nhất: $v=\\displaystyle\\int a\\,dt=v_0+at$. Lần thứ hai: $x=\\displaystyle\\int(v_0+at)\\,dt=x_0+v_0t+\\dfrac{1}{2}at^2$. Hai công thức được dùng nhiều nhất của Vật lí 10 chính là kết quả của hai lần tích phân liên tiếp — và quan hệ ngược lại $a=\\dfrac{dv}{dt}$ cho phép kiểm tra: đạo hàm của $x$ trả về đúng $v$, đạo hàm của $v$ trả về đúng $a$.',
    },
    {
      heading: 'Dao động điều hòa — đạo hàm của hàm lượng giác',
      kind: 'def',
      body:
        'Phương trình dao động: $x=A\\cos(\\omega t+\\varphi)$. Đạo hàm lần một cho vận tốc $v=-A\\omega\\sin(\\omega t+\\varphi)$, lần hai cho gia tốc $a=-\\omega^2A\\cos(\\omega t+\\varphi)=-\\omega^2x$. Kết quả thứ hai chính là đặc trưng định nghĩa của dao động điều hòa: gia tốc tỉ lệ với li độ theo hệ số âm — mọi hàm có tính chất $x^{\\prime\\prime}=-\\omega^2x$ đều dao động điều hòa. Hãy lưu ý về quy tắc đạo hàm hàm hợp $(\\cos u)\'=-u\'\\sin u$ với $u=\\omega t+\\varphi$.',
    },
    {
      heading: 'Công của lực biến thiên — diện tích dưới đồ thị lực',
      kind: 'def',
      body:
        'Với lực không đổi: $A=Fs\\cos\\alpha$. Với lực biến thiên theo vị trí: $A=\\displaystyle\\int_{s_1}^{s_2}F(s)\\,ds$ — công là diện tích dưới đồ thị $F$–$s$. Ví dụ kinh điển: kéo lò xo từ tự nhiên đến độ biến dạng $x$, lực đàn hồi $F=ks$ tăng tuyến tính, diện tích tam giác dưới đường $F=kx$ bằng $\\dfrac{1}{2}kx^2$ — chính là công thức thế năng đàn hồi.',
    },
    {
      heading: 'Dòng điện và điện tích — cùng một cặp đạo hàm/tích phân',
      kind: 'def',
      body:
        'Cường độ dòng điện tức thời là tốc độ biến thiên của điện tích: $I=\\dfrac{dq}{dt}$; ngược lại $q=\\displaystyle\\int I\\,dt$. Với dòng không đổi, $q=It$ là trường hợp riêng. Trên đồ thị $I$–$t$, điện tích di qua tiết diện dây dẫn là diện tích dưới đường cong.',
    },
    {
      heading: 'Cảm ứng điện từ — định luật Faraday',
      kind: 'def',
      body:
        'Suất điện động cảm ứng xuất hiện khi từ thông qua mạch biến thiên: $e=-N\\dfrac{d\\Phi}{dt}$. SGK Vật Lí 11 viết $e=-N\\dfrac{\\Delta\\Phi}{\\Delta t}$ — đây là giá trị trung bình trong khoảng $\\Delta t$; khi $\\Delta t\\to0$ tỉ số ấy trở thành đạo hàm, cho suất điện động tức thời. Ví dụ thanh dẫn dài $l$ trượt với vận tốc $v$ vuông góc với $B$: từ thông $\\Phi=Blx$ nên $e=-Bl\\dfrac{dx}{dt}=-Blv$ — công thức quen thuộc xuất phát trực tiếp từ đạo hàm theo thời gian.',
    },
    {
      heading: 'Công suất tức thời',
      kind: 'note',
      body:
        'Công suất là tốc độ sinh công: $P=\\dfrac{dW}{dt}$. Trong cơ học nó dẫn tới $P=Fv$ (lực cùng phương chuyển động); trong điện học $P=UI$ cùng một bản chất — tỉ số công trên thời gian, tức đạo hàm của công theo thời gian. Đơn vị watt chính là jun trên giây: đạo hàm mang đơn vị của thương.',
    },
    {
      heading: 'Điều kiện áp dụng và sai lầm thường gặp',
      kind: 'warn',
      body:
        '1) Giữ hệ đơn vị SI nhất quán trước khi lấy đạo hàm: nếu $x$ tính bằng centimeter thì $v$ nhận về centimeter trên giây, không phải mét trên giây. 2) Phân biệt giá trị trung bình $\\dfrac{\\Delta\\Phi}{\\Delta t}$ và giá trị tức thời $\\dfrac{d\\Phi}{dt}$: câu hỏi đề bài yêu cầu cái nào thì trả lời cái đó. 4) Đồ thị $v$–$t$ chạm trục: độ dời dừng tăng nhưng quãng đường vẫn tăng — đổi dấu vận tốc phải tách đoạn trước khi lấy diện tích.',
    },
    {
      heading: 'Bản đồ liên hệ toán – vật lý',
      kind: 'note',
      body: 'Bảng đối chiếu tổng kết:',
      table: [
        { sym: 'Đạo hàm $f\'(t)$', meaning: 'tốc độ biến đổi: $v=x\'$, $a=v\'$, $I=q\'$, $e=-N\\Phi\'$, $P=W\'$' },
        { sym: 'Đạo hàm cấp hai $x^{\\prime\\prime}$', meaning: 'gia tốc; đặc trưng $a=-\\omega^2x$ của dao động điều hòa' },
        { sym: 'Tích phân $\\int v\\,dt$', meaning: 'cộng dồn: độ dời, quãng đường' },
        { sym: 'Tích phân $\\int I\\,dt$', meaning: 'điện tích qua tiết diện' },
        { sym: 'Tích phân $\\int F\\,ds$', meaning: 'công của lực biến thiên; thế năng đàn hồi $\\frac{1}{2}kx^2$' },
        { sym: 'Diện tích dưới đồ thị', meaning: '$v$–$t$ → độ dời; $F$–$s$ → công; $I$–$t$ → điện tích' },
        { sym: 'Hàm số $\\cos(\\omega t+\\varphi)$', meaning: 'phương trình dao động điều hòa' },
        { sym: 'Hàm số mũ $e^x$', meaning: 'đường nạp/xả của tụ điện và sự tăng trưởng liên tục' },
      ],
    },
    {
      heading: 'Lời kết',
      kind: 'note',
      body:
        'Vật lý và toán học nói chung hay giải tích nói riêng có liên hệ chặt chẽ với nhau, vì vậy hiểu rõ bản chất toán học của đạo hàm hay tích phân sẽ giúp việc tiếp cận Vật lý trở nên thú vị và dễ hiểu hơn nhiều! ',
    },
  ],
}
