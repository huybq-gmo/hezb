# Phase 9 - Hardening, kiểm thử và deploy

## Mục tiêu

Đưa ứng dụng từ trạng thái feature-complete sang có thể vận hành: kiểm tra bảo mật, accessibility, SEO, performance, E2E và quy trình release.

## Công việc

- [ ] Rà soát `label`, `alt`, heading order, focus trap, keyboard navigation, skip link, contrast WCAG AA và mobile touch target.
- [ ] Bổ sung `loading.tsx`, `error.tsx`, `not-found.tsx` cho public/admin; lỗi production không lộ stack trace hoặc env.
- [ ] Kiểm tra `next/image` sizes, font loading, cache strategy không cần KV/R2, client JS thừa và bundle size.
- [ ] Kiểm tra SEO: title/description/OG, canonical, hreflang, sitemap, robots, noindex admin và 404 draft.
- [ ] Viết Playwright E2E tối thiểu: home VI/EN, category filter + detail, contact success/validation, admin login, create/publish project thấy trên public.
- [ ] Chạy security smoke test bằng anon key: đọc `admins`, `contact_messages`, draft projects/members; thử upload trái phép; rà soát service role key trong repo/build.
- [ ] Chạy `pnpm lint`, `pnpm typecheck`, `pnpm build`, unit test, Playwright và Lighthouse mobile; lưu kết quả vào CI artifact hoặc docs.
- [ ] Viết `docs/DEPLOY.md`: Supabase prod/migrations/seed, Cloudflare Workers/OpenNext env, Auth redirect, Turnstile, Database Webhook, email tùy chọn, subdomain miễn phí và backup thủ công.
- [ ] Tạo release checklist: thay toàn bộ sample data/email/phone/address, favicon/OG image, admin account, backup alert và rollback plan.

## Nghiệm thu go-live

- Trang chủ, about, careers, members, projects list/detail và contact chạy đúng ở `/vi` và `/en`.
- Draft không lộ trong UI, detail, sitemap, query public hay API.
- Anon không đọc được `admins`/`contact_messages`; admin-only mutations đều có guard + zod.
- Lighthouse mobile home/projects đạt tối thiểu 90 ở Performance, Accessibility và SEO.
- E2E pass trong môi trường test; `pnpm lint`, `pnpm typecheck`, `pnpm build` pass.
- Có Supabase Cloud dev/prod (hoặc một project có kiểm soát nếu quota không cho phép tách), HTTPS trên subdomain Cloudflare, Auth redirect đúng và hướng dẫn rollback/migration.

## Đóng phase

Tạo release tag/commit sau khi checklist `HEZB_PLAN.md` Phần D được tick đầy đủ. Mọi thay đổi sau go-live phải mở task/phase sửa nhỏ riêng, không sửa trực tiếp migration cũ hoặc bỏ qua kiểm thử hồi quy.
