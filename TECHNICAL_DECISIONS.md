# Hezb - Technical Decisions cho bản $0

## Phạm vi quyết định

Mục tiêu là vận hành MVP với chi phí hạ tầng bằng 0 ở mức traffic thấp, dùng các free tier công khai và phần mềm mã nguồn mở. Đây không phải cam kết free tier vĩnh viễn: quota, điều khoản thương mại và giới hạn nhà cung cấp có thể thay đổi. Không bao gồm chi phí domain riêng, email doanh nghiệp, công việc vận hành hoặc vượt quota.

## Quyết định đã chốt

| Hạng mục | Lựa chọn | Trạng thái |
|---|---|---|
| Framework | Next.js App Router + TypeScript strict | Đã chốt |
| UI | Tailwind CSS + shadcn/ui + lucide-react | Đã chốt |
| Data/Auth/Storage | Supabase Free (Postgres, Auth, Storage, Edge Functions) | Đã chốt |
| Dev database | Supabase Cloud qua project/môi trường dev | Không bắt buộc Docker/local database |
| Production database | Supabase Cloud qua project prod; có thể dùng chung project với dev ở MVP $0 | Tách project nếu free quota tài khoản cho phép |
| Hosting Next.js | Cloudflare Workers qua `@opennextjs/cloudflare` | Đã chốt |
| Deployment tooling | `wrangler` + `@opennextjs/cloudflare` (dev dependency bắt buộc cho deploy) | Đã chốt |
| Production URL | Subdomain miễn phí `*.workers.dev` | Đã chốt, domain riêng tùy chọn |
| Chống spam | Cloudflare Turnstile + honeypot + giới hạn tần suất trong DB | Free |
| Email | Admin inbox trong Supabase là bắt buộc; outbound email là tùy chọn | Tắt mặc định trong bản $0 |
| CI | GitHub Actions ở mức thấp hoặc chạy local | Không thêm dịch vụ CI trả phí |
| Analytics | Không dùng analytics bên thứ ba trong MVP | Tránh cookie/chi phí |
| Ảnh | Supabase Storage, giới hạn file 5MB và quota cấu hình | Không dùng CDN/transform trả phí |

## Ranh giới Cloudflare và Supabase

`@opennextjs/cloudflare` chỉ build/adapt Next.js để chạy trong Cloudflare Workers. Workers xử lý SSR, route và server-side compute; nó không tự cung cấp Postgres, Auth, Storage, RLS hay admin data dashboard.

Trong kiến trúc này:

```text
Browser
  -> Cloudflare Worker (Next.js SSR/OpenNext)
      -> Supabase Cloud (Postgres + Auth + Storage + RLS)
      -> Supabase Edge Function (webhook/email tùy chọn)
```

Có thể thay Supabase bằng D1 + R2 + KV/Durable Objects + hệ thống auth tự xây, nhưng đó là một dự án backend khác: phải tự làm migration/query layer, auth/session/password reset, policy bảo mật, upload policy, admin tooling và backup. Không chọn hướng đó cho Hezb vì tăng đáng kể scope và rủi ro, trong khi không làm sản phẩm rẻ hơn ở traffic MVP.

## Ranh giới static và dynamic của website

- Static trong `messages/{locale}.json`: menu, Hero, About, Careers, contact info cơ bản, CTA, footer và các chuỗi giao diện. Content contract nằm ở `STATIC_CONTENT.md`.
- Dynamic từ Supabase: projects, members và contact messages.
- Không triển khai `site_content` hoặc admin CMS cho landing trong MVP.
- Members có `members` + `member_translations`, chỉ hiển thị row `is_published = true`; admin có CRUD, publish toggle, reorder và avatar upload.

## Vì sao không dùng Vercel

Vercel Hobby phù hợp thử nghiệm cá nhân nhưng cần kiểm tra điều khoản nếu website được vận hành cho doanh nghiệp. Cloudflare Workers có free quota rõ ràng hơn cho deployment không trả phí và vẫn cho phép giữ Next.js thông qua OpenNext. Phase 1 phải có smoke test build/deploy tối thiểu để xác nhận các route đang dùng tương thích với adapter.

## Email trong bản $0

Không coi email là đường đi bắt buộc của contact flow. Contact message luôn được insert vào `contact_messages` và admin xem trong `/admin/messages`; đây là nguồn sự thật và không phụ thuộc nhà cung cấp email.

Có thể bật adapter Resend sau này bằng biến môi trường `CONTACT_EMAIL_ENABLED=true`. Adapter này chỉ được xem là tùy chọn free-tier, không đưa vào tiêu chí pass của core MVP vì quota, sender verification và điều khoản có thể thay đổi. Khi tắt adapter, Edge Function không gọi API bên ngoài và không làm mất message.

## Giới hạn kỹ thuật được chấp nhận

| Dịch vụ | Dùng cho | Giới hạn cần chấp nhận | Cách giảm rủi ro |
|---|---|---|---|
| Supabase Free | DB, Auth, Storage, Edge Functions | Có quota và có thể pause project ít hoạt động | Giới hạn media, backup thủ công, kiểm tra quota hàng tuần |
| Cloudflare Workers Free | SSR Next.js và route API | Giới hạn request/CPU theo free tier | Không chạy AI/ảnh nặng tại Worker; query gọn, traffic thấp |
| Turnstile | Chống spam | Phụ thuộc quota/chính sách Cloudflare | Honeypot + validation + rate limit DB vẫn là lớp bắt buộc |
| GitHub Actions | CI nhẹ | Phụ thuộc repo public/private và phút chạy | Chạy lint/typecheck/build local trước; CI chỉ smoke test |

Public pages sẽ server-render dynamic từ Supabase nhưng không yêu cầu persistent ISR cache/KV/R2 trong MVP. Có thể thêm edge cache sau khi đo traffic. Ảnh Supabase dùng `next/image`; nếu image optimizer không tương thích OpenNext, cho phép dùng `unoptimized` có kiểm soát thay vì thêm dịch vụ image trả phí.

## Quy tắc để không phát sinh phí

- Không mua domain trong giai đoạn MVP; dùng URL `*.workers.dev` Cloudflare cấp.
- Không tạo thêm Supabase cloud project nếu chưa kiểm tra quota tài khoản; mọi migration/seed chạy qua Supabase CLI nhưng target remote cloud.
- Không bật Realtime, image transformation, log retention hoặc job nền không cần thiết.
- Giới hạn upload project media và tổng số project trong admin; theo dõi quota thủ công.
- Không đưa service role key lên client hoặc vào GitHub Actions log.
- Không dùng API AI, bản đồ, email marketing, SMS, monitoring trả phí.
- Khi vượt quota free, ưu tiên giảm traffic/media hoặc nâng cấp có chủ đích; không tự động phát sinh billing.

## Environment contract

```dotenv
# Public
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# Server/Edge only
SUPABASE_SERVICE_ROLE_KEY=       # chỉ Edge Function nếu thật sự cần, không dùng trong app
TURNSTILE_SECRET_KEY=
CONTACT_EMAIL_ENABLED=false
RESEND_API_KEY=                  # chỉ cần khi bật CONTACT_EMAIL_ENABLED
NOTIFY_EMAIL=                    # chỉ cần khi bật CONTACT_EMAIL_ENABLED
NEXT_PUBLIC_SITE_URL=
```

## Điều kiện dừng triển khai

Nếu OpenNext không build được một route bắt buộc hoặc free quota thực tế không đáp ứng traffic mục tiêu, phải dừng ở Phase 1 và ghi ADR mới. Không tự chuyển sang Vercel trả phí, Supabase Pro hoặc dịch vụ email trả phí mà không có quyết định mới.
