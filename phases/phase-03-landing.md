# Phase 3 - Landing page public

## Mục tiêu

Triển khai `/vi` và `/en` theo thứ tự, nhịp điệu và responsive behavior của mockup. Nội dung doanh nghiệp/menu là static trong messages; chỉ featured projects và featured members lấy từ Supabase.

## Component và dữ liệu

- [ ] `Hero`: lấy title/subtitle/CTA từ `messages/{locale}.json`; highlight dùng `em`/span semantic.
- [ ] `Story`, `MissionGrid`, `ValuesGrid`: lấy nội dung tĩnh từ messages, không query Supabase.
- [ ] `ProjectCard`/`ProjectGrid`: lấy tối đa 3 featured project, hiển thị cover hoặc gradient fallback từ slug/name, category và year.
- [ ] `MemberCard`/`MemberGrid`: lấy tối đa 4 featured member hoặc member có `sort_order` nhỏ nhất, hiển thị avatar, name, role và bio theo locale.
- [ ] `CtaBanner`: lấy title/body/button từ messages, link `/[locale]/contact`.
- [ ] Footer và contact info: lấy từ messages; không query Supabase.
- [ ] Tạo `/[locale]/about`, `/[locale]/careers`, `/[locale]/contact`; Careers chỉ là nội dung tĩnh và CTA, chưa có job board.
- [ ] Mỗi section là Server Component mặc định; chỉ dùng client component cho theme/lang control cần event.
- [ ] Thêm `loading.tsx`, skeleton cho featured projects và `error.tsx` phù hợp.
- [ ] Thêm `generateMetadata` title/description/OG theo locale và alternate/hreflang.
- [ ] Server-render dynamic từ Supabase; không yêu cầu KV/R2/ISR trả phí. Nếu dùng `revalidate`/edge cache của adapter thì phải kiểm tra trên deployment thật và có fallback không cache.

## Design acceptance

- Hero giữ nền radial indigo/cyan nhẹ và khoảng đệm tương đương mockup nhưng không để màu gradient che nội dung.
- Card radius tối đa 16px, button 10px, pill 999px; grid 4 cột cho mission/values và 3 cột cho projects khi đủ chiều rộng.
- 360px không có overflow ngang; CTA, title dài và card text tự xuống dòng.
- Contrast và focus state đạt WCAG AA; ảnh có alt theo title.

## Nghiệm thu

- `/vi`, `/en`, `/about`, `/careers`, `/contact` render nội dung static từ messages.
- Featured project/member list không chứa draft và không quá giới hạn đã định.
- Lighthouse mobile trang chủ đạt tối thiểu 90 cho Performance, Accessibility và SEO.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` pass.

## Gate sang Phase 4

Shared `ProjectCard` đã nhận `ProjectView` từ data layer, không phụ thuộc cấu trúc object `P` trong mockup.
