# Interview Prep – Luyện phỏng vấn với AI 🚀

Nền tảng luyện phỏng vấn kỹ thuật toàn diện, mọi tính năng đều được AI tự động hóa — từ phân tích CV, sinh câu hỏi, đánh giá câu trả lời, review code cho đến viết email ứng tuyển.

---

## ✨ Tính năng

### 🔐 Xác thực
- Đăng nhập qua Google OAuth 2.0, dữ liệu cô lập theo từng tài khoản (RLS)
- Hiển thị avatar + tên trên Navbar, tự động redirect nếu chưa đăng nhập

### 👤 Hồ Sơ & Phân tích CV (`/profile`)
- Upload CV dạng PDF, DOCX hoặc paste text trực tiếp
- AI tự động phân tích toàn bộ CV và trả về:
  - **Điểm tổng thể** (0–100) với breakdown 4 tiêu chí: Kỹ thuật, Dự án, Kinh nghiệm, Trình bày
  - Trích xuất kỹ năng (Technical / Soft / Tools), kinh nghiệm, dự án, học vấn
  - Điểm mạnh & điểm yếu với giải thích cụ thể
  - **Câu hỏi phỏng vấn** cá nhân hóa sinh ra trực tiếp từ nội dung CV
  - **Gợi ý học thêm** với mức độ ưu tiên và tài nguyên học cụ thể

### 📋 Phân tích Job Description (`/jd-analyzer`)
- Paste JD hoặc upload file PDF/DOCX
- AI tự động phân tích sâu và trả về:
  - **Level ước tính** (Intern / Fresher / Junior / Mid / Senior) kèm lý do cụ thể
  - Tech stack và kỹ năng trọng tâm cần có
  - **Mức lương ước tính** theo thị trường Việt Nam
  - 15–20 câu hỏi phỏng vấn (Technical / System Design / Behavioral) + bài tập coding mini
  - Thông tin công ty: văn hóa, môi trường, tech maturity, work style, pros/cons
  - Lộ trình học ưu tiên theo đúng yêu cầu JD

### 🔗 So sánh CV + JD
- AI đối chiếu CV với JD, tự động tính toán:
  - **Match Score** tổng thể (%)
  - Kỹ năng đã có / kỹ năng còn thiếu (phân loại: Bắt buộc / Quan trọng / Tốt nếu có)
  - Lộ trình học để lấp đầy khoảng cách kỹ năng
  - **% sẵn sàng phỏng vấn** cho vị trí đó

### ✉️ Viết Email Ứng Tuyển
- AI tự động sinh email xin việc chuyên nghiệp dựa trên JD và CV
- Song ngữ Việt/Anh, chuyển đổi nhanh bằng tab
- Sinh 3 tiêu đề email thay thế cho mỗi ngôn ngữ để lựa chọn
- Copy từng phần (tiêu đề / nội dung / toàn bộ) hoặc yêu cầu AI sinh lại

### 🎯 Phỏng vấn AI (`/interview`)
- Chọn chủ đề và độ khó, AI tự động sinh câu hỏi phù hợp
- Trả lời → AI chấm điểm, nhận xét chi tiết và đưa ra câu trả lời mẫu tốt hơn
- Hỗ trợ gợi ý (hint) khi bí, AI giải thích từng bước
- Toàn bộ lịch sử phỏng vấn được lưu để xem lại

### 🔍 Code Review AI (`/code-review`)
- Paste code bằng bất kỳ ngôn ngữ nào, AI tự động review toàn bộ:
  - Phát hiện bug, logic sai, edge case bị bỏ sót
  - Chỉ ra anti-pattern và giải thích tại sao nên tránh
  - Gợi ý cải thiện performance, readability, cấu trúc code
- Monaco Editor với syntax highlighting

### 💻 Bài tập Coding (`/exercises`)
- Kho bài tập phân loại theo chủ đề và độ khó
- Viết và chạy code trực tiếp trên trình duyệt
- AI tự động chấm điểm, giải thích kết quả và gợi ý hướng tối ưu

### 🏆 Thành tựu (`/achievements`)
- Hệ thống huy hiệu tự động mở khoá theo tiến độ học tập
- Theo dõi streak học hàng ngày, milestones tích luỹ

### 📊 Lịch sử (`/history`)
- Toàn bộ lịch sử phỏng vấn, code review, phân tích JD được lưu tự động
- Biểu đồ thống kê điểm số theo thời gian

### 📓 Ghi chú (`/notes`)
- Tạo, chỉnh sửa, xoá và tìm kiếm ghi chú cá nhân
- Hỗ trợ tags để phân loại nội dung theo chủ đề

---

## 🛠️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Groq API – Llama-3.3-70b-versatile |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Google OAuth 2.0) |
| Editor | Monaco Editor |

---

## 📐 Nguyên tắc làm việc

Đọc [`rules.md`](./rule.md) trước khi bắt đầu code.