# Sổ Điểm Danh Quân Số (GitHub Pages + Supabase)

Web tĩnh (chỉ HTML/JS), chạy trên GitHub Pages, dữ liệu lưu trên Supabase, mỗi tài khoản chỉ thấy dữ liệu của mình (RLS).

## 1. Supabase (dự án `bee`)
1. Tạo project `bee` tại supabase.com (hoặc dùng project có sẵn).
2. **SQL Editor** → dán toàn bộ `supabase/schema.sql` → Run.
3. **Project Settings → API**: copy *Project URL* và *anon/publishable key* → dán vào `config.js`.
4. **Authentication → URL Configuration**: Site URL = `https://trungkz.github.io/bee/`
5. (Tuỳ chọn) **Authentication → Sign In / Providers → Email**: tắt *Confirm email* để đăng ký dùng được ngay. Sau khi tạo xong tài khoản của bạn, nên tắt *Allow new users to sign up* để người lạ không tự đăng ký.

## 2. Đưa lên GitHub
```bash
git init
git branch -M main
git add .
git commit -m "So diem danh + Supabase"
git remote add origin https://github.com/trungkz/bee.git
git push -u origin main
```
Trên GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save**.
Sau ~1 phút web chạy tại: https://trungkz.github.io/bee/

## 3. Dùng
- Mở web → Đăng ký / Đăng nhập → dữ liệu tự đồng bộ (góc header hiện "Đã đồng bộ ☁").
- Lần đầu, nếu trình duyệt còn dữ liệu cũ (bản localStorage) sẽ được hỏi có nhập lên tài khoản không. Nút **Nạp file** vẫn khôi phục từ file sao lưu .json.

## Lưu ý
- Dữ liệu lưu dạng 1 bản JSON cho mỗi tài khoản: nếu mở cùng lúc trên 2 thiết bị rồi sửa cả hai, bản lưu sau sẽ ghi đè bản trước.
- Chỉ đặt `anon/publishable key` trong `config.js`; không bao giờ đưa `service_role` key lên GitHub.
