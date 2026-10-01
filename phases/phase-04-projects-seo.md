# Phase 4 - Projects, chi tiết dự án và SEO public

## Mục tiêu

Thay route hash và dữ liệu mẫu của mockup bằng các route SEO-friendly, có filter theo category, trang chi tiết an toàn và sitemap chỉ chứa nội dung đã publish.

## Công việc

- [ ] Tạo `/[locale]/projects` với grid, `CategoryFilter` dùng link query `?cat=` để hoạt động khi tắt JavaScript.
- [ ] Hiển thị trạng thái rỗng, lỗi truy vấn và loading hợp lý; không hiển thị draft.
- [ ] Tạo `/[locale]/projects/[slug]`: breadcrumb, cover, title/summary/content/result, metadata client/year/category/tech, gallery và CTA contact.
- [ ] Dùng `generateStaticParams` từ `getPublishedSlugs`, giữ `dynamicParams` để project mới vẫn vào được; gọi `notFound()` cho draft/slug không tồn tại.
- [ ] Cover thiếu thì dùng gradient thumbnail ổn định từ project slug; cover có thì dùng `next/image` với `sizes` đúng layout.
- [ ] Render Markdown không cho raw HTML/XSS. `react-markdown` không nằm trong stack A2, vì vậy trước khi cài phải ghi ADR/duyệt exception; nếu không duyệt, dùng renderer giới hạn cú pháp đã cho phép.
- [ ] Tạo `src/app/sitemap.ts` cho static pages + published slugs của cả `vi` và `en`, cùng `robots.ts`.
- [ ] Metadata từng project có title/description/OG; dùng cover URL làm `og:image` khi có.

## Nghiệm thu

- `?cat=ai`, `?cat=web`, `?cat=auto` lọc đúng category từ DB; category mới không cần sửa component.
- Slug draft trả 404; draft không có trong sitemap, generate params hoặc card public.
- Sitemap có đúng số project publish x 2 locale và có alternate URL hợp lệ.
- Markdown chứa HTML script bị vô hiệu hóa/loại bỏ; ảnh gallery có alt.
- Mobile 360px và desktop không overflow hoặc chồng lấn cột detail.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` pass.

