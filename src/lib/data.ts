import type { Database, Locale } from '@/types/db';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectTranslation = Database['public']['Tables']['project_translations']['Row'];
type MemberRow = Database['public']['Tables']['members']['Row'];
type MemberTranslation = Database['public']['Tables']['member_translations']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type JobRow = Database['public']['Tables']['jobs']['Row'];
type JobTranslation = Database['public']['Tables']['job_translations']['Row'];

export const localCategories: CategoryRow[] = [
  { id: 'cat-ai', slug: 'ai', name_vi: 'Trí tuệ nhân tạo', name_en: 'Artificial intelligence', sort_order: 10, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-software', slug: 'custom-software', name_vi: 'Phần mềm theo yêu cầu', name_en: 'Custom software', sort_order: 20, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-automation', slug: 'automation', name_vi: 'Tự động hóa', name_en: 'Automation', sort_order: 30, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

export const localProjects: ProjectRow[] = [
  { id: 'project-insights', slug: 'sample-ai-insights', category_id: 'cat-ai', client_name: 'Sample client', year: 2026, tech: ['Python', 'Postgres', 'RAG'], cover_url: '/illustrations/project-ai.jpg', gallery: [], website_url: null, is_published: true, is_featured: true, sort_order: 10, created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
  { id: 'project-ops', slug: 'sample-ops-automation', category_id: 'cat-automation', client_name: 'Sample operations team', year: 2026, tech: ['Next.js', 'Supabase', 'Workflow'], cover_url: '/illustrations/project-automation.jpg', gallery: [], website_url: null, is_published: true, is_featured: true, sort_order: 20, created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
  { id: 'project-platform', slug: 'sample-custom-platform', category_id: 'cat-software', client_name: 'Sample enterprise', year: 2025, tech: ['TypeScript', 'React', 'Postgres'], cover_url: '/illustrations/project-platform.jpg', gallery: [], website_url: null, is_published: true, is_featured: false, sort_order: 30, created_at: '2025-11-01T00:00:00Z', updated_at: '2025-11-01T00:00:00Z' },
  { id: 'project-draft', slug: 'sample-vision-qc', category_id: 'cat-ai', client_name: 'Unpublished sample', year: 2026, tech: ['Python'], cover_url: null, gallery: [], website_url: null, is_published: false, is_featured: false, sort_order: 999, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

export const localProjectTranslations: ProjectTranslation[] = [
  { project_id: 'project-insights', locale: 'vi', title: 'Bảng điều khiển AI', summary: 'Phân tích dữ liệu vận hành cho quyết định nhanh hơn.', content: 'Nền tảng gom dữ liệu và đưa insight vào đúng nơi đội ngũ cần.', result: 'Rút ngắn thời gian tổng hợp báo cáo.' },
  { project_id: 'project-insights', locale: 'en', title: 'AI insights workspace', summary: 'Operational analytics for faster decisions.', content: 'A workspace that brings data and insight closer to the people making decisions.', result: 'Shorter reporting cycles.' },
  { project_id: 'project-ops', locale: 'vi', title: 'Tự động hóa vận hành', summary: 'Kết nối các bước lặp lại thành một quy trình rõ ràng.', content: 'Một luồng xử lý trực quan giúp đội ngũ giảm thao tác thủ công.', result: 'Tiết kiệm 120 giờ mỗi tháng.' },
  { project_id: 'project-ops', locale: 'en', title: 'Operations automation', summary: 'Connect repetitive steps into one clear workflow.', content: 'A visible workflow that removes manual handoffs from daily operations.', result: '120 hours saved every month.' },
  { project_id: 'project-platform', locale: 'vi', title: 'Nền tảng quản lý nội bộ', summary: 'Một nền tảng được thiết kế theo quy trình riêng.', content: 'Các vai trò và dữ liệu tập trung trong một trải nghiệm nhất quán.', result: 'Một nguồn dữ liệu duy nhất.' },
  { project_id: 'project-platform', locale: 'en', title: 'Custom operations platform', summary: 'An internal platform shaped around a real workflow.', content: 'Roles and data come together in one dependable team experience.', result: 'One single source of truth.' },
  { project_id: 'project-draft', locale: 'vi', title: 'Kiểm tra hình ảnh mẫu', summary: 'Dự án nháp để kiểm chứng RLS.', content: '', result: '' },
  { project_id: 'project-draft', locale: 'en', title: 'Sample vision QC', summary: 'Draft project used to verify RLS.', content: '', result: '' },
];

export const localMembers: MemberRow[] = [
  { id: 'member-anh', slug: 'minh-anh', avatar_url: '/brand/hezb-member-placeholder.svg', linkedin_url: null, is_published: true, sort_order: 10, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'member-nam', slug: 'hoang-nam', avatar_url: '/brand/hezb-member-placeholder.svg', linkedin_url: null, is_published: true, sort_order: 20, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'member-vy', slug: 'thao-vy', avatar_url: '/brand/hezb-member-placeholder.svg', linkedin_url: null, is_published: true, sort_order: 30, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'member-draft', slug: 'draft-member', avatar_url: null, linkedin_url: null, is_published: false, sort_order: 99, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

export const localMemberTranslations: MemberTranslation[] = [
  { member_id: 'member-anh', locale: 'vi', name: 'Nguyễn Minh Anh', role: 'AI Product Lead', bio: 'Biến những bài toán phức tạp thành sản phẩm AI dễ dùng.' },
  { member_id: 'member-anh', locale: 'en', name: 'Minh Anh Nguyen', role: 'AI Product Lead', bio: 'Turns complex challenges into useful AI products.' },
  { member_id: 'member-nam', locale: 'vi', name: 'Trần Hoàng Nam', role: 'Software Engineer', bio: 'Xây dựng nền tảng phần mềm ổn định và có thể mở rộng.' },
  { member_id: 'member-nam', locale: 'en', name: 'Hoang Nam Tran', role: 'Software Engineer', bio: 'Builds stable, scalable software foundations.' },
  { member_id: 'member-vy', locale: 'vi', name: 'Lê Thảo Vy', role: 'Design & Experience', bio: 'Tạo ra trải nghiệm rõ ràng, gần gũi và hiệu quả.' },
  { member_id: 'member-vy', locale: 'en', name: 'Thao Vy Le', role: 'Design & Experience', bio: 'Creates clear, human and effective experiences.' },
  { member_id: 'member-draft', locale: 'vi', name: 'Thành viên nháp', role: 'Draft member', bio: '' },
  { member_id: 'member-draft', locale: 'en', name: 'Draft member', role: 'Draft member', bio: '' },
];

export const localJobs: JobRow[] = [
  { id: 'job-ai-engineer', slug: 'ai-product-engineer', employment_type: 'full_time', location: 'Ho Chi Minh City / Remote', is_remote: true, is_published: true, sort_order: 10, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'job-product-designer', slug: 'product-designer', employment_type: 'contract', location: 'Ho Chi Minh City / Remote', is_remote: true, is_published: true, sort_order: 20, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

export const localJobTranslations: JobTranslation[] = [
  { job_id: 'job-ai-engineer', locale: 'vi', title: 'Kỹ sư sản phẩm AI', summary: 'Xây dựng các tính năng AI đáng tin cậy từ prototype đến vận hành.', description: 'Bạn sẽ làm việc cùng product và engineering để biến bài toán thực tế thành trải nghiệm AI dễ dùng.', requirements: '- TypeScript hoặc Python\n- Tư duy sản phẩm và thói quen viết code rõ ràng\n- Sẵn sàng học và chia sẻ cùng cộng đồng' },
  { job_id: 'job-ai-engineer', locale: 'en', title: 'AI Product Engineer', summary: 'Build dependable AI features from prototype to production.', description: 'You will work with product and engineering to turn real problems into useful AI experiences.', requirements: '- TypeScript or Python\n- Product thinking and clear engineering habits\n- Curious, collaborative and willing to share' },
  { job_id: 'job-product-designer', locale: 'vi', title: 'Product Designer', summary: 'Thiết kế sản phẩm rõ ràng, hữu ích và gần gũi với người dùng.', description: 'Bạn sẽ tham gia từ khám phá vấn đề đến thiết kế và cải thiện sản phẩm sau khi ra mắt.', requirements: '- Có portfolio sản phẩm số\n- Thành thạo Figma hoặc công cụ tương đương\n- Quan tâm đến accessibility và chi tiết trải nghiệm' },
  { job_id: 'job-product-designer', locale: 'en', title: 'Product Designer', summary: 'Shape clear, useful and human product experiences.', description: 'You will join discovery, design and post-launch improvement with the community.', requirements: '- A portfolio of digital products\n- Confident with Figma or an equivalent tool\n- Care about accessibility and interaction details' },
];

export const localSiteSettings = {
  raw: {
    email: 'hello@hezb.example',
    phone: '+84 000 000 000',
    addressVi: 'Thành phố Hồ Chí Minh, Việt Nam',
    addressEn: 'Ho Chi Minh City, Vietnam',
    responseTimeVi: 'Trong 1 ngày làm việc',
    responseTimeEn: 'Within 1 business day',
  },
  vi: {
    email: 'hello@hezb.example',
    phone: '+84 000 000 000',
    address: 'Thành phố Hồ Chí Minh, Việt Nam',
    responseTime: 'Trong 1 ngày làm việc',
  },
  en: {
    email: 'hello@hezb.example',
    phone: '+84 000 000 000',
    address: 'Ho Chi Minh City, Vietnam',
    responseTime: 'Within 1 business day',
  },
} as const;

export function byLocale<T extends { locale: Locale }>(rows: T[], locale: Locale, fallback: Locale = 'vi'): T | undefined {
  return rows.find((row) => row.locale === locale) ?? rows.find((row) => row.locale === fallback);
}
