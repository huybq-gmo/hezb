# Phase 6 - Admin authentication và khung quản trị

## Mục tiêu

Thay admin mockup không có xác thực bằng khu vực quản trị thật, bảo vệ mọi route/action và cung cấp dashboard tối thiểu.

## Công việc

- [ ] Cấu hình Supabase SSR theo version đang cài; dùng middleware/proxy đúng API của version, không sao chép ví dụ cũ.
- [ ] Tạo `/admin/login` với email/password, pending state, lỗi đăng nhập và redirect sau login.
- [ ] Tạo `lib/supabase/admin-guard.ts` với `requireAdmin()`: kiểm tra session, gọi RPC `is_admin()`, logout + redirect login nếu không có quyền.
- [ ] Gọi `requireAdmin()` ở protected layout và đầu mọi server action có mutation; guard không chỉ dựa vào ẩn link ở UI.
- [ ] Tạo admin layout/sidebar: Dashboard, Dự án, Thành viên, Liên hệ, Xem website, Đăng xuất; mobile dùng overflow/drawer không làm vỡ viewport.
- [ ] Đặt `robots: noindex, nofollow` cho toàn bộ `/admin`.
- [ ] Tạo dashboard với metrics: tổng project, published, thành viên, tin mới, tổng contact; hiển thị 5 tin gần nhất.
- [ ] Thêm error/loading state riêng cho admin; không để query lỗi làm lộ stack trace hoặc secret.

## Nghiệm thu

- User chưa đăng nhập vào `/admin` bị redirect về `/admin/login`.
- Auth user không có row trong `admins` bị logout và nhận thông báo không có quyền.
- Admin thật xem đúng số liệu và 5 message gần nhất theo RLS.
- Direct request tới server action mutation khi không có admin session bị từ chối.
- Reload/refresh session hoạt động, không tạo loop redirect.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` pass.

## Gate sang Phase 7-8

Protected layout và `requireAdmin()` đã ổn định; mọi trang admin mới chỉ cần đặt dưới route group `(protected)` và không tự tạo cơ chế auth riêng.
