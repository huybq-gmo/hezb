# Phase 1 - Nền tảng Next.js và app shell

## Mục tiêu

Dựng ứng dụng Next.js App Router chạy được ở `/vi` và `/en`, có TypeScript strict, Tailwind/shadcn, i18n, theme và khung layout thống nhất. Phase này chưa làm nội dung business của landing page.

## Phạm vi triển khai

- [ ] Khởi tạo Next.js theo version đã chốt trong `package.json`, dùng `src/`, App Router, TypeScript strict, ESLint và pnpm.
- [ ] Cài đúng các package trong A2 của `HEZB_PLAN.md`; không thêm package ngoài danh sách nếu chưa ghi quyết định.
- [ ] Khai báo design tokens từ mockup: `#4F46E5`, `#22D3EE`, `#0F172A`, nền sáng/tối, border và radius. Hỗ trợ system theme và nút đổi theme thủ công.
- [ ] Cấu hình font Inter bằng `next/font`; không phụ thuộc Google Fonts runtime.
- [ ] Cấu hình `next-intl` với `vi` mặc định và `en`, route bắt buộc có locale (`/vi/...`, `/en/...`).
- [ ] Tạo `messages/vi.json` và `messages/en.json` theo `STATIC_CONTENT.md`, gồm menu, nội dung Home/About/Careers/Contact/Footer, button, label, validation và trạng thái chung.
- [ ] Tạo `lib/supabase/public.ts`, `server.ts`, `browser.ts`; giữ public client không dùng cookies.
- [ ] Sinh `src/types/db.ts` từ schema Phase 0.
- [ ] Dựng `Header`, `Footer`, `Logo`, `LangSwitch`, `ThemeToggle` trong `[locale]/layout.tsx`. Menu tĩnh gồm Trang chủ, Giới thiệu, Dự án, Thành viên, Sự nghiệp, Liên hệ; label và nội dung footer lấy từ `messages/{locale}.json`, không query Supabase.
- [ ] Tạo route `/admin/login` và protected layout rỗng để Phase 6 có điểm nối, chưa triển khai auth guard ở phase này.
- [ ] Thêm script `dev`, `lint`, `typecheck`, `build` và cập nhật README chạy local.
- [ ] Thêm tooling deploy Cloudflare (`wrangler`, `@opennextjs/cloudflare`) như ngoại lệ đã được ghi trong `TECHNICAL_DECISIONS.md`; không cài thêm adapter hosting khác.
- [ ] Chạy smoke build OpenNext ở cuối phase; nếu route bắt buộc không tương thích thì dừng và mở ADR trước khi làm UI business.

## Mapping từ mockup

Header 64px sticky, logo lục giác, nav desktop và nút locale là baseline của HTML. Trên mobile, nav chuyển thành menu dễ truy cập bằng bàn phím. Các token màu/spacing được đưa vào CSS variables, không sao chép style inline của mockup.

## Nghiệm thu

- `pnpm dev` mở được `/vi` và `/en`; đổi ngôn ngữ giữ đúng route tương ứng.
- Theme sáng/tối hoạt động theo system và nút toggle, không gây layout shift.
- Logo có alt/label phù hợp, input/button có focus ring.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` pass.

## Gate sang Phase 2

Một component server bất kỳ có thể import typed Supabase client và `Database` type mà không dùng `any` hoặc service role key.
