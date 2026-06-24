# Project Rules

1. **Database Persistence**: Mọi tính năng mới liên quan đến dữ liệu người dùng (lịch sử, kết quả, settings, lỗi sai, v.v...) BẮT BUỘC phải được lưu vào cơ sở dữ liệu Supabase.
2. **No LocalStorage**: TUYỆT ĐỐI KHÔNG sử dụng `localStorage` hay `sessionStorage` cho việc lưu trữ dữ liệu vĩnh viễn hoặc dữ liệu cần phân tích.
3. **Database Schema**: Khi có tính năng yêu cầu bảng (table) mới hoặc cột mới, phải cung cấp lệnh SQL để người dùng tự thực thi trên Supabase SQL Editor.
4. **Track SQL Execution**: Mỗi lần AI cung cấp câu lệnh SQL cho user, BẮT BUỘC phải tự động ghi chú (note) vào danh sách "Các bảng đã tạo" dưới đây để tránh tạo trùng lặp.
5. **Update README**: Bất cứ tính năng mới nào được build xong, BẮT BUỘC phải cập nhật mô tả tính năng đó vào file `README.md` (mục "✨ Tính năng") ngay sau khi hoàn thành.
6. **Page.tsx Architecture**: Toàn bộ file `page.tsx` trong thư mục `app/` CHỈ ĐƯỢC PHÉP chứa import. KHÔNG đặt UI hay logic trực tiếp vào `page.tsx`. UI phải được đặt trong thư mục `components/`, logic phải được đặt trong `hooks/`.

## Các bảng (Tables) đã tạo trên Supabase:
- `answers` ✅ RLS (Đã thêm cột `used_hint` BOOLEAN, `user_id UUID`)
- `categories` ✅ RLS (Public read-only policy)
- `code_reviews` ✅ RLS (Đã thêm cột `user_id UUID`)
- `cv_analyses` ✅ RLS (Đã tạo để lưu CV analysis, bao gồm: cv_text, skills, experience, projects, education, strengths, weaknesses, learning_recommendations, interview_questions, overall_score, name, current_level, level_reason; Đã thêm `user_id UUID`)
- `jd_analyses` ✅ RLS (Đã ALTER `session_id` → nullable; `questions_json` chứa levelReason, focusSkills, questions, exercises; Đã thêm `user_id UUID`)
- `question_bank` ✅ RLS (Public read-only policy)
- `question_overview` (View - không cần RLS)
- `questions` ✅ RLS (Public read-only policy)
- `sessions` ✅ RLS (Đã thêm cột `user_id UUID`)
- `topics` ✅ RLS (Public read-only policy)
- `user_stats` ✅ RLS (Đã thêm cột `user_id UUID`)
