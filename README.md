# Interview Prep – Luyện phỏng vấn với AI 🚀

Nền tảng luyện phỏng vấn kỹ thuật toàn diện, tích hợp AI (Groq Llama-3.3-70b) để sinh câu hỏi, phân tích CV, phân tích Job Description, code review và theo dõi tiến độ học tập. Toàn bộ dữ liệu được lưu trữ bền vững trên Supabase.

---

## ✨ Tính năng

### 🔐 Đăng nhập bảng Google
- Đăng nhập an toàn 100% qua tài khoản Google OAuth 2.0 thông qua Supabase Auth
- Dữ liệu (CV, JD, kết quả phỏng vấn...) được cô lập riêng biệt cho từng tài khoản bằng Row Level Security (RLS)
- Tự động điều hướng về trang đăng nhập nếu chưa xác thực
- Hiển thị Avatar và tên tài khoản Google trên Navbar; có nút Đăng xuất

### 👤 Hồ Sơ Cá Nhân (`/profile`)
- Upload CV dạng PDF, DOCX hoặc paste text trực tiếp
- AI phân tích CV toàn diện:
  - **Điểm tổng thể** (0–100) với breakdown 4 tiêu chí: Kỹ thuật, Dự án, Kinh nghiệm, Trình bày
  - Trích xuất kỹ năng (Technical / Soft / Tools), kinh nghiệm, dự án, học vấn
  - Điểm mạnh & điểm yếu với giải thích chi tiết
  - **Tab Câu hỏi**: sinh câu hỏi phỏng vấn cá nhân hóa dựa trực tiếp vào nội dung CV
  - **Tab Học thêm**: gợi ý kỹ năng nên học với priority và tài nguyên học cụ thể

### 📋 Phân tích Job Description (`/jd-analyzer`)
- Paste JD hoặc upload file PDF/DOCX
- AI phân tích sâu và trả về:
  - **Level ước tính** (Junior / Mid / Senior) với lý do
  - **Tech stack** và kỹ năng trọng tâm
  - **Mức lương ước tính** theo thị trường Việt Nam
  - **Tab Câu hỏi & Bài tập**: 15–20 câu hỏi phỏng vấn (Technical / System Design / Behavioral) + bài tập coding mini
  - **Tab Về công ty**: văn hóa, môi trường, tech maturity (Startup/Scale-up/Enterprise), work style, pros/cons
  - **Tab Lộ trình học**: timeline học tập ưu tiên theo yêu cầu JD

### 🔗 Kết hợp CV + JD (trong `/jd-analyzer`)
- So sánh CV của bạn với JD sau khi phân tích xong
- Kết quả bao gồm:
  - **Match Score** tổng thể (%)
  - Kỹ năng đã có / kỹ năng đang thiếu (Bắt buộc / Quan trọng / Tốt nếu có)
  - Lộ trình học để lấp đầy khoảng cách
  - % sẵn sàng phỏng vấn

### ✉️ Viết Email Ứng Tuyển (trong `/jd-analyzer`)
- AI sinh email xin việc chuyên nghiệp dựa trên JD
- **Song ngữ Việt/Anh**: Tự động sinh cả hai phiên bản, có nút tab chuyển đổi nhanh chóng trên giao diện
- Cá nhân hóa theo tên ứng viên, tên HR
- Tùy chọn kết hợp nội dung CV
- Sinh 3 tiêu đề thay thế để chọn cho mỗi ngôn ngữ
- Copy từng phần (tiêu đề / nội dung / toàn bộ) hoặc sinh lại

### 🎯 Phỏng vấn AI (`/interview`)
- Chọn chủ đề và độ khó
- AI đặt câu hỏi, người dùng trả lời
- Nhận feedback và gợi ý câu trả lời tốt hơn
- Tích hợp gợi ý (hint) khi cần

### 🔍 Code Review (`/code-review`)
- Paste đoạn code bằng bất kỳ ngôn ngữ nào
- AI review: phát hiện bug, anti-pattern, gợi ý cải thiện performance
- Monaco Editor với syntax highlighting

### 💻 Bài tập Coding (`/exercises`)
- Kho bài tập theo chủ đề và độ khó
- Viết và chạy code ngay trên trình duyệt
- AI chấm điểm và giải thích

### 🏆 Thành tựu (`/achievements`)
- Theo dõi huy hiệu và milestones học tập
- Streak học hàng ngày

### 📊 Lịch sử (`/history`)
- Xem lại toàn bộ lịch sử phỏng vấn, code review, phân tích JD
- Thống kê điểm số theo thời gian với biểu đồ

---

## 🛠️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS Variables |
| AI | Groq API – Llama-3.3-70b-versatile |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth 2.0) |
| Editor | Monaco Editor |
| Charts | Recharts |
| File Parsing | pdf-parse, mammoth (DOCX) |

---

## 🗄️ Database Schema (Supabase)

| Bảng | Mô tả |
|------|-------|
| `sessions` | Phiên phỏng vấn |
| `questions` | Câu hỏi trong phiên |
| `answers` | Câu trả lời của người dùng |
| `question_bank` | Ngân hàng câu hỏi |
| `categories` | Danh mục chủ đề |
| `topics` | Chủ đề con |
| `jd_analyses` | Kết quả phân tích Job Description |
| `cv_analyses` | Kết quả phân tích CV |
| `code_reviews` | Kết quả code review |
| `user_stats` | Thống kê người dùng |

---

## ⚙️ Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- Tài khoản [Supabase](https://supabase.com)
- API key [Groq](https://console.groq.com)

### Cài đặt

```bash
# Clone repo
git clone <repo-url>
cd interview-prep

# Cài dependencies
npm install

# Tạo file .env.local
cp .env.example .env.local
```

### Cấu hình `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### Chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### Build Production

```bash
npm run build
npm run start
```

---

## 📁 Cấu trúc Dự án

```
src/
├── app/
│   ├── api/
│   │   ├── cv-analysis/       # POST: phân tích CV, GET: lấy kết quả mới nhất
│   │   ├── cv-jd-match/       # POST: so sánh CV vs JD
│   │   ├── email-draft/       # POST: sinh email ứng tuyển
│   │   ├── jd-analysis/       # POST: phân tích JD, GET: lấy kết quả mới nhất
│   │   ├── interview/         # Quản lý phiên phỏng vấn
│   │   ├── code-review/       # Code review với AI
│   │   ├── hint/              # Gợi ý câu trả lời
│   │   └── parse-file/        # Đọc PDF/DOCX
│   ├── profile/               # Trang Hồ Sơ
│   ├── jd-analyzer/           # Trang Phân tích JD
│   ├── interview/             # Trang Phỏng vấn
│   ├── code-review/           # Trang Code Review
│   ├── exercises/             # Trang Bài tập
│   ├── achievements/          # Trang Thành tựu
│   └── history/               # Trang Lịch sử
├── components/
│   ├── profile/               # ProfileView
│   ├── jd-analyzer/           # JDAnalyzerView, CVJDMatchView, EmailDraftModal
│   └── Navbar.tsx
└── hooks/
    ├── useCVAnalysis.ts
    ├── useCVJDMatch.ts
    ├── useEmailDraft.ts
    ├── useJDAnalysis.ts
    └── ...
```

---

## 🤖 AI Prompting

Toàn bộ AI phản hồi bằng **tiếng Việt có đầy đủ dấu**, chỉ giữ tiếng Anh cho thuật ngữ kỹ thuật (React, Node.js, Docker, v.v.). Sử dụng `response_format: json_object` để đảm bảo parse JSON ổn định.

---

## 📌 Quy tắc Dự án

- **Database Persistence**: Mọi dữ liệu người dùng BẮT BUỘC lưu vào Supabase
- **No LocalStorage**: Không sử dụng `localStorage` hay `sessionStorage` cho dữ liệu vĩnh viễn
- **Database Schema**: Mọi bảng mới phải có SQL kèm theo để chạy trên Supabase SQL Editor
- **Page.tsx Architecture**: File `page.tsx` chỉ chứa import. UI → `components/`, Logic → `hooks/`
