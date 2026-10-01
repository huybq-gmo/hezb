# Phase 8 - Admin thành viên và hộp thư

## Mục tiêu

Hoàn thiện hai khu vực admin cần dữ liệu động: quản lý thành viên và xử lý `contact_messages`. Nội dung doanh nghiệp/menu nằm trong `messages/{locale}.json`, nên phase này không tạo CMS cho landing.

## Member management

- [ ] Tạo `/admin/members` với bảng tìm kiếm/lọc `published`/`draft`, badge status, toggle `is_published`, reorder bằng nút lên/xuống và empty state.
- [ ] Tạo `/admin/members/[id]` (`new` = tạo mới) với tab VI/EN cho `name`, `role`, `bio`; trường chung `slug`, `linkedin_url`, avatar và trạng thái.
- [ ] Tạo `MemberForm` và `member` zod schema; normalize slug, giới hạn độ dài bio, URL LinkedIn và MIME/kích thước avatar.
- [ ] Upload avatar vào bucket `member-media/members/{id}/{uuid}.{ext}`, giới hạn 5MB, preview/xóa ảnh và không cho client tự ghi URL tùy ý.
- [ ] Tạo server actions `create`, `update`, `delete`, `toggle`, `reorder`; luôn `requireAdmin()`, validate và ghi member + translations nhất quán.
- [ ] Sau mutation gọi `revalidatePath` cho `/vi/members`, `/en/members` và landing ở cả hai locale.

## Message inbox

- [ ] Tạo `/admin/messages` với table sender/company/topic/time/status, filter `new/read/replied/archived`, badge tin mới.
- [ ] Mở detail trong panel/dialog, escape toàn bộ text; tự chuyển `new -> read` khi mở lần đầu.
- [ ] Nút `mailto` để trả lời, đổi status và delete có confirm; mutation có pending/error state.
- [ ] Không hiển thị message cho anon; status transition phải validate ở server action và dùng enum DB.

## Nghiệm thu

- Thêm/sửa member với VI/EN + avatar, publish và thấy ngay trên `/members` và landing.
- Tắt publish làm member biến mất khỏi public; member draft không xuất hiện trong query public.
- Slug trùng, file sai MIME, file >5MB và content sai schema đều bị chặn.
- Nội dung tĩnh trong messages không xuất hiện trong admin CMS.
- Tin mới từ contact xuất hiện trong inbox, mở tin đổi read, đổi trạng thái và xóa đúng quyền.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` pass; có test cho member schema, visibility và message authorization.

## Gate sang Phase 9

Toàn bộ user-facing flow dynamic đã có đường đi end-to-end: admin sửa project/member -> public query -> UI; visitor gửi contact -> inbox admin.
