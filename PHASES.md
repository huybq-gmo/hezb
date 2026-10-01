# Hezb Website - Implementation Phases

Tài liệu này chuyển `HEZB_PLAN.md` và mockup `Hezb – Website UI (Landing, Projects, Contact, Admin).html` thành lộ trình triển khai có thể thực hiện từng bước. `HEZB_PLAN.md` vẫn là nguồn sự thật về yêu cầu; các file trong `phases/` là hướng dẫn thực thi và nghiệm thu. Các quyết định về chi phí và nhà cung cấp nằm trong [TECHNICAL_DECISIONS.md](TECHNICAL_DECISIONS.md); content tĩnh nằm trong [STATIC_CONTENT.md](STATIC_CONTENT.md).

## Cách sử dụng

1. Thực hiện đúng thứ tự Phase 0 đến Phase 9.
2. Mỗi phase làm trên một branch riêng, hoàn thành checklist và chạy đủ các lệnh kiểm tra được nêu trong phase.
3. Chỉ chuyển phase khi mọi tiêu chí nghiệm thu của phase hiện tại đạt và đã commit với message theo quy ước trong `HEZB_PLAN.md`.
4. Không đưa dữ liệu mẫu trong mockup vào component. Dữ liệu public dynamic phải đi qua Supabase query layer; menu và nội dung doanh nghiệp static phải đi qua `messages/{locale}.json`.
5. Core MVP phải chạy được với chi phí hạ tầng bằng 0 theo [TECHNICAL_DECISIONS.md](TECHNICAL_DECISIONS.md); không tự thêm dịch vụ trả phí.

## Thứ tự và đầu ra

| Phase | Tên | Phụ thuộc | Đầu ra chính | Trạng thái | Ước lượng |
|---|---|---|---|---|---:|
| 0 | Chuẩn bị và chốt đầu vào | - | Supabase dev, secrets, schema/seed, asset inventory | Chưa bắt đầu | 0,5 ngày |
| 1 | Nền tảng Next.js và app shell | 0 | App chạy được, i18n, theme, layout public/admin base | Chưa bắt đầu | 0,5-1 ngày |
| 2 | Data layer có kiểu | 1 | Queries, schemas, generated DB types, fallback locale | Chưa bắt đầu | 0,5 ngày |
| 3 | Landing page | 2 | `/vi`, `/en` với nội dung dynamic và responsive UI | Chưa bắt đầu | 1 ngày |
| 4 | Projects và SEO public | 2, 3 | Danh sách, filter, chi tiết, sitemap, metadata | Chưa bắt đầu | 1 ngày |
| 5 | Contact và thông báo tùy chọn | 2, 3 | Form an toàn, admin inbox, Edge Function email tùy chọn | Chưa bắt đầu | 1 ngày |
| 6 | Admin auth và khung quản trị | 2 | Login, guard, sidebar, dashboard | Chưa bắt đầu | 1 ngày |
| 7 | Admin quản lý projects | 6 | CRUD project, translations, media upload, publish workflow | Chưa bắt đầu | 2 ngày |
| 8 | Admin members và messages | 6, 7 | CRUD thành viên dynamic, inbox, status workflow | Chưa bắt đầu | 1,5 ngày |
| 9 | Hardening, kiểm thử và deploy | 3-8 | A11y/SEO/performance, E2E, deploy docs, go-live | Chưa bắt đầu | 1-2 ngày |

Tổng thời gian dự kiến: khoảng 10-12 ngày làm việc cho một người dùng AI coding agent.

## Dependency graph

```text
Phase 0
   |
Phase 1 -----> Phase 2 -----> Phase 3 -----> Phase 4
   |              |              |              |
   |              +------------> Phase 5       |
   |                                             |
   +---------------------------> Phase 6 ------> Phase 7 -----> Phase 8
                                                \              /
                                                 \------------/
                                                       |
                                                    Phase 9
```

Phase 3 và Phase 4 có thể làm song song sau Phase 2 nếu có nhiều người, nhưng vẫn phải hợp nhất theo thứ tự kiểm thử ở Phase 9. Phase 7 cần Phase 6 vì toàn bộ mutation phải đi qua `requireAdmin()`.

Technical baseline đã chốt: Next.js chạy trên Cloudflare Workers qua OpenNext, Supabase Cloud là backend duy nhất.

## Design mapping bắt buộc

| Mockup HTML | Component/route thật | Phase |
|---|---|---:|
| Header, Logo, nav, language button | `Header`, `Logo`, `LangSwitch`, `ThemeToggle`, `[locale]/layout.tsx` | 1 |
| Hero, story, mission, values, CTA, footer | Static messages trong các Server Components | 3 |
| Giới thiệu và Sự nghiệp | `/about`, `/careers` từ static messages | 3 |
| Project cards, category buttons | `ProjectCard`, `ProjectGrid`, `CategoryFilter`, `/projects` | 4 |
| Project detail, metadata, CTA contact | `/projects/[slug]` | 4 |
| Member cards và danh sách thành viên | `MemberCard`, `MemberGrid`, `/members` | 3 |
| Contact form và contact info | `ContactForm`, `/contact`, `submitContact` | 5 |
| Admin dashboard/sidebar | Admin protected layout và dashboard | 6 |
| Admin project table/editor | `/admin/projects`, `/admin/projects/[id]` | 7 |
| Admin members và messages | `/admin/members`, `/admin/messages` | 8 |

Mockup hiện dùng hash route, state trong bộ nhớ và dữ liệu hard-code. Đây chỉ là visual reference; các hành vi đó phải được thay bằng App Router, Supabase, server actions và RLS trong các phase tương ứng.

## Shared definition of done

- TypeScript strict, không dùng `any`, không lộ service role key.
- Public query chỉ trả project đã publish; fallback nội dung `en` sang `vi`.
- Mọi mutation admin gọi `requireAdmin()`, validate bằng zod và revalidate public paths.
- Input có label, ảnh có alt, focus ring rõ, keyboard navigation và contrast đạt WCAG AA.
- Trước khi đóng phase: `pnpm lint`, `pnpm typecheck`, `pnpm build` đều pass (phase 0 chỉ áp dụng khi app đã được scaffold).
- Có ghi chú migration/schema nếu thay đổi database; không sửa migration cũ.

## Phase files

- [Phase 0 - Chuẩn bị](phases/phase-00-preparation.md)
- [Phase 1 - Nền tảng](phases/phase-01-foundation.md)
- [Phase 2 - Data layer](phases/phase-02-data-layer.md)
- [Phase 3 - Landing](phases/phase-03-landing.md)
- [Phase 4 - Projects và SEO](phases/phase-04-projects-seo.md)
- [Phase 5 - Contact và email](phases/phase-05-contact.md)
- [Phase 6 - Admin auth và shell](phases/phase-06-admin-auth.md)
- [Phase 7 - Admin projects](phases/phase-07-admin-projects.md)
- [Phase 8 - Admin members và messages](phases/phase-08-admin-members-messages.md)
- [Phase 9 - Hardening và deploy](phases/phase-09-hardening-deploy.md)
