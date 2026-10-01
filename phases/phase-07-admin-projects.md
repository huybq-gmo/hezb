# Phase 7 - Admin quản lý projects và media

## Mục tiêu

Triển khai workflow CRUD dự án từ bảng admin đến trang public: draft, publish, featured, sort order, hai ngôn ngữ và upload ảnh.

## Công việc

- [ ] Tạo `/admin/projects` với table responsive, search, filter publish/draft, badge status và empty state.
- [ ] Cho phép toggle `is_featured`/`is_published` ngay trên row, reorder bằng nút lên/xuống, có pending/rollback rõ ràng.
- [ ] Tạo `/admin/projects/[id]`; dùng `new` cho create, tab VI/EN cho title/summary/content/result, fields chung cho slug/category/client/year/tech/website/status.
- [ ] Tự sinh slug từ title EN, cho sửa thủ công, normalize và kiểm tra unique trước khi save.
- [ ] `ImageUploader` kiểm tra MIME + kích thước 5MB ở client và server, upload vào `project-media/projects/{id}/{uuid}.{ext}`, preview và xóa ảnh.
- [ ] Dùng `next/image` ở public; không cho URL tùy ý làm nguồn ảnh nếu chưa validate.
- [ ] Tạo zod project schema dùng chung cho create/update, giới hạn year, URL, tech tags, translation length và gallery.
- [ ] Tạo server actions `create`, `update`, `delete`, `toggle`, `reorder`; action nào cũng `requireAdmin()` và validate.
- [ ] Đảm bảo cập nhật project + translations nhất quán. Ưu tiên RPC/database function transaction; không để action tuần tự tạo project dở dang nếu bước translation lỗi.
- [ ] Sau mutation gọi `revalidatePath` cho `/vi` và `/en` ở home/projects/detail/sitemap liên quan.
- [ ] Dialog xác nhận delete, cảnh báo unsaved changes, toast success/error và disable submit khi đang lưu.

## Nghiệm thu

- Tạo project có VI/EN + cover, publish và thấy ngay trên public ở cả hai locale.
- Tắt publish làm card biến mất và detail trả 404; draft không có trong sitemap.
- Slug trùng, file sai MIME, file >5MB, content sai schema đều bị báo lỗi trước khi ghi.
- Xóa project xóa translations và xử lý media theo policy đã chọn, không để row orphan.
- Reorder và featured toggle được phản ánh đúng ở landing/projects.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` pass; có test cho slug, visibility và action authorization.

