# Phase 0 - Chuẩn bị, chốt technical và đầu vào

## Mục tiêu

Biến plan và mockup thành một bộ đầu vào có thể build được, đồng thời khóa kiến trúc $0 trong `TECHNICAL_DECISIONS.md`: Supabase Cloud cho dữ liệu/auth/storage và Cloudflare Workers cho hosting/compute.

## Hiện trạng cần xử lý

Repo hiện chỉ có `HEZB_PLAN.md` và mockup HTML. Chưa có `package.json`, `supabase/migrations/`, `supabase/seed.sql`, `.env.example`, `CLAUDE.md` hoặc file logo SVG. Không đánh dấu phase này hoàn thành nếu các dependency này chỉ tồn tại trên máy cá nhân hoặc trong dashboard mà chưa có nguồn version-control tương ứng.

## Công việc

- [ ] Đọc và chấp nhận `TECHNICAL_DECISIONS.md`; nếu cần domain riêng hoặc email bắt buộc thì mở quyết định mới trước khi code.
- [ ] Tạo/kiểm tra Supabase Cloud project cho dev và production; nếu tài khoản không đủ free projects thì dùng một project với quy trình seed/reset được kiểm soát. Supabase CLI chỉ dùng để link và chạy migration từ xa.
- [ ] Tạo `CLAUDE.md` hoặc `AGENTS.md` từ Phần A của `HEZB_PLAN.md`, ghi rõ đây là nguồn hướng dẫn cho coding agent.
- [ ] Đưa toàn bộ migration cho `categories`, `projects`, `project_translations`, `members`, `member_translations`, `contact_messages`, `admins`, RLS policies, `is_admin()` và bucket `project-media`/`member-media` vào `supabase/migrations/`.
- [ ] Đưa dữ liệu mẫu vào `supabase/seed.sql`; kiểm tra dự án nháp `sample-vision-qc` không xuất hiện khi dùng anon key.
- [ ] Tạo một user admin trong Supabase Auth và một dòng tương ứng trong `admins`; tắt public sign-up.
- [ ] Tạo Turnstile site/secret và Cloudflare account; chỉ tạo Resend API key nếu muốn bật outbound email tùy chọn. Secret chỉ lưu trong secret manager hoặc `.env.local`, không commit.
- [ ] Đưa logo SVG và mockup vào `public/` hoặc `docs/`; xác nhận logo dùng được trên nền sáng/tối.
- [ ] Tạo `.env.example` với các biến public/private được phân loại rõ ràng.
- [ ] Ghi lại quyết định URL production, domain, `NOTIFY_EMAIL`, redirect URL của Supabase Auth và môi trường `dev`/`prod`.

## Đầu ra bắt buộc

```text
supabase/
  migrations/
  seed.sql
  config.toml
docs/
  DESIGN_REFERENCE.md (nếu cần)
public/
  hezb-logo-full.svg
.env.example
```

## Nghiệm thu

- Supabase Cloud dev/prod (hoặc project cloud dùng chung theo quyết định quota) có đủ bảng, policy và dữ liệu seed; migration/seed chạy được từ Supabase CLI.
- Admin đăng nhập được bằng email/password; user không có trong `admins` không được xem dữ liệu admin.
- Anon key không đọc được `admins`, `contact_messages` hoặc project chưa publish.
- Bucket `project-media` có policy chỉ cho admin upload và public read URL.
- Có bản ghi kiểm tra các biến môi trường, nhưng không chứa secret thật trong Git.

## Gate sang Phase 1

`supabase db reset` (hoặc lệnh tương đương trong môi trường dev) chạy lại được từ migration + seed, và schema đã sẵn sàng để sinh `src/types/db.ts`.
