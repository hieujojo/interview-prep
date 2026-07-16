# 📘 Interview Prep - Project Rules

## 🎯 1. Project Architecture & Conventions

1. **Database Persistence**: Mọi tính năng mới liên quan đến dữ liệu người dùng (lịch sử, kết quả, settings, lỗi sai, v.v...) BẮT BUỘC phải được lưu vào cơ sở dữ liệu Supabase.
2. **Page.tsx Architecture**: Toàn bộ file `page.tsx` trong thư mục `app/` CHỈ ĐƯỢC PHÉP chứa import. KHÔNG đặt UI hay logic trực tiếp vào `page.tsx`. UI phải được đặt trong thư mục `components/`, logic phải được đặt trong `hooks/`.
Khi `page.tsx` chứa logic hoặc UI vi phạm, đẩy logic vào hook đã có sẵn (hoặc hook liên quan trong hooks/) và đẩy UI vào component đã có sẵn (trong components/) tương ứng với tính năng đó — KHÔNG tạo file mới. Nghĩa là tận dụng lại useXxx.ts và XxxView.tsx đang tồn tại, sửa trực tiếp trong đó.
3. **API Route per Feature**: Bất cứ khi nào tạo table mới hoặc tính năng mới có gọi AI/external service, BẮT BUỘC tạo kèm file `app/api/[tên-chức-năng]/route.ts` tương ứng.
4. **Update README**: Bất cứ tính năng mới nào được build xong, BẮT BUỘC phải cập nhật mô tả tính năng đó vào file `README.md` (mục "✨ Tính năng") ngay sau khi hoàn thành.

---

## ⚛️ 2. React & Hooks Best Practices (STRICT RULES)

1. **useState**
   - Chỉ lưu những dữ liệu thực sự thay đổi theo thời gian.
   - **Không lưu Derived State**: Không lưu các giá trị có thể tính toán trực tiếp từ props hoặc state khác. 
   - *Ví dụ:* Nếu cần cờ `hasData`, hãy dùng `const hasData = dataText.length > 0` thay vì tạo riêng `const [hasData, setHasData] = useState(false)` rồi sync chúng bằng useEffect.

2. **useEffect**
   - Chỉ dùng cho Side Effects: gọi API, subscribe/unsubscribe, timer, thao tác DOM.
   - Không dùng `useEffect` để tính toán dữ liệu có thể thực hiện ngay trong quá trình render.
   - Nếu một function chỉ được sử dụng bên trong `useEffect`, ưu tiên **khai báo function ngay trong `useEffect`** thay vì tách ra ngoài và bọc `useCallback`.

3. **useCallback & useMemo**
   - Không sử dụng mặc định cho mọi function hay giá trị computed.
   - Chỉ sử dụng khi: truyền xuống component con có dùng `React.memo`, hoặc tính toán thực sự tốn kém (expensive computation), hoặc cần stable reference cho các hook khác tái sử dụng nhiều nơi.
   - ⚠️ **Tránh Stale Closures & Dependency Thừa**: Không đưa state/props vào dependency array nếu chúng không thực sự được đọc bên trong body của function.

4. **useRef**
   - Dùng để lưu trữ giá trị mutable không trigger re-render (ví dụ: timer ID, DOM reference, cờ chặn double-call api).
   - Không lạm dụng `useRef` để thay thế state nếu giá trị đó cần phản ánh lên UI.

5. **Dependency Array (eslint)**
   - TUYỆT ĐỐI KHÔNG disable `react-hooks/exhaustive-deps` (kể cả dùng `eslint-disable-line`) nếu không có lý do chính đáng.
   - Mọi dependency bị bỏ qua **BẮT BUỘC phải có comment giải thích rõ lý do** ở dòng ngay phía trước (ví dụ: intentional closure, tránh re-render loop từ object mới, v.v...).

---

## 🗄️ 3. Database & Supabase Rules

1. **No LocalStorage**: TUYỆT ĐỐI KHÔNG sử dụng `localStorage` hay `sessionStorage` cho việc lưu trữ dữ liệu vĩnh viễn hoặc dữ liệu cần phân tích.
2. **No Custom Clients**: Luôn import `supabase` từ `@/lib/supabase`. Tuyệt đối không `createBrowserClient` trong hook.
3. **User Authentication on Every Table**: Mọi truy vấn DB (SELECT, INSERT, UPDATE, DELETE) tại API Routes BẮT BUỘC:
   - Kiểm tra user bằng `await supabase.auth.getUser()` **trước** khi thao tác. Trả về `401` nếu chưa đăng nhập.
   - Luôn filter `.eq("user_id", user.id)` khi SELECT/UPDATE/DELETE.
   - Luôn gán `user_id: user.id` khi INSERT.
   - TUYỆT ĐỐI KHÔNG fetch toàn bảng không điều kiện (trừ bảng public read-only).
4. **No UPDATE without WHERE**: Mọi Trigger/Function chạy `UPDATE` phải có mệnh đề `WHERE`. Nếu thiếu, extension `safeupdate` sẽ block toàn bộ thao tác.
5. **Sync Schema**: Nếu xóa field ở frontend, BẮT BUỘC phải kiểm tra và DROP constraint `NOT NULL` tương ứng dưới DB.
6. **Track SQL Execution**: Mỗi lần cung cấp lệnh SQL tạo bảng/cột mới cho user chạy trên Supabase SQL Editor, BẮT BUỘC phải tự động ghi chú vào mục "Các bảng đã tạo" bên dưới.

---

## 🔄 4. Git Workflow (Quy chuẩn nhánh & đóng Issue)
 
Ưu tiên sử dụng các **nhánh cố định** thay vì tạo nhánh mới cho từng thay đổi nhỏ:
 
| Nhánh | Mục đích |
|-------|----------|
| `feat/hieu` | Tính năng mới |
| `fix/hieu` | Bug fix |
| `refactor/hieu` | Refactor code |
| `chore/hieu` | Việc vặt (cập nhật package, cấu hình, format code) |
| `opt/hieu` | Tối ưu hiệu năng |
| `docs/hieu` | Cập nhật tài liệu (README, rule.md, comment) |
| `test/hieu` | Viết/sửa test case |
 
**Quy tắc làm việc:**
1. Chỉ tạo nhánh mới (ví dụ: `feat/module-lon`) khi đó là module lớn, độc lập. Luôn checkout nhánh mới từ `main`.
2. Tên nhánh mới dùng chữ thường, ngăn cách bằng dấu `-`.
3. Khi commit code để fix issue, **BẮT BUỘC** có từ khóa trong message: `Closes #<issue-number>` (VD: `fix: sửa lỗi A. Closes #11`).
4. **KHÔNG** gửi Pull Request (PR) vào `main`.
5. **LUÔN** gửi PR vào nhánh `release`. GitHub sẽ tự đóng issue khi PR được merge vào `release`. Nhánh `main` chỉ nhận merge từ `release` khi deploy thực tế.
6. Commit message tuân theo chuẩn trong [`COMMIT_TEMPLATE.md`](./COMMIT_TEMPLATE.md).

---

## 📋 5. Các bảng (Tables) đã tạo trên Supabase

- `answers` ✅ RLS (Đã thêm `used_hint`, `user_id`, `session_id`, `question_content`, `category`. Đã DROP `question_id` do bỏ bảng `questions`)
- `categories` ✅ RLS (Public read-only policy)
- `exercises` ✅ RLS (Public read-only. Catalog 85 bài tập, 17 topic, đã seed qua CSV import)
- `exercise_submissions` ✅ RLS (Thay thế `code_reviews`. Lưu lịch sử nộp code + kết quả AI review, liên kết `exercise_id` nullable)
- `cv_analyses` ✅ RLS (Đã tạo để lưu CV analysis, bao gồm: cv_text, skills, experience, projects, education, strengths, weaknesses, learning_recommendations, interview_questions, overall_score, name, current_level, level_reason; Đã thêm `user_id UUID`)
- `jd_analyses` ✅ RLS (Đã ALTER `session_id` → nullable; `questions_json` chứa levelReason, focusSkills, questions, exercises; Đã thêm `user_id UUID`)
- `sessions` ✅ RLS (Lưu interview sessions: `type`, `topic`, `user_id UUID`, `created_at`; INSERT + SELECT policy cho authenticated user)
- `topics` ✅ RLS (Public read-only policy)
- `user_stats` ✅ RLS (Đã thêm cột `user_id UUID`, đã thêm `preferred_provider TEXT DEFAULT 'groq'`)
- `notes` ✅ RLS (question_index, question_content, note_text per session).
- `achivement` ✅ RLS
- `documents` ✅ RLS (Lưu metadata tài liệu học tập: title, file_url (Storage path), file_name, file_type, topic_id FK, category_id FK, difficulty, is_public; private bucket `documents` trên Supabase Storage)
- `question_bank` — Đã thêm cột `sample_answer TEXT` (đáp án tham khảo, AI không dùng để chấm điểm)