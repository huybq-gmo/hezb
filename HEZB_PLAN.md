# HEZB WEBSITE – MASTER PLAN (dành cho AI vibe coding)

> Cách dùng: đặt file này ở thư mục gốc repo. Với Claude Code / Cursor / Codex: copy **Phần A** thành `CLAUDE.md` (hoặc `AGENTS.md`), sau đó làm lần lượt từng phase ở **Phần C** bằng cách dán prompt của phase đó. Mỗi phase xong phải qua checklist nghiệm thu rồi mới sang phase tiếp theo.

---

# PHẦN A – PROJECT CONTEXT (copy thành CLAUDE.md / AGENTS.md)

## A1. Tổng quan
- **Hezb** là công ty công nghệ tập trung vào AI và phần mềm. Slogan: **"Build what's next."**
- Website gồm: landing page giới thiệu công ty, các trang thông tin tĩnh (Giới thiệu, Sự nghiệp, Liên lạc), danh sách/chi tiết dự án, danh sách thành viên lấy động từ database, form liên hệ và trang **admin**.
- Menu và nội dung cơ bản của doanh nghiệp là **static trong code/i18n** (`messages/{locale}.json`), không cần CMS/database. Dữ liệu cần quản trị động gồm `projects`, `members` và `contact_messages`, nằm trong Supabase.
- Hai ngôn ngữ: **Tiếng Việt (`vi`, mặc định)** và **English (`en`)**, URL dạng `/vi/...`, `/en/...`.
- Đối tượng người dùng: (1) khách doanh nghiệp xem dự án và liên hệ, (2) admin nội bộ của Hezb.

## A2. Tech stack (đã chốt, không tự ý đổi)
| Lớp | Công nghệ |
|---|---|
| Framework | Next.js (App Router) + TypeScript strict |
| UI | Tailwind CSS + shadcn/ui + lucide-react |
| Backend | Supabase: Postgres, Auth, Storage, Edge Functions |
| Supabase client | `@supabase/supabase-js` + `@supabase/ssr` |
| i18n | `next-intl` |
| Form | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Chống spam | Cloudflare Turnstile + honeypot |
| Email | Admin inbox là bắt buộc; Resend chỉ là adapter free-tier tùy chọn |
| Deploy | Cloudflare Workers (OpenNext) + Supabase Cloud Free |
| Package manager | `pnpm` |

> Khi dùng API của Next.js / next-intl / @supabase/ssr / shadcn, **đối chiếu với phiên bản đã cài** trong `package.json` và docs chính thức. Không viết theo trí nhớ nếu chưa chắc (ví dụ `params` của page là Promise ở Next.js bản mới; tên file `middleware.ts` có thể đã đổi ở bản mới). Quyết định chi phí và giới hạn free tier nằm trong `TECHNICAL_DECISIONS.md`.

## A3. Database (nguồn sự thật: `supabase/migrations/*.sql`)
Bảng: `categories`, `projects`, `project_translations`, `members`, `member_translations`, `contact_messages`, `admins`. Bucket ảnh: `project-media` và `member-media` (public).

- `projects` chứa dữ liệu chung (slug, category_id, client_name, year, tech[], cover_url, gallery[], website_url, is_published, is_featured, sort_order).
- `project_translations(project_id, locale, title, summary, content, result)` chứa chữ theo ngôn ngữ.
- `members` chứa dữ liệu chung (`slug`, `avatar_url`, `linkedin_url`, `is_published`, `sort_order`).
- `member_translations(member_id, locale, name, role, bio)` chứa thông tin thành viên theo ngôn ngữ.
- `contact_messages.topic` ∈ `ai | custom_software | automation | other`; `status` ∈ `new | read | replied | archived`.
- **RLS đã bật**: khách chỉ đọc được dự án/thành viên `is_published = true`; khách chỉ **insert** được `contact_messages`; mọi thao tác ghi khác chỉ admin (hàm `is_admin()`).
- Mọi thay đổi schema phải qua file migration mới trong `supabase/migrations/`, **không sửa file migration cũ**, không sửa tay trên dashboard.
- Sau mỗi lần đổi schema: `supabase gen types typescript --linked > src/types/db.ts`.

## A4. Cấu trúc thư mục mục tiêu
```
src/
  app/
    [locale]/
      layout.tsx                 # font, theme, Header, Footer
      page.tsx                   # Trang chủ
      about/page.tsx             # Giới thiệu tĩnh
      careers/page.tsx           # Sự nghiệp tĩnh
      projects/page.tsx          # Danh sách + lọc
      projects/[slug]/page.tsx   # Chi tiết
      members/page.tsx           # Thành viên từ Supabase
      contact/page.tsx
      not-found.tsx
    admin/
      login/page.tsx
      (protected)/layout.tsx     # sidebar + kiểm tra admin
      (protected)/page.tsx       # dashboard
      (protected)/projects/page.tsx
      (protected)/projects/[id]/page.tsx   # tạo/sửa ("new" = tạo mới)
      (protected)/members/page.tsx
      (protected)/members/[id]/page.tsx
      (protected)/messages/page.tsx
    api/revalidate/route.ts      # (nếu cần) revalidate theo secret
    sitemap.ts  robots.ts
  components/
    site/    (Header, Footer, Hero, Story, MissionGrid, ValuesGrid, ProjectCard, ProjectGrid, CategoryFilter, MemberCard, MemberGrid, CtaBanner, ContactForm, Logo, LangSwitch, ThemeToggle)
    admin/   (Sidebar, DataTable, ProjectForm, MemberForm, ImageUploader, StatusBadge, ConfirmDialog)
    ui/      (shadcn)
  lib/
    supabase/ (public.ts, server.ts, browser.ts, admin-guard.ts)
    queries/  (projects.ts, members.ts, categories.ts)   # mọi truy vấn public đi qua đây
    actions/  (contact.ts, projects.ts, members.ts, messages.ts)  # server actions
    validators/ (contact.ts, project.ts, member.ts)     # zod schema dùng chung
    utils.ts
  i18n/ (routing.ts, request.ts)
  messages/ (vi.json, en.json)        # menu + nội dung doanh nghiệp tĩnh + chữ UI
  types/db.ts
supabase/ (migrations/, seed.sql, functions/notify-contact/)
```

## A5. Quy tắc code (AI BẮT BUỘC tuân thủ)
1. **TypeScript strict**, không dùng `any`. Dùng type sinh từ `types/db.ts`.
2. **Server Components mặc định**; chỉ thêm `"use client"` khi cần state/event.
3. **Phân biệt 2 loại Supabase client:**
   - `lib/supabase/public.ts`: `createClient` thuần với anon key, **không dùng cookies** → dùng cho trang public để trang được cache/ISR.
   - `lib/supabase/server.ts`: `@supabase/ssr` đọc cookies → chỉ dùng trong admin và server actions cần đăng nhập.
4. **Không dùng service role key** ở bất cứ đâu trong app (RLS đã đủ). Nếu thật sự cần (ví dụ Edge Function), chỉ dùng ở phía server và phải giải thích trong PR.
5. Mọi dữ liệu từ form phải **validate bằng zod ở server** (client validate chỉ để UX).
6. Chữ hiển thị: menu và nội dung doanh nghiệp tĩnh lấy từ `messages/{locale}.json`; project/member dynamic lấy từ DB. **Không hard-code chữ tiếng Việt/Anh trong JSX.**
7. Sau mọi thao tác ghi ở admin, gọi `revalidatePath` (hoặc `revalidateTag`) để trang public cập nhật ngay.
8. Form liên hệ: insert bằng anon key, **không `.select()` sau insert** (khách không có quyền đọc).
9. Truy vấn public cho project/member luôn lọc theo `locale` và `is_published`; có fallback sang `vi` nếu thiếu bản dịch `en`.
10. Ảnh dùng `next/image`; upload project vào `project-media`, member vào `member-media`, giới hạn 5MB, jpeg/png/webp/avif; lưu URL công khai vào DB.
11. Accessibility: label cho mọi input, alt cho ảnh, focus ring rõ, tương phản đạt WCAG AA, điều hướng bàn phím được.
12. Không thêm thư viện mới ngoài A2 nếu chưa hỏi. Ưu tiên giải pháp đơn giản nhất chạy được.
13. Mỗi phase kết thúc phải chạy được: `pnpm lint`, `pnpm typecheck`, `pnpm build` không lỗi.
14. Commit nhỏ, message rõ ràng theo dạng `feat(projects): ...`, `fix(contact): ...`.

## A6. Design tokens (lấy từ logo Hezb và bản mockup `hezb.html`)
- **Primary** `#4F46E5` (indigo) · **Accent** `#22D3EE` (cyan) · **Ink/Navy** `#0F172A`
- Nền sáng `#FFFFFF` / nền phụ `#F5F7FB`; nền tối `#0B1020` / phụ `#111833`; viền `#E2E8F0` (sáng), `#222B4A` (tối)
- Font **Inter** (400/500/600/700). Bo góc: card 16px, button 10px, pill 999px.
- Hỗ trợ **light/dark** theo hệ thống, có nút đổi tay.
- Logo: hình lục giác indigo, hai thanh trắng, mũi tên cyan, chữ "Hezb" (file `hezb-logo-full.svg`). Làm component `<Logo />` dùng `currentColor` cho chữ để hợp dark mode.
- Bố cục tham chiếu: file `hezb.html` (mockup). Giữ cùng thứ tự section và phong cách.

## A7. Biến môi trường
Xem `.env.example`. Biến `NEXT_PUBLIC_*` được phép lộ ra client; mọi biến khác tuyệt đối không lộ.

## A8. Ngoài phạm vi (KHÔNG làm ở bản đầu)
Blog/tin tức, hệ thống tin tuyển dụng động, đăng ký thành viên công khai, thanh toán, phân vai trò editor, phân tích lượt xem. Trang Sự nghiệp chỉ là nội dung tĩnh và CTA liên hệ; chỉ làm job board khi có yêu cầu mới.

---

# PHẦN B – ĐẶC TẢ CHỨC NĂNG

## B1. Trang public
| Route | Nội dung | Nguồn dữ liệu |
|---|---|---|
| `/[locale]` | Hero → Story → Mission (4) → Values (4) → Dự án nổi bật (≤3, `is_featured`) → Thành viên tiêu biểu → CTA banner → Footer | static messages + `projects` + `members` |
| `/[locale]/about` | Giới thiệu công ty, cách làm việc và định hướng | static messages |
| `/[locale]/careers` | Sự nghiệp, văn hóa và CTA liên hệ; chưa có job board | static messages |
| `/[locale]/projects` | Lưới dự án đã đăng; lọc theo lĩnh vực (query `?cat=ai`); trạng thái rỗng | `projects`, `categories` |
| `/[locale]/projects/[slug]` | Ảnh bìa, tiêu đề, mô tả, nội dung (Markdown), kết quả, thông tin phụ (khách hàng, năm, lĩnh vực, công nghệ), gallery, nút liên hệ; 404 nếu chưa đăng/không tồn tại | `projects` + `project_translations` |
| `/[locale]/members` | Danh sách thành viên đã publish, avatar, tên, vai trò, bio | `members` + `member_translations` |
| `/[locale]/contact` | Form + thông tin liên hệ cơ bản | static messages + `contact_messages` |

Yêu cầu chung: responsive (mobile trước), SEO (title/description/OG theo từng trang và locale, `hreflang`, sitemap gồm các dự án đã đăng), `loading.tsx` và `error.tsx` hợp lý.

## B2. Form liên hệ
Trường: họ tên*, email*, công ty, điện thoại, chủ đề (select 4 giá trị), nội dung* (5–5000 ký tự). Có honeypot ẩn + Turnstile. Gửi thành công → thông báo xanh, reset form. Lỗi → hiện thông báo từng trường. Giới hạn tần suất (ví dụ 5 lần/giờ/IP, có thể dùng bảng đếm hoặc Turnstile là đủ ở bản đầu). Tin mới luôn vào inbox admin; chỉ gửi email cho `NOTIFY_EMAIL` khi bật adapter outbound tùy chọn.

## B3. Admin
- Đăng nhập email + mật khẩu (Supabase Auth). Người dùng không có trong `admins` → đăng xuất và báo "Không có quyền".
- **Dashboard:** số dự án, số đã đăng, số thành viên, tin mới, tổng liên hệ; 5 tin gần nhất.
- **Dự án:** bảng (tìm kiếm, lọc trạng thái), thêm/sửa/xóa (có xác nhận), bật/tắt Nổi bật và Đã đăng ngay trên bảng, sắp xếp thứ tự (nút lên/xuống là đủ). Form có tab VI/EN, tự sinh slug từ tiêu đề EN, upload ảnh bìa và gallery, nhập công nghệ dạng tag.
- **Thành viên:** bảng tìm kiếm/lọc trạng thái, thêm/sửa/xóa, bật/tắt Đã đăng, sắp xếp thứ tự; form VI/EN cho tên, vai trò, bio; upload avatar; link LinkedIn tùy chọn.
- **Liên hệ:** danh sách tin, mở xem chi tiết, đổi trạng thái, xóa, lọc theo trạng thái; tin mới có nhãn nổi bật.
- Mọi form admin: hiển thị trạng thái đang lưu, thông báo thành công/lỗi (toast), chặn gửi trùng.

## B4. Không chức năng (NFR)
- Lighthouse mobile ≥ 90 (Performance, Accessibility, SEO) trên trang chủ và danh sách dự án.
- Không lộ dữ liệu: kiểm tra bằng cách truy cập bằng anon key, phải không đọc được `contact_messages`, `admins`, dự án nháp.
- Trang public vẫn hiển thị được nếu một section thiếu dữ liệu (ẩn section, không crash).

---

# PHẦN C – CÁC PHASE THỰC HIỆN (kèm prompt dán cho AI)

> Quy ước prompt: luôn mở đầu bằng "Đọc `CLAUDE.md` và `HEZB_PLAN.md` trước." Nếu AI hỏi lại, trả lời theo Phần A/B, không tự thêm tính năng.

## Phase 0 – Chuẩn bị (làm tay, ~30 phút)
1. Dùng Supabase Cloud cho development và production; ưu tiên hai project nếu free quota cho phép, nếu không dùng một project với quy trình seed/reset được kiểm soát. Dùng Supabase CLI để link và chạy `supabase/migrations/*.sql` rồi `seed.sql` từ xa.
2. Tạo user admin và cấp quyền trong bảng `admins`. Tắt đăng ký công khai.
3. Tạo tài khoản Cloudflare Turnstile (site key + secret) và Cloudflare Workers. Chỉ tạo Resend API key nếu bật adapter email tùy chọn.
4. Chuẩn bị repo Git trống; đưa vào `hezb.html`, `hezb-logo-full.svg`, `HEZB_PLAN.md`, `CLAUDE.md`, `.env.example` (đặt trong `docs/` hoặc gốc repo).

**Nghiệm thu:** vào Table Editor thấy dữ liệu seed; đăng nhập thử được bằng user admin.

---

## Phase 1 – Khởi tạo dự án và nền tảng
**Prompt:**
```
Đọc CLAUDE.md và HEZB_PLAN.md trước. Thực hiện Phase 1:
1. Khởi tạo Next.js (App Router, TypeScript, Tailwind, ESLint, thư mục src/) bằng pnpm.
2. Cài và cấu hình shadcn/ui, lucide-react, next-intl, react-hook-form, zod, @hookform/resolvers, @supabase/supabase-js, @supabase/ssr.
3. Cấu hình Tailwind theo design tokens ở A6 (CSS variables cho light/dark, font Inter qua next/font).
4. Cấu hình next-intl: locales vi (mặc định) và en, routing dạng /vi, /en, file messages/vi.json và en.json với các chuỗi UI cơ bản (nav, nút, nhãn form, thông báo lỗi).
5. Tạo lib/supabase/public.ts, server.ts, browser.ts đúng quy tắc A5.3. Sinh src/types/db.ts từ schema.
6. Tạo layout [locale] với Header (Logo, menu tĩnh gồm Trang chủ, Giới thiệu, Dự án, Thành viên, Sự nghiệp, Liên hệ, LangSwitch, ThemeToggle), Footer lấy từ messages/{locale}.json. Component Logo dùng SVG lục giác của Hezb.
7. Thêm scripts: typecheck, lint, build. Tạo .env.example (đã có sẵn, đối chiếu).
Không làm trang nội dung ở phase này. Cuối cùng liệt kê các file đã tạo và cách chạy.
```
**Nghiệm thu:** `pnpm dev` chạy; `/vi` và `/en` hiển thị Header/Footer; menu tĩnh đổi ngôn ngữ đúng; dark mode hoạt động; build không lỗi.

---

## Phase 2 – Data layer (truy vấn có kiểu)
**Prompt:**
```
Đọc CLAUDE.md và HEZB_PLAN.md trước. Thực hiện Phase 2:
Tạo các hàm truy vấn trong src/lib/queries/ dùng client public (không cookies):
- getFeaturedProjects(locale, limit=3)
- getProjects(locale, categorySlug?) chỉ is_published = true, sắp xếp theo sort_order rồi created_at desc
- getProjectBySlug(slug, locale) kèm category, trả null nếu không có/chưa đăng
- getFeaturedMembers(locale, limit=4) và getMembers(locale) chỉ is_published = true, sắp xếp theo sort_order rồi created_at desc
- getCategories()
- getPublishedSlugs() cho sitemap/generateStaticParams của projects
- getPublishedMemberSlugs() nếu member detail được bật; bản đầu chỉ cần route danh sách `/members`
Gộp project + translation thành một kiểu ProjectView (title, summary, content, result, ...). Có fallback bản dịch. Viết test nhanh (vitest) cho phần merge/fallback.
```
**Nghiệm thu:** gọi thử từng hàm trả đúng dữ liệu seed; dự án/thành viên nháp không bao giờ xuất hiện; nội dung menu không có query DB; test pass.

---

## Phase 3 – Landing page
**Prompt:**
```
Đọc CLAUDE.md và HEZB_PLAN.md trước. Thực hiện Phase 3: trang chủ /[locale] và các trang thông tin tĩnh.
Dựng các component Hero, Story, MissionGrid, ValuesGrid, ProjectCard, ProjectGrid, MemberCard, MemberGrid, CtaBanner theo đúng bố cục và phong cách trong hezb.html (mockup). Nội dung doanh nghiệp lấy từ messages/{locale}.json; featured projects và members lấy từ query DB.
- Hero: title = title_before + <span highlight>title_highlight</span> + title_after; có nền gradient indigo/cyan nhẹ.
- Các section dynamic (featured projects/members) tự ẩn nếu query trả rỗng; section tĩnh luôn render từ messages.
- Tạo `/[locale]/about`, `/[locale]/careers`, `/[locale]/contact` với nội dung static; contact form vẫn ghi `contact_messages`.
- Responsive từ 360px; dùng Server Components; trang được cache và có revalidate = 60 dự phòng.
- generateMetadata: title/description/OG và hreflang vi/en.
- Cung cấp loading skeleton cho khối dự án nổi bật.
```
**Nghiệm thu:** so sánh bằng mắt với `hezb.html` trên mobile và desktop; sửa messages rồi build/reload thấy nội dung mới; featured projects/members lấy đúng DB; Lighthouse ≥ 90.

---

## Phase 4 – Trang dự án
**Prompt:**
```
Đọc CLAUDE.md và HEZB_PLAN.md trước. Thực hiện Phase 4:
1. /[locale]/projects: lưới dự án, CategoryFilter dùng query ?cat= (dạng link để SEO được, không cần JS), trạng thái rỗng thân thiện.
2. /[locale]/projects/[slug]: layout giống mockup (ảnh bìa lớn, cột nội dung + cột thông tin), render content Markdown an toàn (react-markdown, không cho HTML thô), gallery ảnh, nút "Liên hệ" dẫn tới /contact, breadcrumb "← Tất cả dự án". Dùng generateStaticParams từ getPublishedSlugs, dynamicParams bật, notFound() khi không có.
3. Nếu không có cover_url: dùng thumbnail gradient từ tên dự án như mockup.
4. Thêm app/sitemap.ts (trang tĩnh + dự án đã đăng, đủ 2 locale) và robots.ts. generateMetadata theo từng dự án, OG image = cover_url.
```
**Nghiệm thu:** lọc theo lĩnh vực đúng; vào slug dự án nháp trả 404; `/sitemap.xml` liệt kê đúng 3 dự án × 2 ngôn ngữ; mobile hiển thị tốt.

---

## Phase 5 – Form liên hệ + thông báo tùy chọn
**Prompt:**
```
Đọc CLAUDE.md và HEZB_PLAN.md trước. Thực hiện Phase 5:
1. Trang /[locale]/contact: ContactForm (react-hook-form + zod, schema dùng chung ở lib/validators/contact.ts), cột thông tin liên hệ lấy từ messages/{locale}.json.
2. Server action submitContact: validate zod, kiểm tra honeypot, xác thực token Turnstile bằng secret phía server, insert vào contact_messages bằng client public (anon), KHÔNG .select(). Trả về kết quả có kiểu (ok / lỗi theo từng trường / lỗi chung). Lưu locale hiện tại.
3. UI: trạng thái đang gửi, thành công (reset form), lỗi từng trường, chống bấm trùng.
4. Tạo Supabase Edge Function supabase/functions/notify-contact: nhận payload từ Database Webhook (INSERT trên contact_messages), luôn giữ message trong inbox; chỉ gửi email qua Resend tới NOTIFY_EMAIL khi `CONTACT_EMAIL_ENABLED=true`. Hướng dẫn hai mode `off`/`on`, webhook và secrets trong docs/NOTIFY.md.
```
**Nghiệm thu:** gửi form hợp lệ → thấy dòng mới trong bảng; nếu bật adapter thì nhận email; bỏ trống/email sai bị chặn; điền honeypot bị từ chối; truy cập bằng anon key không đọc được `contact_messages`.

---

## Phase 6 – Admin: đăng nhập và khung
**Prompt:**
```
Đọc CLAUDE.md và HEZB_PLAN.md trước. Thực hiện Phase 6:
1. Cấu hình auth theo @supabase/ssr (refresh session qua middleware/proxy đúng với phiên bản Next.js đã cài), bảo vệ mọi route /admin ngoại trừ /admin/login.
2. /admin/login: form email + mật khẩu (server action), thông báo lỗi rõ ràng.
3. lib/supabase/admin-guard.ts: hàm requireAdmin() gọi RPC is_admin(); nếu không phải admin thì đăng xuất và redirect về login kèm thông báo. Gọi requireAdmin() ở layout (protected) VÀ ở đầu mỗi server action ghi dữ liệu.
4. Layout admin có Sidebar (Dashboard, Dự án, Thành viên, Liên hệ, Xem website, Đăng xuất), responsive (mobile dùng thanh cuộn ngang hoặc drawer). Thêm <meta robots noindex> cho toàn bộ /admin.
5. Dashboard: 4 thẻ số liệu và 5 tin liên hệ gần nhất (đọc bằng session của admin, tuân thủ RLS).
```
**Nghiệm thu:** chưa đăng nhập vào `/admin` bị đẩy về login; tài khoản không thuộc `admins` bị từ chối; admin xem được dashboard đúng số liệu.

---

## Phase 7 – Admin: quản lý dự án
**Prompt:**
```
Đọc CLAUDE.md và HEZB_PLAN.md trước. Thực hiện Phase 7:
1. /admin/projects: bảng (shadcn Table) có tìm kiếm, lọc Đã đăng/Nháp, công tắc Nổi bật và Đã đăng sửa ngay trên dòng, nút lên/xuống đổi sort_order, nút Sửa/Xóa (xác nhận bằng dialog).
2. /admin/projects/[id] ("new" = tạo mới): ProjectForm với tab VI/EN cho title, summary, content (textarea Markdown có preview đơn giản), result; trường chung: slug (tự sinh từ tiêu đề EN, cho sửa, kiểm tra trùng), lĩnh vực, khách hàng, năm, công nghệ (tag input), website_url, trạng thái.
3. ImageUploader: upload ảnh bìa và gallery lên bucket project-media (đường dẫn projects/{id}/{uuid}.{ext}), kiểm tra loại file và 5MB phía client + server, có preview, xóa ảnh.
4. Server actions (lib/actions/projects.ts): create/update/delete/toggle/reorder; luôn requireAdmin(), validate zod, lưu project + 2 translations trong một luồng nhất quán (nếu một bước lỗi thì báo lỗi rõ ràng, không để dữ liệu dở dang), rồi revalidatePath cho các trang public liên quan ở cả hai locale.
5. Toast cho thành công/lỗi, trạng thái đang lưu, cảnh báo khi rời trang có thay đổi chưa lưu.
```
**Nghiệm thu:** tạo dự án mới có ảnh → bật Đã đăng → xuất hiện ngay trên trang public cả vi/en; tắt đăng → biến mất và URL trả 404; xóa dự án xóa luôn bản dịch; slug trùng bị báo lỗi.

---

## Phase 8 – Admin: thành viên và hộp thư
**Prompt:**
```
Đọc CLAUDE.md và HEZB_PLAN.md trước. Thực hiện Phase 8:
1. /admin/members: bảng thành viên, tìm kiếm/lọc trạng thái, bật/tắt Đã đăng, sắp xếp thứ tự, thêm/sửa/xóa có xác nhận.
2. MemberForm: tab VI/EN cho name, role, bio; trường chung slug, LinkedIn, avatar, trạng thái; validate bằng zod và upload vào bucket `member-media`.
3. /admin/messages: bảng tin liên hệ (người gửi, công ty, chủ đề, thời gian, trạng thái), lọc theo trạng thái, mở panel/dialog xem toàn bộ nội dung kèm nút "Trả lời qua email" (mailto), đổi trạng thái new/read/replied/archived, xóa có xác nhận. Tự đánh dấu "read" khi mở xem lần đầu.
4. Server actions tương ứng, luôn requireAdmin() và revalidate sau khi lưu member/project liên quan. Không tạo CMS cho nội dung tĩnh trong messages.
```
**Nghiệm thu:** thêm/sửa/publish member ở admin → `/members` và landing cập nhật; upload avatar đúng policy; nội dung messages không cần admin CMS; tin mới từ form hiện ở hộp thư và đổi trạng thái được.

---

## Phase 9 – Hoàn thiện, kiểm thử, deploy
**Prompt:**
```
Đọc CLAUDE.md và HEZB_PLAN.md trước. Thực hiện Phase 9:
1. Rà soát a11y (label, alt, focus, tương phản, điều hướng bàn phím), thêm not-found.tsx, error.tsx, loading.tsx còn thiếu.
2. Tối ưu: next/image với sizes hợp lý, font display swap, không có client JS thừa ở trang public; kiểm tra bundle.
3. Viết Playwright e2e tối thiểu: (a) xem các trang tĩnh và trang chủ vi/en, (b) lọc dự án và vào chi tiết, (c) xem danh sách thành viên dynamic, (d) gửi form liên hệ, (e) đăng nhập admin, tạo project/member, publish và thấy ở trang public.
4. Viết docs/DEPLOY.md: tạo project Supabase prod, chạy migration, biến môi trường trên Cloudflare Workers, cấu hình Auth redirect URL, Database Webhook + secrets cho Edge Function, subdomain Cloudflare miễn phí, và checklist go-live.
5. Chạy lint, typecheck, build, e2e và báo cáo kết quả.
```
**Nghiệm thu:** toàn bộ checklist Phần D đạt.

---

# PHẦN D – CHECKLIST TRƯỚC KHI GO-LIVE
**Chức năng**
- [ ] Trang chủ, Giới thiệu, Sự nghiệp, Thành viên, danh sách/chi tiết dự án và Liên hệ chạy đủ ở `/vi` và `/en`
- [ ] Sửa nội dung và dự án ở admin hiển thị đúng ở trang public ngay sau khi lưu
- [ ] Form liên hệ lưu DB, có chống spam; admin inbox hoạt động (email outbound chỉ kiểm tra nếu bật adapter)
- [ ] Dự án/thành viên nháp không lộ ở bất kỳ đâu (danh sách, chi tiết, landing, sitemap, API)

**Bảo mật**
- [ ] Dùng anon key thử đọc `contact_messages` và `admins` → bị từ chối
- [ ] Không có service role key trong code client hoặc repo
- [ ] Tắt đăng ký công khai; chỉ user trong `admins` vào được `/admin`
- [ ] Mọi server action ghi dữ liệu đều gọi `requireAdmin()` và validate zod
- [ ] Bucket chỉ cho admin upload; giới hạn loại file và dung lượng

**Chất lượng**
- [ ] Lighthouse mobile ≥ 90 ở trang chủ và danh sách dự án
- [ ] `pnpm lint`, `typecheck`, `build`, e2e đều pass
- [ ] Đã thay toàn bộ dữ liệu mẫu (dự án "sample-*", email/điện thoại/địa chỉ giả) bằng dữ liệu thật
- [ ] Đã thay ảnh OG, favicon, title/description chuẩn thương hiệu

**Vận hành**
- [ ] Supabase Cloud dev/prod (hoặc một project có kiểm soát nếu quota không cho phép tách), migration chạy bằng CLI
- [ ] Production chạy HTTPS trên subdomain `*.workers.dev`; domain riêng và redirect `www` chỉ là tùy chọn khi có ngân sách
- [ ] Đã đặt cảnh báo/ghi nhớ sao lưu database (Supabase backup)

---

# PHẦN E – MẸO LÀM VIỆC VỚI AI (VIBE CODING)
1. **Một phase một lần.** Không dán nhiều phase cùng lúc; xong phase thì commit rồi mới sang phase sau.
2. **Luôn bắt AI đọc `CLAUDE.md` trước** và chạy `lint/typecheck/build` sau mỗi thay đổi lớn.
3. **Khi lỗi:** dán nguyên văn thông báo lỗi + file liên quan, yêu cầu tìm nguyên nhân gốc trước khi sửa, không sửa mò.
4. **Khi giao diện chưa đẹp:** gửi ảnh chụp màn hình + ảnh mockup `hezb.html` và nói rõ khác biệt cần chỉnh (khoảng cách, màu, cỡ chữ).
5. **Khi AI tự ý đổi thư viện/kiến trúc:** nhắc lại quy tắc A5.12 và yêu cầu hoàn tác.
6. **Đổi schema:** yêu cầu AI tạo migration mới, chạy lại `supabase gen types`, rồi mới sửa code.
7. **Kiểm tra bảo mật bằng tay** ở Phase 5–8 (thử bằng anon key), đừng chỉ tin vào code AI viết.
8. **Prompt sửa nhỏ mẫu:** `"Chỉ sửa file X. Mục tiêu: ... Không đổi API/kiểu dữ liệu hiện có. Sau khi sửa chạy typecheck và nói rõ đã chạy gì."`

---

# PHỤ LỤC – ƯỚC LƯỢNG
| Phase | Nội dung | Ước lượng (1 người + AI) |
|---|---|---|
| 0 | Chuẩn bị tài khoản, DB | 0,5 ngày |
| 1 | Khởi tạo, i18n, layout | 0,5–1 ngày |
| 2 | Data layer | 0,5 ngày |
| 3 | Landing | 1 ngày |
| 4 | Trang dự án + SEO | 1 ngày |
| 5 | Form liên hệ + email | 1 ngày |
| 6 | Admin: auth + khung | 1 ngày |
| 7 | Admin: dự án + upload | 2 ngày |
| 8 | Admin: nội dung + hộp thư | 1,5 ngày |
| 9 | Hoàn thiện + deploy | 1–2 ngày |
| **Tổng** | | **khoảng 10–12 ngày làm việc** |
