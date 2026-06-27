# Project Rules

1. **Database Persistence**: Mọi tính năng mới liên quan đến dữ liệu người dùng (lịch sử, kết quả, settings, lỗi sai, v.v...) BẮT BUỘC phải được lưu vào cơ sở dữ liệu Supabase.
2. **No LocalStorage**: TUYỆT ĐỐI KHÔNG sử dụng `localStorage` hay `sessionStorage` cho việc lưu trữ dữ liệu vĩnh viễn hoặc dữ liệu cần phân tích.
3. **Database Schema**: Khi có tính năng yêu cầu bảng (table) mới hoặc cột mới, phải cung cấp lệnh SQL để người dùng tự thực thi trên Supabase SQL Editor.
4. **Track SQL Execution**: Mỗi lần AI cung cấp câu lệnh SQL cho user, BẮT BUỘC phải tự động ghi chú (note) vào danh sách "Các bảng đã tạo" dưới đây để tránh tạo trùng lặp.
5. **Update README**: Bất cứ tính năng mới nào được build xong, BẮT BUỘC phải cập nhật mô tả tính năng đó vào file `README.md` (mục "✨ Tính năng") ngay sau khi hoàn thành.
6. **Page.tsx Architecture**: Toàn bộ file `page.tsx` trong thư mục `app/` CHỈ ĐƯỢC PHÉP chứa import. KHÔNG đặt UI hay logic trực tiếp vào `page.tsx`. UI phải được đặt trong thư mục `components/`, logic phải được đặt trong `hooks/`.
7. **API Route per Feature**: Bất cứ khi nào tạo table mới hoặc tính năng mới có gọi AI/external service, 
   BẮT BUỘC tạo kèm file `app/api/[tên-chức-năng]/route.ts` tương ứng.

## Git Branch Naming Convention

Mỗi issue/tính năng BẮT BUỘC tạo branch riêng, đặt tên theo quy tắc sau:

| Loại | Format | Ví dụ |
|------|--------|-------|
| Bug fix | `fix/<issue-number>-<mô-tả-ngắn>` | `fix/11-save-session-401` |
| Tính năng mới | `feature/<issue-number>-<mô-tả-ngắn>` | `feature/12-progress-tracking` |

**Quy tắc:**
- Luôn tạo branch từ `main`
- Tên branch dùng chữ thường, ngăn cách bằng dấu `-`
- Commit message cuối phải có `Closes #<issue-number>` để GitHub tự đóng issue khi PR được merge

**Ví dụ commit message:**
```
fix: remove duplicate supabase client, save answers to DB. Closes #11
```

## Các bảng (Tables) đã tạo trên Supabase:
- `answers` ✅ RLS (Đã thêm `used_hint`, `user_id`, `session_id`, `question_content`, `category`. Đã DROP `question_id` do bỏ bảng `questions`)
- `categories` ✅ RLS (Public read-only policy)
- `code_reviews` ✅ RLS (Đã thêm cột `user_id UUID`)
- `cv_analyses` ✅ RLS (Đã tạo để lưu CV analysis, bao gồm: cv_text, skills, experience, projects, education, strengths, weaknesses, learning_recommendations, interview_questions, overall_score, name, current_level, level_reason; Đã thêm `user_id UUID`)
- `jd_analyses` ✅ RLS (Đã ALTER `session_id` → nullable; `questions_json` chứa levelReason, focusSkills, questions, exercises; Đã thêm `user_id UUID`)
- `question_bank` ✅ RLS (Public read-only policy)
- `sessions` ✅ RLS (Lưu interview sessions: `type`, `topic`, `user_id UUID`, `created_at`; INSERT + SELECT policy cho authenticated user)
- `topics` ✅ RLS (Public read-only policy)
- `user_stats` ✅ RLS (Đã thêm cột `user_id UUID`)
- `notes` ✅ RLS (question_index, question_content, note_text per session).
- `achivement` ✅ RLS


## ⚠️ RULES FOR AI AGENTS (SUPABASE)
1. **No custom clients:** Luôn import `supabase` từ `@/lib/supabase`. Tuyệt đối không `createBrowserClient` trong hook.
2. **Sync Schema:** Xóa field ở frontend -> BẮT BUỘC kiểm tra và DROP constraint `NOT NULL` tương ứng dưới DB.
3. **No UPDATE without WHERE:** Mọi Trigger/Function chạy `UPDATE` phải có mệnh đề `WHERE` (ví dụ: `WHERE user_id = uid`). Nếu thiếu, extension `safeupdate` sẽ block toàn bộ thao tác.

## 🔄 Git Workflow (Quy chuẩn đóng Issue tự động)
Quy trình chuẩn khi làm việc với GitHub để tự động hóa việc đóng Issue:

1. **Tạo Issue:** Lên GitHub tạo Issue (ví dụ: Issue `#11`).
2. **Tạo Branch:** Tạo nhánh mới từ `main` (tên nhánh nên chứa số issue để dễ quản lý).
   ```bash
   git checkout -b fix/11-ten-loi-ngan-gon
   ```
3. **Code & Commit:** Sửa code xong, **BẮT BUỘC** phải có từ khóa `Closes #số_issue` hoặc `Fixes #số_issue` trong message. (Đây là "từ khóa ma thuật" giúp GitHub tự động link và đóng issue).
   ```bash
   git add .
   git commit -m "Fix: Sửa lỗi lưu session (401 và DB). Closes #11"
   ```
4. **Push & Pull Request (PR):** Push nhánh lên GitHub và tạo Pull Request.
   ```bash
   git push -u origin fix/11-ten-loi-ngan-gon
   ```
5. **Merged:** Khi PR được duyệt và merge vào `main`, GitHub sẽ **tự động đóng** Issue `#11`. Không cần đóng bằng tay!
