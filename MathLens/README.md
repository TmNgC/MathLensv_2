# MathLens — Giải tích thị giác

**Nhìn thấy đạo hàm & tích phân bằng hoạt hình.**

MathLens là trang web học toán tương tác dành cho học sinh trung học Việt Nam:
mỗi khái niệm là một hoạt hình mượt mà mà bạn có thể **kéo, tua và nghịch phá** —
trình bày theo phong cách 3Blue1Brown, chứ không chỉ vẽ hình tĩnh như GeoGebra
hay trả lời kết quả như WolframAlpha.

> Bạn có thể *thấy* hình hài của toán học. — tagline của dự án

## Chương trình

| # | Bài | Nội dung |
|---|-----|----------|
| 1 | **Tiền giải tích** ∈ | Ngôn ngữ (tập hợp, lượng từ, khoảng), hàm số & miền xác định, các họ hàm cơ bản, hàm hợp & hàm ngược, biến đổi đồ thị, tư duy giải tích + tự kiểm tra |
| 2 | **Giới hạn** Σ | Zeno ×2¹⁷, dồn dần về 1 trên trục số, giới hạn hàm số, ε-δ, chuỗi Leibniz π, số e & lãi kép, điều hòa vs cấp số nhân — kèm mục "💡 Bạn có biết?" |
| 3 | **Giới hạn nâng cao** ∞ | Lý thuyết chuyên đề: nguyên lý kẹp, công thức thiết yếu, L'Hôpital & các bẫy, khai triển Taylor, Weierstrass & dãy truy hồi, Stolz–Cesàro |
| 4 | **Đạo hàm** ƒ′ | Cát tuyến → tiếp tuyến (kéo được), vẽ hàm phái sinh f′, cực trị |
| 5 | **Quy tắc tính đạo hàm** ⚙ | Lý thuyết: tổng/tích/thương/chuỗi kèm chứng minh, bảng hàm hợp, bài mẫu hai tầng |
| 6 | **Khảo sát hàm số** ∿ | Ứng dụng tổng hợp của đạo hàm: dấu f′ → chiều biến thiên, cực trị (kiểm tra bằng f″), lồi lõm & điểm uốn, tiệm cận của hàm phân thức, bảng biến thiên vẽ tay trên canvas — 7 bước kèm câu chuyện |
| 7 | **Tích phân** ∫ | Riemann (4 phương pháp), diện tích có dấu, hàm tích lũy, định lý cơ bản, vận tốc → quãng đường, nguyên hàm |
| 8 | **Khối tròn xoay** ◉ | 3D: quay φ 0→2π, phương pháp đĩa, lát cắt, V = π∫f² |
| 9 | **Thiết diện** ◫ | 3D: cắt trụ/nón, nguyên lý Cavalieri, bán cầu ⅔πR³ |
| 10 | **Phòng thí nghiệm** λ | Nhập hàm số bất kỳ (MathLive), tiếp tuyến, f′, diện tích |
| 11 | **Từ toán học đến vật lý** Φ | Động học & Động lực học (Vật lí 10–11, GDPT 2018) qua hoạt hình: vận tốc tức thời, gia tốc, diện tích v–t, thí nghiệm lò xo (Hooke), công = diện tích F–x, dao động điều hòa — mỗi bước kèm câu chuyện lịch sử |

Mỗi bài lý thuyết mở đầu bằng mục **Lịch sử** — hành trình của khái niệm từ ý tưởng sơ khai đến hình thức hiện đại.

Mỗi bài (trừ Lab) có hai tab: **🎬 Trực quan** (hoạt hình từng bước) và
**📖 Lý thuyết** (định nghĩa, bảng ký hiệu, ví dụ mẫu, sai lầm thường gặp —
định dạng đề THPT). Tiến độ lưu tự động trong `localStorage`.

## ⚡ Kiểm tra kiến thức (AI)

`#/quiz` — phòng kiểm tra có chấm bài bằng AI:

- **AI soạn câu hỏi**: chọn bài + số câu, mỗi lần một bộ câu mới (trắc nghiệm
  tiếng Việt, kèm giải thích).
- **Bấm giờ**: thời gian từng câu và tổng thời gian được ghi lại.
- **Phân tích kết quả**: điểm mạnh / điểm yếu theo từng kỹ năng, tốc độ làm
  bài, và lộ trình ôn tập gợi ý (kèm link về đúng phần Lý thuyết cần xem lại).

### Bật AI (biến môi trường trên Vercel)

| Biến | Ý nghĩa |
|------|---------|
| `LLM_API_KEY` | **bắt buộc** — API key của nhà cung cấp |
| `LLM_BASE_URL` | mặc định `https://api.openai.com/v1`; đổi nếu dùng GLM, Groq, Together… (bất kỳ endpoint tương thích OpenAI) |
| `LLM_MODEL` | mặc định `gpt-4o-mini` |

Không có key (hoặc lỗi mạng), quiz tự chuyển sang **ngân hàng câu hỏi offline**
và phân tích bằng bộ máy quy tắc nội bộ — trang vẫn dùng được đầy đủ.

## 👤 Tài khoản & 🏆 Bảng xếp hạng

- **Chỉ cần tên** (không mật khẩu): lần đầu mở trang, MathLens hỏi “Ai đang học?”.
  Danh sách hồ sơ đã dùng trên máy hiện sẵn để chọn nhanh; có thể học ở chế độ khách.
- **Nhiều người dùng chung một máy:** tiến độ (`mathlens:progress:<tên>`) và lịch sử
  kiểm tra (`mathlens:quiz:<tên>`) tách riêng theo hồ sơ. Hồ sơ đang dùng được lưu
  theo **từng tab** (sessionStorage), nên hai bạn có thể học song song ở hai tab.
- **Điểm:** mỗi câu đúng 10 điểm + thưởng tốc độ tối đa 5 điểm (giảm dần về 0 ở 60 s).
- `#/leaderboard`: **Hôm nay / Tháng này / Năm nay** (tổng điểm, theo giờ Việt Nam) và
  **Kỉ lục** (điểm cao nhất của một lượt làm bài).
- Máy chủ: `api/leaderboard.ts` + **Upstash Redis** (sorted set, `ZINCRBY` nguyên tử nên
  nhiều người nộp bài cùng lúc không ghi đè nhau; mỗi lượt có mã riêng, gửi trùng bị bỏ qua).
  Không có cơ sở dữ liệu → bảng xếp hạng tự chạy trên máy (các hồ sơ của máy đó).

## 🎮 Thi đấu trực tiếp (kiểu Kahoot)

- **Giáo viên** mở `#/live` trên máy chiếu → chọn bài, số câu (5/10/15), thời gian mỗi câu
  (10/20/30 s), nguồn câu hỏi (AI / offline) → **Tạo phòng** → màn hình hiện **mã PIN 6 số**.
- **Học sinh** mở `#/play` (hoặc `#/play/<PIN>`) trên điện thoại → nhập PIN + tên → vào phòng.
- Mỗi câu: câu hỏi + 4 ô màu kèm hình ▲ ◆ ● ■ (không phân biệt chỉ bằng màu), đồng hồ
  đếm ngược; câu đóng khi hết giờ hoặc khi mọi người đã trả lời.
- **Điểm:** đúng được 500–1000 điểm, càng nhanh càng cao: `1000 · (1 − t / T / 2)`; có đếm
  chuỗi câu đúng 🔥. Thời gian trả lời do **máy chủ** ghi nhận nên công bằng giữa các máy.
- Sau mỗi câu: phân bố đáp án, lời giải, bảng điểm top 5 (mũi tên tăng hạng); cuối trận: bục vinh danh.
- Kết thúc, kết quả của mỗi học sinh được lưu vào lịch sử và **cộng vào bảng xếp hạng** ngày/tháng/năm.
- Máy chủ: `api/live.ts` (Upstash Redis, cùng biến môi trường với bảng xếp hạng). Trình duyệt của
  giáo viên điều khiển trận đấu; máy chủ chỉ lưu PIN, người chơi, trạng thái và đáp án
  (`HSETNX` — mỗi học sinh chỉ trả lời một lần mỗi câu, kể cả khi cả lớp bấm cùng lúc).
- **Chưa có cơ sở dữ liệu?** Phòng tự chạy ở **chế độ một máy**: mở thêm tab `#/play` trong cùng
  trình duyệt để tham gia — tiện cho trình diễn.

### Bật bảng xếp hạng toàn hệ thống (Vercel)
1. Vercel → Project → **Storage** → *Create Database* → **Upstash for Redis** (gói miễn phí) → *Connect* với project.
   Vercel tự thêm `KV_REST_API_URL` và `KV_REST_API_TOKEN`.
2. (Tuỳ chọn) thêm `EXPORT_KEY=<mã bí mật>` để giáo viên tải kết quả:
   `https://<tên-miền>/api/leaderboard?export=csv&key=<mã bí mật>`.
3. Redeploy.

## Công nghệ

- **Vite 8 + React 19 + TypeScript** — SPA với hash-router (deep-link từng bài)
- **Engine 2D tự viết** (`src/engine/`) — Canvas 2D, rAF timeline, scrub bar,
  immediate-mode drag, d3-scale cho hệ trục
- **three.js + react-three-fiber + drei** — các bài 3D (LatheGeometry cho khối
  tròn xoay, instanced meshes cho chồng đĩa)
- **KaTeX** (công thức), **MathLive** (nhập công thức), **math.js** (đạo hàm
  biểu thức) — lazy-load chỉ khi mở Phòng thí nghiệm
- **Tailwind CSS 4** — theme tối lấy cảm hứng 3B1B, font Be Vietnam Pro

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # xuất static vào dist/
npm run preview  # xem bản build
```

## Triển khai

### Vercel
1. Đẩy code lên GitHub repo mới.
2. Vercel → *Add New Project* → chọn repo → framework **Vite** (tự nhận) → Deploy.
   Không cần cấu hình gì thêm vì app dùng hash-router.

### GitHub Pages
```bash
npm run build
# push thư mục dist/ lên nhánh gh-pages, hoặc dùng action deploy tĩnh
```

## Cấu trúc

```
src/
├── engine/       # Stage (canvas/rAF/drag), PlaneView (trục, đường cong, Riemann)
├── components/   # LessonShell (clock + step card + theory tab), TheoryPanel, FunFact, ScrubBar
├── content/      # mỗi bài một file (steps + funFacts + theory) + theory.ts (tài liệu lý thuyết)
├── lessons/      # scene của từng bài (Canvas 2D hoặc R3F)
├── pages/        # Home, QuizSpace (setup → quiz → kết quả → phân tích AI)
├── quiz/         # types, ngân hàng offline, lưu lịch sử làm bài
└── lib/          # progress (localStorage)
api/
├── quiz.ts       # serverless: AI soạn câu hỏi (Vercel tự nhận thư mục api/)
├── analyze.ts    # serverless: AI phân tích kết quả
├── leaderboard.ts # serverless: bảng xếp hạng (Upstash Redis)
└── live.ts       # serverless: phòng thi đấu trực tiếp (PIN, người chơi, đáp án)
scripts/
└── smoke.ts      # kiểm thử nhanh các hàm máy chủ: node scripts/smoke.ts
```

Thêm bài mới: tạo `content/<id>.ts` (định nghĩa steps + Scene) rồi đăng ký vào
`content/index.tsx` — rail, trang chủ và tiến độ tự động cập nhật.

## Ghi nhận

Lấy cảm hứng từ [3Blue1Brown](https://www.3blue1brown.com) (Essence of Calculus),
[Mathigon](https://mathigon.org) và [Arduino-Learner](https://learn-arduino-red.vercel.app).
Là bản tái xây dựng hoàn toàn của dự án MathLens cũ (2026) — code cũ đã ngừng sử dụng.
