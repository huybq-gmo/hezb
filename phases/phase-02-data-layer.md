# Phase 2 - Data layer có kiểu và fallback locale

## Mục tiêu

Đặt một lớp truy vấn duy nhất giữa UI và Supabase cho các thực thể dynamic. Nội dung doanh nghiệp/menu tĩnh không đi qua query layer. Tất cả project/member public phải được lọc đúng RLS/publish state và fallback từ `en` sang `vi` khi thiếu bản dịch.

## Công việc

- [ ] Tạo kiểu `ProjectView`, `MemberView`, `CategoryView` dựa trên `src/types/db.ts`; không khai báo bản sao không đồng bộ.
- [ ] Implement `getFeaturedProjects(locale, limit = 3)`, chỉ lấy `is_published = true` và `is_featured = true`.
- [ ] Implement `getProjects(locale, categorySlug?)`, lọc publish, category, sort `sort_order` rồi `created_at desc`.
- [ ] Implement `getProjectBySlug(slug, locale)`, join category + translation và trả `null` nếu draft/không tồn tại.
- [ ] Implement `getFeaturedMembers(locale, limit = 4)` và `getMembers(locale)`, chỉ lấy `is_published = true`, sort theo `sort_order` rồi `created_at desc`.
- [ ] Implement `getCategories()` và `getPublishedSlugs()` cho filter, static params và sitemap.
- [ ] Chuẩn hóa merge translation để field thiếu ở `en` fallback theo từng field sang `vi`, không làm mất dữ liệu chung của project.
- [ ] Viết unit test cho project/member locale fallback, draft visibility, category filter, featured limit và sort order.

## Cấu trúc đầu ra

```text
src/lib/queries/
  projects.ts
  members.ts
  categories.ts
src/lib/validators/
  member.ts
src/types/
  db.ts
  view-models.ts
tests/queries/
```

## Nghiệm thu

- Mọi query public dùng `lib/supabase/public.ts`, không đọc cookies/session.
- Project draft `sample-vision-qc` không xuất hiện qua bất kỳ query public nào.
- Bản dịch project/member thiếu hoặc sai cấu trúc được xử lý an toàn; UI không crash và có fallback `vi` theo contract.
- Test query/fallback pass; `pnpm lint`, `pnpm typecheck`, `pnpm build` pass.

## Gate sang Phase 3-5

UI có thể lấy dữ liệu thật bằng các hàm query trên mà không gọi Supabase trực tiếp trong component. Đây là contract cố định; thay đổi schema sau phase này phải qua migration và regenerate types.
