# 🧭 Git Cheatsheet — Interview Prep

Tổng hợp các lệnh Git dùng thường xuyên trong dự án này, đi kèm mô tả và ví dụ áp dụng
theo đúng workflow đã định nghĩa trong [`rule.md`](./rule.md) (nhánh cố định, PR luôn
vào `release`, không push thẳng `main`).

---

## 1. Kiểm tra trạng thái

| Lệnh | Mô tả |
|---|---|
| `git status` | Xem file nào đã sửa, đã stage hay chưa, đang ở nhánh nào |
| `git status -s` | Bản gọn — mỗi file 1 dòng, ký hiệu `M` (modified), `A` (added), `??` (untracked) |
| `git diff` | Xem nội dung thay đổi **chưa stage** |
| `git diff --cached` | Xem nội dung thay đổi **đã stage** (sắp commit) |
| `git diff <branch1> <branch2>` | So sánh khác biệt giữa 2 nhánh |

## 2. Lịch sử commit

| Lệnh | Mô tả |
|---|---|
| `git log` | Xem lịch sử commit đầy đủ (author, date, message) |
| `git log --oneline` | Rút gọn — mỗi commit 1 dòng, chỉ hash ngắn + subject |
| `git log --oneline --graph --all` | Xem dạng cây phân nhánh trực quan (khuyên dùng thường xuyên) |
| `git log -p -1` | Xem chi tiết diff của commit gần nhất |
| `git log --author="hieujojo"` | Lọc commit theo tác giả |
| `git log <file>` | Xem lịch sử thay đổi của riêng 1 file |
| `git show <commit-hash>` | Xem chi tiết nội dung 1 commit cụ thể |
| `git blame <file>` | Xem từng dòng trong file do commit nào, ai sửa gần nhất |

## 3. Nhánh (Branch)

| Lệnh | Mô tả |
|---|---|
| `git branch` | Liệt kê nhánh local, `*` đánh dấu nhánh đang đứng |
| `git branch -a` | Liệt kê cả nhánh local lẫn remote |
| `git checkout <branch>` | Chuyển sang nhánh đã tồn tại |
| `git checkout -b <branch>` | Tạo nhánh mới **và** chuyển sang luôn (lưu ý: `-b` viết liền, không có dấu cách) |
| `git switch <branch>` | Cách hiện đại hơn để chuyển nhánh (thay `checkout`) |
| `git branch -d <branch>` | Xoá nhánh local đã merge xong |
| `git branch -D <branch>` | Xoá nhánh local **cưỡng chế**, kể cả chưa merge (cẩn thận!) |

**Quy ước riêng của dự án:** luôn `checkout` nhánh cố định (`feat/hieu`, `fix/hieu`,
`refactor/hieu`, `chore/hieu`, `opt/hieu`, `docs/hieu`, `test/hieu`) xuất phát từ `main`,
trừ khi là module lớn thì mới tạo nhánh riêng (`feat/module-lon`).

## 4. Staging & Commit

| Lệnh | Mô tả |
|---|---|
| `git add <file>` | Stage 1 file cụ thể |
| `git add .` | Stage toàn bộ file đã thay đổi trong thư mục hiện tại |
| `git add -p` | Stage **từng phần** trong 1 file (interactive) — hữu ích khi 1 file có nhiều thay đổi không liên quan nhau |
| `git commit -m "message"` | Commit với message 1 dòng |
| `git commit -m "subject" -m "body"` | Commit có cả tiêu đề và mô tả chi tiết (2 flag `-m` liên tiếp) |
| `git commit` | Mở editor để soạn message dài — sẽ tự điền template từ `rule/.gitmessage` nếu đã `git config commit.template` |
| `git commit --amend` | Sửa lại commit **gần nhất** (message hoặc thêm file quên add) — chỉ dùng khi **chưa push** |
| `git reset <file>` | Bỏ stage 1 file (giữ nguyên nội dung sửa) |
| `git reset --soft HEAD~1` | Undo commit gần nhất, giữ nguyên thay đổi ở trạng thái staged |
| `git reset --hard HEAD~1` | Undo commit gần nhất, **xoá luôn** thay đổi (cẩn thận, mất code!) |

## 5. Stash (tạm cất thay đổi)

Dùng khi đang code dở nhưng cần chuyển nhánh gấp mà chưa muốn commit.

| Lệnh | Mô tả |
|---|---|
| `git stash` | Cất toàn bộ thay đổi chưa commit vào "kho tạm", trả working directory về sạch |
| `git stash -u` | Cất luôn cả file mới (untracked) — mặc định `git stash` bỏ qua file chưa từng add |
| `git stash list` | Xem danh sách các lần đã stash |
| `git stash pop` | Lấy lại lần stash **gần nhất** và xoá khỏi kho tạm |
| `git stash apply` | Lấy lại lần stash gần nhất nhưng **giữ nguyên** trong kho tạm (dùng khi muốn áp dụng lại nhiều lần) |
| `git stash drop` | Xoá 1 lần stash cụ thể khỏi kho tạm mà không áp dụng |
| `git stash clear` | Xoá sạch toàn bộ kho stash |

## 6. Đồng bộ với Remote (GitHub)

| Lệnh | Mô tả |
|---|---|
| `git fetch origin` | Tải thông tin mới nhất từ GitHub về, **không** merge vào code hiện tại |
| `git pull origin <branch>` | Tải **và** merge luôn thay đổi mới nhất từ GitHub vào nhánh hiện tại |
| `git push origin <branch>` | Đẩy commit local lên GitHub |
| `git push -u origin <branch>` | Đẩy lần đầu tiên của 1 nhánh mới, đồng thời gán "upstream" — từ lần sau chỉ cần gõ `git push` không cần ghi lại tên nhánh |

## 7. Quy trình Pull Request (đúng chuẩn dự án)

```bash
git checkout main
git pull origin main
git checkout -b feat/hieu          # hoặc fix/ chore/ docs/ test/ opt/ refactor/
# ... code, commit theo rule/COMMIT_TEMPLATE.md ...
git push -u origin feat/hieu
```
Sau đó lên GitHub → **New pull request** → `base: release`, `compare: feat/hieu`.

⚠️ Không bao giờ đặt `base: main` khi tạo PR (trừ khi bạn là người chủ động merge
`release → main` để deploy production thật).

## 8. Xử lý lỗi thường gặp

| Tình huống | Lệnh xử lý |
|---|---|
| Commit nhầm nhánh (chưa push) | `git reset --soft HEAD~1` → checkout đúng nhánh → commit lại |
| Muốn huỷ toàn bộ thay đổi chưa stage | `git checkout -- <file>` (khôi phục file về trạng thái commit gần nhất) |
| Merge conflict khi `pull` | Mở file bị conflict, tìm đoạn `<<<<<<<` / `=======` / `>>>>>>>`, sửa tay, sau đó `git add <file>` rồi `git commit` |
| Push bị từ chối (`rejected`) vì remote mới hơn | `git pull origin <branch>` trước, giải quyết conflict nếu có, rồi `git push` lại |
| Quên chưa `pull` trước khi tạo nhánh mới | `git checkout main && git pull && git checkout -b <nhánh-cũ>` rồi `git rebase main` |

## 9. Alias hữu ích (tuỳ chọn — giúp gõ lệnh nhanh hơn)

Chạy 1 lần để thiết lập, sau đó dùng lệnh rút gọn:
```bash
git config --global alias.st "status -s"
git config --global alias.lg "log --oneline --graph --all"
git config --global alias.co "checkout"
git config --global alias.br "branch"
```
Sau khi config, có thể gõ `git st` thay vì `git status -s`, `git lg` thay vì
`git log --oneline --graph --all`, v.v.

## 10. GitHub CLI (`gh`) — thao tác GitHub ngay từ Terminal

`gh` là công cụ riêng của GitHub (không phải lệnh `git` thuần), cho phép làm việc với
Issue, PR, Actions... mà không cần mở trình duyệt. Cần đăng nhập 1 lần bằng `gh auth login`.

### Pull Request

| Lệnh | Mô tả |
|---|---|
| `gh pr create --base release --fill` | Tạo PR từ nhánh hiện tại vào `release`, tự điền title/body theo commit message gần nhất (đã dùng) |
| `gh pr create --base release --title "..." --body "..."` | Tạo PR với title/body tự viết tay, thay vì để `--fill` tự lấy từ commit |
| `gh pr list` | Xem danh sách PR đang mở |
| `gh pr view <số-PR>` | Xem chi tiết 1 PR (trực tiếp trong Terminal) |
| `gh pr view <số-PR> --web` | Mở PR đó trên trình duyệt |
| `gh pr checkout <số-PR>` | Checkout về đúng nhánh của 1 PR để review/test local |
| `gh pr merge <số-PR>` | Merge PR (sẽ hỏi thêm kiểu merge: merge commit / squash / rebase) |
| `gh pr status` | Xem nhanh: PR nào của mình đang chờ review, PR nào cần mình review |

### Issue

| Lệnh | Mô tả |
|---|---|
| `gh issue create` | Tạo issue mới — nếu repo có Issue Template (như `.github/ISSUE_TEMPLATE/`), `gh` sẽ hỏi bạn chọn template nào |
| `gh issue list` | Xem danh sách issue đang mở |
| `gh issue list --label bug` | Lọc issue theo label |
| `gh issue view <số-issue>` | Xem chi tiết 1 issue |
| `gh issue close <số-issue>` | Đóng issue thủ công (thường không cần, vì `Closes #<số>` trong commit đã tự đóng khi merge vào `release`) |

### Repo

| Lệnh | Mô tả |
|---|---|
| `gh repo view --web` | Mở trang repo trên trình duyệt |
| `gh repo clone <owner>/<repo>` | Clone repo về máy (tương đương `git clone` nhưng tự dùng đúng URL) |
| `gh browse` | Mở trang GitHub của repo hiện tại (đang đứng ở thư mục nào thì mở đúng repo đó) |

### GitHub Actions (CI/CD)

| Lệnh | Mô tả |
|---|---|
| `gh run list` | Xem lịch sử các lần Actions đã chạy (build, test, deploy...) |
| `gh run view <run-id> --log` | Xem log chi tiết 1 lần chạy Actions — hữu ích khi debug lỗi CI |
| `gh workflow run <tên-workflow>` | Kích hoạt chạy tay 1 workflow (nếu workflow đó cho phép `workflow_dispatch`) |

### Khác

| Lệnh | Mô tả |
|---|---|
| `gh release create <tag>` | Tạo 1 GitHub Release mới (ví dụ khi deploy version chính thức) |
| `gh gist create <file>` | Upload 1 file thành Gist (đoạn code chia sẻ nhanh, có link riêng) |
| `gh api <endpoint>` | Gọi thẳng GitHub REST API — dùng khi cần thao tác nâng cao không có sẵn subcommand |

### Áp dụng vào workflow của dự án

```bash
git checkout -b feat/hieu
# ... code, commit ...
git push -u origin feat/hieu
gh pr create --base release --fill
```
→ Gộp 4 bước cuối (tạo PR, điền title/body, chọn base branch) thành **1 dòng lệnh**, không cần mở trình duyệt thao tác dropdown `base`/`compare` như hướng dẫn thủ công trước đó.

## 11. 🚨 Khôi phục code bị mất & Giải quyết xung đột

### A. Mất code — các tình huống thường gặp và cách cứu

| Tình huống | Lệnh cứu |
|---|---|
| Lỡ `git reset --hard` mất commit | `git reflog` → tìm hash commit trước khi mất → `git reset --hard <hash>` |
| Lỡ xoá nhánh (`git branch -D`) chứa code chưa merge | `git reflog` → tìm hash cuối cùng của nhánh đó → `git checkout -b <tên-nhánh-cũ> <hash>` |
| Lỡ `git checkout -- <file>` mất thay đổi chưa commit | Không cứu được bằng Git (đây là thao tác ghi đè trực tiếp, không lưu lịch sử) — đây là lý do **luôn `git add` trước khi thử lệnh nguy hiểm**, vì code đã `add` thì khó mất hơn |
| Lỡ `git stash drop`/`git stash clear` | `git fsck --unreachable | grep commit` → tìm hash gần với thời điểm mất → `git stash apply <hash>` |
| Mất hẳn 1 file do commit rồi xoá | `git log --all --full-history -- <đường-dẫn-file>` → tìm commit gần nhất còn file đó → `git checkout <commit-hash> -- <đường-dẫn-file>` |
| Muốn xem lại toàn bộ commit "vô hình" (kể cả đã bị reset/xoá nhánh) | `git reflog --all` |

> 💡 **`git reflog` là "cứu tinh" quan trọng nhất** — Git gần như không bao giờ xoá dữ liệu ngay lập tức,
> nó chỉ "ẩn" đi khỏi các lệnh thường dùng. `reflog` ghi lại **mọi** thao tác HEAD từng trỏ tới
> (checkout, commit, reset, merge...) trong ~90 ngày gần nhất, nên gần như luôn cứu được.

### B. Quy tắc phòng ngừa trước khi làm thao tác nguy hiểm

Trước khi chạy `git reset --hard`, `git rebase`, hoặc `git branch -D`, luôn tạo 1 nhánh backup:
```bash
git branch backup/truoc-khi-reset
```
→ Nếu thao tác sau đó có sai, chỉ cần `git checkout backup/truoc-khi-reset` để lấy lại nguyên trạng, xoá tốn 3 giây nhưng cứu được hàng giờ code.

### C. Xung đột (Conflict) khi `pull` hoặc `merge`

**Bước 1 — Nhận diện file bị conflict:**
```bash
git status
```
Các file bị conflict sẽ có nhãn `both modified`. Hoặc liệt kê nhanh chỉ tên file:
```bash
git diff --name-only --diff-filter=U
```

**Bước 2 — Mở từng file, tìm đoạn đánh dấu:**
```
<<<<<<< HEAD
   (code hiện tại của bạn)
=======
   (code từ nhánh đang merge vào)
>>>>>>> feat/hieu
```
Sửa tay: xoá 3 dòng đánh dấu (`<<<<<<<`, `=======`, `>>>>>>>`), giữ lại phần code đúng
(có thể là 1 trong 2 bên, hoặc kết hợp cả 2).

> 💡 Trong VS Code/Antigravity, khi mở file conflict sẽ hiện sẵn nút **"Accept Current Change"**,
> **"Accept Incoming Change"**, **"Accept Both Changes"** ngay phía trên đoạn bị conflict —
> nhanh hơn tự xoá tay ký hiệu.

**Bước 3 — Đánh dấu đã xử lý xong, hoàn tất merge:**
```bash
git add <file-đã-sửa>
git commit
```
(Nếu đang conflict do `pull`, Git tự tạo sẵn commit message dạng "Merge branch..." — giữ nguyên hoặc sửa lại đều được.)

**Nếu đang conflict do `rebase`** (không phải `merge`/`pull` thường), sau khi sửa xong dùng:
```bash
git add <file-đã-sửa>
git rebase --continue
```

### D. Muốn huỷ bỏ, quay lại trước khi conflict xảy ra

| Đang conflict do | Lệnh huỷ toàn bộ, quay về như trước |
|---|---|
| `git merge` / `git pull` | `git merge --abort` |
| `git rebase` | `git rebase --abort` |
| `git cherry-pick` | `git cherry-pick --abort` |

→ Các lệnh `--abort` này **an toàn tuyệt đối**, đưa mọi thứ về đúng trạng thái trước khi bắt đầu
thao tác, dùng thoải mái khi thấy conflict quá rối không biết xử lý sao.

### E. Xem trước sẽ conflict ở đâu, trước khi thực sự `merge`

```bash
git merge --no-commit --no-ff <branch>
```
Git sẽ thử merge nhưng **chưa tạo commit** — bạn xem trước được có conflict hay không.
Nếu muốn huỷ thử nghiệm này: `git merge --abort`.