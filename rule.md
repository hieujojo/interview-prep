# Project Rules

1. **Database Persistence**: Mọi tính năng mới liên quan đến dữ liệu người dùng (lịch sử, kết quả, settings, lỗi sai, v.v...) BẮT BUỘC phải được lưu vào cơ sở dữ liệu Supabase.
2. **No LocalStorage**: TUYỆT ĐỐI KHÔNG sử dụng `localStorage` hay `sessionStorage` cho việc lưu trữ dữ liệu vĩnh viễn hoặc dữ liệu cần phân tích.
3. **Database Schema**: Khi có tính năng yêu cầu bảng (table) mới hoặc cột mới, phải cung cấp lệnh SQL để người dùng tự thực thi trên Supabase SQL Editor.
4. **Track SQL Execution**: Mỗi lần AI cung cấp câu lệnh SQL cho user, BẮT BUỘC phải tự động ghi chú (note) vào danh sách "Các bảng đã tạo" dưới đây để tránh tạo trùng lặp.
5. **Update README**: Bất cứ tính năng mới nào được build xong, BẮT BUỘC phải cập nhật mô tả tính năng đó vào file `README.md` (mục "✨ Tính năng") ngay sau khi hoàn thành.
6. **Page.tsx Architecture**: Toàn bộ file `page.tsx` trong thư mục `app/` CHỈ ĐƯỢC PHÉP chứa import. KHÔNG đặt UI hay logic trực tiếp vào `page.tsx`. UI phải được đặt trong thư mục `components/`, logic phải được đặt trong `hooks/`.
7. **API Route per Feature**: Bất cứ khi nào tạo table mới hoặc tính năng mới có gọi AI/external service,
   BẮT BUỘC tạo kèm file `app/api/[tên-chức-năng]/route.ts` tương ứng.
8. **User Authentication on Every Table**: Mọi truy vấn tới Supabase (SELECT, INSERT, UPDATE, DELETE) trên bất kỳ bảng nào chứa dữ liệu người dùng tại các API Route BẮT BUỘC phải:
   - Kiểm tra phiên đăng nhập hiện tại bằng `const { data: { user } } = await supabase.auth.getUser()` **trước** khi thực hiện bất kỳ thao tác DB nào.
   - Trả về `401` nếu `user` là `null` hoặc chưa đăng nhập.
   - Luôn filter bằng `.eq("user_id", user.id)` khi SELECT/UPDATE/DELETE để đảm bảo mỗi user chỉ đọc/ghi được dữ liệu của chính họ.
   - Luôn gán `user_id: user.id` khi INSERT để liên kết bản ghi với đúng tài khoản.
   - TUYỆT ĐỐI KHÔNG fetch toàn bộ bảng mà không có điều kiện `user_id` (trừ bảng public read-only như `topics`, `categories`, `question_bank`).


## Git Branch Naming Convention

Ưu tiên sử dụng các **nhánh cố định** đã có sẵn thay vì tạo nhánh mới cho từng issue nhỏ:

| Nhánh | Mục đích |
|-------|----------|
| `feat/hieu` | Tính năng mới |
| `fix/hieu` | Bug fix |
| `refactor/hieu` | Refactor code |
| `chore/hieu` | Việc vặt: dọn dẹp, cập nhật package, cấu hình, tài liệu  |
| `opt/hieu` | Tối ưu hiệu năng |

**Khi nào tạo nhánh mới?**
Chỉ tạo nhánh riêng khi đó là một **module lớn, độc lập** (ví dụ: tích hợp thanh toán, hệ thống document learning center, v.v...). Các thay đổi thông thường dùng nhánh cố định tương ứng ở trên.

**Quy tắc:**
- Nếu cần tạo nhánh mới → luôn checkout từ `main`
- Tên nhánh mới dùng chữ thường, ngăn cách bằng dấu `-`
- **KHÔNG** pull request vào `main` (nhánh `main` chỉ được merge khi deploy)
- **LUÔN** gửi Pull Request vào nhánh `release`
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
- `user_stats` ✅ RLS (Đã thêm cột `user_id UUID`, đã thêm `preferred_provider TEXT DEFAULT 'groq'`)
- `notes` ✅ RLS (question_index, question_content, note_text per session).
- `achivement` ✅ RLS
- `documents` ✅ RLS (Lưu metadata tài liệu học tập: title, file_url (Storage path), file_name, file_type, topic_id FK, category_id FK, difficulty, is_public; private bucket `documents` trên Supabase Storage)
- `question_bank` — Đã thêm cột `sample_answer TEXT` (đáp án tham khảo, AI không dùng để chấm điểm)


## ⚠️ RULES FOR AI AGENTS (SUPABASE)
1. **No custom clients:** Luôn import `supabase` từ `@/lib/supabase`. Tuyệt đối không `createBrowserClient` trong hook.
2. **Sync Schema:** Xóa field ở frontend -> BẮT BUỘC kiểm tra và DROP constraint `NOT NULL` tương ứng dưới DB.
3. **No UPDATE without WHERE:** Mọi Trigger/Function chạy `UPDATE` phải có mệnh đề `WHERE` (ví dụ: `WHERE user_id = uid`). Nếu thiếu, extension `safeupdate` sẽ block toàn bộ thao tác.

## 🔄 Git Workflow (Quy chuẩn đóng Issue tự động)
Quy trình chuẩn khi làm việc với GitHub để tự động hóa việc đóng Issue:

1. **Tạo Issue:** Lên GitHub tạo Issue (ví dụ: Issue `#11`).

2. **Chọn nhánh làm việc:**
   - Nếu là thay đổi thông thường → dùng nhánh cố định phù hợp (`feat/hieu`, `fix/hieu`, v.v...)
   - Nếu là module lớn, độc lập → tạo nhánh mới từ `main`:
     ```bash
     git checkout main
     git pull origin main
     git checkout -b feat/ten-module-lon
     ```

3. **Code & Commit:** Sửa code xong, **BẮT BUỘC** phải có từ khóa `Closes #số_issue` hoặc `Fixes #số_issue` trong message:
   ```bash
   git add .
   git commit -m "fix: sửa lỗi lưu session (401 và DB). Closes #11"
   ```

4. **Push & Pull Request (PR):** Push nhánh lên GitHub và tạo Pull Request **vào nhánh `release`** (KHÔNG phải `main`):
   ```bash
   git push -u origin fix/hieu
   ```
   > ⚠️ Target của PR luôn là `release`. Nhánh `main` chỉ được merge từ `release` khi chuẩn bị deploy.

5. **Merged:** Khi PR được duyệt và merge vào `release`, GitHub sẽ **tự động đóng** Issue tương ứng. Không cần đóng bằng tay!