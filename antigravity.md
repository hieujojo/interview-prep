# Project Rules

1. **Database Persistence**: Mọi tính năng mới liên quan đến dữ liệu người dùng (lịch sử, kết quả, settings, lỗi sai, v.v...) BẮT BUỘC phải được lưu vào cơ sở dữ liệu Supabase.
2. **No LocalStorage**: TUYỆT ĐỐI KHÔNG sử dụng `localStorage` hay `sessionStorage` cho việc lưu trữ dữ liệu vĩnh viễn hoặc dữ liệu cần phân tích.
3. **Database Schema**: Khi có tính năng yêu cầu bảng (table) mới hoặc cột mới, phải cung cấp lệnh SQL để người dùng tự thực thi trên Supabase SQL Editor.
4. **Track SQL Execution**: Mỗi lần AI cung cấp câu lệnh SQL cho user, BẮT BUỘC phải tự động ghi chú (note) vào danh sách "Các bảng đã tạo" dưới đây để tránh tạo trùng lặp.
5. **Update README**: Bất cứ tính năng mới nào được build xong, BẮT BUỘC phải cập nhật mô tả tính năng đó vào file `README.md` (mục "✨ Tính năng") ngay sau khi hoàn thành.

## Các bảng (Tables) đã tạo trên Supabase:
- `answers` (Đã thêm cột `used_hint` BOOLEAN)
- `categories`
- `code_reviews`
- `cv_analyses` (Đã tạo để lưu CV analysis, bao gồm: cv_text, skills, experience, projects, education, strengths, weaknesses, learning_recommendations, interview_questions, overall_score, name, current_level, level_reason)
- `jd_analyses` (Đã ALTER `session_id` → nullable; `questions_json` chứa levelReason, focusSkills, questions, exercises)
- `question_bank`
- `questions`
- `sessions`
- `topics`
- `user_stats`
