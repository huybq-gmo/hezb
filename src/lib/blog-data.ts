import type { Database } from '@/types/db';

type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];
type BlogTranslationRow = Database['public']['Tables']['blog_post_translations']['Row'];
type BlogAttachmentRow = Database['public']['Tables']['blog_post_attachments']['Row'];

export const localBlogPosts: BlogPostRow[] = [
  {
    id: 'blog-ai-that-works',
    slug: 'ai-that-works-in-the-real-world',
    author_name: 'Hezb Community',
    cover_url: '/illustrations/project-ai.jpg',
    tags: ['AI', 'Product', 'Practical technology'],
    is_published: true,
    is_featured: true,
    sort_order: 10,
    published_at: '2026-03-08T08:00:00Z',
    created_at: '2026-03-08T08:00:00Z',
    updated_at: '2026-03-08T08:00:00Z',
  },
  {
    id: 'blog-automation-without-chaos',
    slug: 'automation-without-the-chaos',
    author_name: 'Hezb Community',
    cover_url: '/illustrations/project-automation.jpg',
    tags: ['Automation', 'Operations'],
    is_published: true,
    is_featured: false,
    sort_order: 20,
    published_at: '2026-02-20T08:00:00Z',
    created_at: '2026-02-20T08:00:00Z',
    updated_at: '2026-02-20T08:00:00Z',
  },
  {
    id: 'blog-draft',
    slug: 'draft-community-notes',
    author_name: 'Hezb Community',
    cover_url: null,
    tags: ['Draft'],
    is_published: false,
    is_featured: false,
    sort_order: 99,
    published_at: null,
    created_at: '2026-01-20T08:00:00Z',
    updated_at: '2026-01-20T08:00:00Z',
  },
];

export const localBlogTranslations: BlogTranslationRow[] = [
  {
    post_id: 'blog-ai-that-works',
    locale: 'vi',
    title: 'AI hữu ích bắt đầu từ một vấn đề rất cụ thể',
    excerpt: 'Một hệ thống AI tốt không bắt đầu bằng mô hình. Nó bắt đầu bằng việc hiểu người dùng đang mắc kẹt ở đâu.',
    content: '# AI hữu ích bắt đầu từ đâu?\n\nAI tạo ra giá trị khi nó giúp một người ra quyết định nhanh hơn, làm việc nhẹ hơn hoặc nhìn thấy điều trước đây bị bỏ sót.\n\n## Bắt đầu từ dòng công việc\n\nTrước khi chọn model hay framework, hãy quan sát một ngày làm việc thật. Những bước lặp lại, điểm bàn giao và khoảnh khắc phải mở quá nhiều tab thường là nơi đáng bắt đầu nhất.\n\n> Công nghệ tốt không làm người dùng thấy mình đang vận hành một hệ thống phức tạp hơn.\n\n## Đo bằng kết quả\n\nMột prototype đáng giá khi nó trả lời được ba câu hỏi: ai dùng, dùng lúc nào và sau đó điều gì tốt hơn. Khi câu trả lời rõ ràng, đội ngũ có thể tiếp tục cải thiện với dữ liệu thật thay vì chạy theo bản demo đẹp.',
    seo_title: 'AI hữu ích cho bài toán thực tế | Hezb',
    seo_description: 'Cách bắt đầu một sản phẩm AI từ dòng công việc thật, nhu cầu thật và kết quả có thể đo được.',
  },
  {
    post_id: 'blog-ai-that-works',
    locale: 'en',
    title: 'Useful AI starts with a very specific problem',
    excerpt: 'A dependable AI system does not start with a model. It starts by understanding where people are stuck.',
    content: '# Where does useful AI begin?\n\nAI creates value when it helps someone decide faster, remove repetitive work or see what was previously hidden.\n\n## Start with the workflow\n\nBefore choosing a model or framework, observe a real working day. Repeated steps, handoffs and moments that require too many tabs are often the best places to begin.\n\n> Good technology should not make people feel like they are operating a more complicated system.\n\n## Measure the outcome\n\nA useful prototype answers three questions: who uses it, when do they use it and what is better afterward? Once those answers are clear, a team can keep improving with real data instead of chasing a polished demo.',
    seo_title: 'Useful AI for real-world problems | Hezb',
    seo_description: 'How to start an AI product with a real workflow, a real need and an outcome you can measure.',
  },
  {
    post_id: 'blog-automation-without-chaos',
    locale: 'vi',
    title: 'Tự động hóa mà không tạo thêm hỗn loạn',
    excerpt: 'Tự động hóa tốt không phải là nối thật nhiều công cụ. Đó là làm cho một quy trình trở nên dễ nhìn, dễ tin cậy và dễ cải thiện.',
    content: '# Tự động hóa mà không tạo thêm hỗn loạn\n\nKhi một quy trình có quá nhiều bước thủ công, phản xạ đầu tiên thường là thêm một công cụ. Nhưng nếu chưa hiểu luồng công việc, tự động hóa chỉ chuyển sự mơ hồ từ người này sang hệ thống khác.\n\n## Vẽ lại trước khi xây\n\nHãy bắt đầu bằng những trạng thái rõ ràng: việc gì đến, ai chịu trách nhiệm, điều kiện nào cho phép đi tiếp và khi nào cần con người can thiệp.\n\n## Giữ lại khả năng quan sát\n\nMột automation đáng tin cậy luôn có log, cảnh báo và đường lui. Người trong đội ngũ cần biết hệ thống đang làm gì, thay vì chỉ hy vọng mọi thứ vẫn chạy.',
    seo_title: 'Tự động hóa vận hành rõ ràng hơn | Hezb',
    seo_description: 'Một cách tiếp cận thực tế để thiết kế automation dễ quan sát, dễ tin cậy và dễ mở rộng.',
  },
  {
    post_id: 'blog-automation-without-chaos',
    locale: 'en',
    title: 'Automation without the chaos',
    excerpt: 'Good automation is not about connecting more tools. It makes a workflow visible, dependable and easier to improve.',
    content: '# Automation without the chaos\n\nWhen a workflow has too many manual steps, the first instinct is often to add another tool. Without understanding the flow, automation only moves the ambiguity from a person into a system.\n\n## Map before you build\n\nStart with clear states: what arrives, who owns it, what allows it to move forward and when a person needs to step in.\n\n## Keep it observable\n\nDependable automation has logs, alerts and a path back to a human. The team should know what the system is doing instead of hoping it keeps running.',
    seo_title: 'Clearer operations automation | Hezb',
    seo_description: 'A practical approach to designing automation that stays observable, dependable and easy to extend.',
  },
  {
    post_id: 'blog-draft',
    locale: 'vi',
    title: 'Ghi chú đang viết',
    excerpt: 'Bài viết này đang được hoàn thiện.',
    content: '',
    seo_title: null,
    seo_description: null,
  },
  {
    post_id: 'blog-draft',
    locale: 'en',
    title: 'Notes in progress',
    excerpt: 'This article is still being shaped.',
    content: '',
    seo_title: null,
    seo_description: null,
  },
];

export const localBlogAttachments: BlogAttachmentRow[] = [
  { id: 'blog-ai-image', post_id: 'blog-ai-that-works', kind: 'image', name: 'AI workspace', url: '/illustrations/project-ai.jpg', content_type: 'image/jpeg', size_bytes: 1, sort_order: 10, created_at: '2026-03-08T08:00:00Z' },
  { id: 'blog-automation-image', post_id: 'blog-automation-without-chaos', kind: 'image', name: 'Automation workflow', url: '/illustrations/project-automation.jpg', content_type: 'image/jpeg', size_bytes: 1, sort_order: 10, created_at: '2026-02-20T08:00:00Z' },
];
