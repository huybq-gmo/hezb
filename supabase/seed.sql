-- Development-only fixtures. Replace all sample values before production.

insert into public.categories (slug, name_vi, name_en, sort_order)
values
  ('ai', 'Trí tuệ nhân tạo', 'Artificial intelligence', 10),
  ('custom-software', 'Phần mềm theo yêu cầu', 'Custom software', 20),
  ('automation', 'Tự động hóa', 'Automation', 30)
on conflict (slug) do update set
  name_vi = excluded.name_vi,
  name_en = excluded.name_en,
  sort_order = excluded.sort_order;

insert into public.projects (slug, category_id, client_name, year, tech, cover_url, is_published, is_featured, sort_order)
select * from (values
  ('sample-ai-insights', (select id from public.categories where slug = 'ai'), 'Sample client', 2026, array['Python', 'Postgres']::text[], '/illustrations/project-ai.jpg', true, true, 10),
  ('sample-ops-automation', (select id from public.categories where slug = 'automation'), 'Sample operations team', 2026, array['Next.js', 'Supabase']::text[], '/illustrations/project-automation.jpg', true, true, 20),
  ('sample-custom-platform', (select id from public.categories where slug = 'custom-software'), 'Sample enterprise', 2025, array['TypeScript', 'React']::text[], '/illustrations/project-platform.jpg', true, false, 30),
  ('sample-vision-qc', (select id from public.categories where slug = 'ai'), 'Unpublished sample', 2026, array['Python']::text[], null, false, false, 999)
) as fixture(slug, category_id, client_name, year, tech, cover_url, is_published, is_featured, sort_order)
on conflict (slug) do update set
  category_id = excluded.category_id,
  client_name = excluded.client_name,
  year = excluded.year,
  tech = excluded.tech,
  cover_url = excluded.cover_url,
  is_published = excluded.is_published,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order;

insert into public.project_translations (project_id, locale, title, summary, content, result)
select p.id, t.locale, t.title, t.summary, t.content, t.result
from public.projects p
join (values
  ('sample-ai-insights', 'vi', 'Bảng điều khiển AI mẫu', 'Phân tích dữ liệu vận hành cho quyết định nhanh hơn.', 'Nội dung demo cho môi trường phát triển.', 'Rút ngắn thời gian tổng hợp báo cáo.'),
  ('sample-ai-insights', 'en', 'Sample AI insights', 'Operational analytics for faster decisions.', 'Development-only demo content.', 'Shorter reporting cycles.'),
  ('sample-ops-automation', 'vi', 'Tự động hóa vận hành mẫu', 'Kết nối các bước lặp lại thành một quy trình rõ ràng.', 'Nội dung demo cho môi trường phát triển.', 'Giảm thao tác thủ công.'),
  ('sample-ops-automation', 'en', 'Sample operations automation', 'Connect repetitive steps into one clear workflow.', 'Development-only demo content.', 'Fewer manual steps.'),
  ('sample-custom-platform', 'vi', 'Nền tảng phần mềm mẫu', 'Một nền tảng nội bộ được thiết kế theo quy trình riêng.', 'Nội dung demo cho môi trường phát triển.', 'Một trải nghiệm nhất quán cho đội ngũ.'),
  ('sample-custom-platform', 'en', 'Sample custom platform', 'An internal platform shaped around a real workflow.', 'Development-only demo content.', 'A consistent team experience.'),
  ('sample-vision-qc', 'vi', 'Kiểm tra hình ảnh mẫu', 'Dự án nháp để kiểm chứng RLS.', '', ''),
  ('sample-vision-qc', 'en', 'Sample vision QC', 'Draft project used to verify RLS.', '', '')
) as t(slug, locale, title, summary, content, result) on t.slug = p.slug
on conflict (project_id, locale) do update set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  result = excluded.result;

insert into public.members (slug, is_published, sort_order)
values
  ('sample-founder', true, 10),
  ('sample-engineer', true, 20),
  ('sample-designer', false, 30)
on conflict (slug) do update set
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;

insert into public.member_translations (member_id, locale, name, role, bio)
select m.id, t.locale, t.name, t.role, t.bio
from public.members m
join (values
  ('sample-founder', 'vi', 'Người sáng lập mẫu', 'Founder', 'Hồ sơ mẫu cho môi trường phát triển.'),
  ('sample-founder', 'en', 'Sample founder', 'Founder', 'Development-only profile.'),
  ('sample-engineer', 'vi', 'Kỹ sư mẫu', 'Software Engineer', 'Hồ sơ mẫu cho môi trường phát triển.'),
  ('sample-engineer', 'en', 'Sample engineer', 'Software Engineer', 'Development-only profile.'),
  ('sample-designer', 'vi', 'Nhà thiết kế mẫu', 'Product Designer', 'Thành viên nháp để kiểm chứng RLS.'),
  ('sample-designer', 'en', 'Sample designer', 'Product Designer', 'Draft member used to verify RLS.')
) as t(slug, locale, name, role, bio) on t.slug = m.slug
on conflict (member_id, locale) do update set
  name = excluded.name,
  role = excluded.role,
  bio = excluded.bio;

insert into public.jobs (slug, employment_type, location, is_remote, is_published, sort_order)
values
  ('ai-product-engineer', 'full_time', 'Ho Chi Minh City / Remote', true, true, 10),
  ('product-designer', 'contract', 'Ho Chi Minh City / Remote', true, true, 20)
on conflict (slug) do update set
  employment_type = excluded.employment_type,
  location = excluded.location,
  is_remote = excluded.is_remote,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;

insert into public.job_translations (job_id, locale, title, summary, description, requirements)
select j.id, t.locale, t.title, t.summary, t.description, t.requirements
from public.jobs j
join (values
  ('ai-product-engineer', 'vi', 'Kỹ sư sản phẩm AI', 'Xây dựng các tính năng AI đáng tin cậy từ prototype đến vận hành.', 'Bạn sẽ làm việc cùng product và engineering để biến bài toán thực tế thành trải nghiệm AI dễ dùng.', '- TypeScript hoặc Python\n- Tư duy sản phẩm và thói quen viết code rõ ràng\n- Sẵn sàng học và chia sẻ cùng cộng đồng'),
  ('ai-product-engineer', 'en', 'AI Product Engineer', 'Build dependable AI features from prototype to production.', 'You will work with product and engineering to turn real problems into useful AI experiences.', '- TypeScript or Python\n- Product thinking and clear engineering habits\n- Curious, collaborative and willing to share'),
  ('product-designer', 'vi', 'Product Designer', 'Thiết kế sản phẩm rõ ràng, hữu ích và gần gũi với người dùng.', 'Bạn sẽ tham gia từ khám phá vấn đề đến thiết kế và cải thiện sản phẩm sau khi ra mắt.', '- Có portfolio sản phẩm số\n- Thành thạo Figma hoặc công cụ tương đương\n- Quan tâm đến accessibility và chi tiết trải nghiệm'),
  ('product-designer', 'en', 'Product Designer', 'Shape clear, useful and human product experiences.', 'You will join discovery, design and post-launch improvement with the community.', '- A portfolio of digital products\n- Confident with Figma or an equivalent tool\n- Care about accessibility and interaction details')
) as t(slug, locale, title, summary, description, requirements) on t.slug = j.slug
on conflict (job_id, locale) do update set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  requirements = excluded.requirements;
