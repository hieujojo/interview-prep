# Interview Prep – Luyện phỏng vấn với AI 🚀

Nền tảng luyện phỏng vấn kỹ thuật toàn diện, mọi tính năng đều được AI tự động hóa — từ phân tích CV, sinh câu hỏi, đánh giá câu trả lời, review code cho đến viết email ứng tuyển.

---

## ✨ Tính năng

### 🔐 Xác thực & Cài đặt
- Đăng nhập qua Google OAuth 2.0, dữ liệu cô lập theo từng tài khoản (RLS)
- Hiển thị avatar + tên trên Navbar, tự động redirect nếu chưa đăng nhập
- **AI Provider Selector**: Chọn linh hoạt giữa Groq và Gemini, hệ thống tự động fallback nếu một nhà cung cấp bị quá tải (rate limit / downtime). Trạng thái (provider đang chọn, đang bị downtime, đang fallback) được thể hiện trực tiếp trên Navbar. Lựa chọn này được đồng bộ xuyên suốt các thiết bị thông qua Database.

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
- **Gợi ý từ CV**: Nếu đã phân tích CV, hệ thống tự động gợi ý topic/category phù hợp với level hiện tại, kèm lý do cụ thể và nhóm 🔥 Challenge cho topic nâng cao — nhấn chip để chọn topic ngay lập tức
- Toàn bộ lịch sử phỏng vấn được lưu để xem lại

### 💻 Luyện Code (`/exercises`)
- Kho bài tập coding phân loại theo chủ đề (dùng chung bảng `topics` với phần Phỏng vấn) và 5 mức độ khó (beginner → expert)
- Chọn 1 bài tập có sẵn (đề bài + ví dụ + gợi ý tự động điền vào context) hoặc tự viết code tự do không cần chọn bài
- Monaco Editor với syntax highlighting, hỗ trợ nhiều ngôn ngữ
- AI tự động review toàn bộ ngay sau khi nộp:
  - Phát hiện lỗi cú pháp, lỗi logic, edge case bị bỏ sót
  - Chỉ ra vấn đề performance, best practices, security
  - Đưa ra bản code cải thiện kèm giải thích, copy nhanh 1 chạm
- Mọi lần nộp code được tự động lưu vào lịch sử (không cần bấm lưu thủ công), liên kết với đúng bài tập đã chọn

### 🏆 Thành tựu (`/achievements`)
- Hệ thống huy hiệu tự động mở khoá theo tiến độ học tập
- Theo dõi streak học hàng ngày, milestones tích luỹ

### 📊 Lịch sử (`/history`)
- Toàn bộ lịch sử phỏng vấn, code review, phân tích JD được lưu tự động
- Biểu đồ thống kê điểm số theo thời gian
- **Lịch sử làm sai**: Xem lại các câu trả lời phỏng vấn bị điểm thấp (< 5) kèm nhận xét của AI để rút kinh nghiệm

### 📚 Tài Liệu Học Tập (`/documents`)
- Kho tài liệu PDF/DOCX phân loại theo chủ đề và độ khó
- Upload tài liệu cá nhân lên Supabase Storage (private bucket)
- **AI Recommendation**: Phân tích lịch sử phỏng vấn để gợi ý tài liệu phù hợp với điểm yếu
- Tải xuống tài liệu qua Signed URL (bảo mật, tự hết hạn)
- `question_bank` có thêm trường `sample_answer` — đáp án tham khảo cho từng câu hỏi phỏng vấn

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
| AI           | Groq API – Llama-3.3-70b-versatile |
| AI           | Google Gemini API                  |
| State        | Zustand                            |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Google OAuth 2.0) |
| Editor | Monaco Editor |

---

## 📐 Nguyên tắc làm việc

Đọc [`rules.md`](./rule.md) trước khi bắt đầu code.