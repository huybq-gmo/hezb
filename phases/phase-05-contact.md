# Phase 5 - Form liên hệ và thông báo tùy chọn

## Mục tiêu

Đưa form liên hệ trong mockup thành luồng thật: validate ở client/server, chống spam và insert an toàn bằng anon key. Admin inbox là đường đi bắt buộc; outbound email là adapter tùy chọn để MVP vẫn giữ chi phí bằng 0.

## Công việc

- [ ] Tạo `src/lib/validators/contact.ts` với schema: `name`, `email`, `company`, `phone`, `topic` (`ai | custom_software | automation | other`), `message` 5-5000 ký tự, `honeypot` và locale.
- [ ] Tạo `/[locale]/contact` với layout hai cột như mockup; contact info lấy từ `messages/{locale}.json`.
- [ ] Dùng `react-hook-form` cho UX, nhưng validate lại toàn bộ bằng zod trong server action.
- [ ] Implement `submitContact`: kiểm tra honeypot, validate Turnstile token ở server bằng secret, insert bằng public/anon client và tuyệt đối không `.select()` sau insert.
- [ ] Trả về result có kiểu gồm `ok`, field errors và form-level error; không trả dữ liệu nhạy cảm.
- [ ] UI có pending state, chặn double submit, success message + reset form, lỗi theo từng field và giữ dữ liệu người dùng khi lỗi.
- [ ] Lưu locale gửi form và timestamp; không cho client tự ghi `status` hoặc các cột hệ thống.
- [ ] Thêm rate-limit theo hướng dẫn plan (Turnstile là lớp tối thiểu ở bản đầu; nếu bổ sung bảng đếm phải có migration và policy).
- [ ] Tạo `supabase/functions/notify-contact` nhận Database Webhook INSERT, kiểm tra payload và chỉ gọi Resend khi `CONTACT_EMAIL_ENABLED=true`.
- [ ] Viết `docs/NOTIFY.md` cho hai mode: `off` (zero-cost, chỉ inbox) và `on` (Resend free-tier tùy chọn), secrets, retry và kiểm tra delivery.

## Nghiệm thu

- Form hợp lệ tạo đúng một row trong `contact_messages` và không thể đọc lại bằng anon key.
- Bỏ trống, email sai, message ngắn/dài hoặc topic ngoài enum bị chặn ở server.
- Honeypot có giá trị hoặc Turnstile invalid bị từ chối mà không insert.
- Gửi thành công hiển thị thông báo xanh theo locale và reset form; bấm nhiều lần không tạo duplicate.
- Khi bật email, webhook gửi email chứa người gửi, công ty, topic, message và link `/admin/messages`; khi tắt email, message vẫn xuất hiện trong inbox và không gọi API ngoài.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` pass; có test cho validator và server action result mapping.

## Gate sang Phase 6

Có thể tạo message bằng public UI nhưng chỉ authenticated admin mới đọc/đổi trạng thái message; RLS được kiểm tra bằng anon key và admin session.
