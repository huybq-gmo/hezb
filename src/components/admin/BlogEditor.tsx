'use client';

import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveBlogPost } from '@/lib/actions/blog';
import { blogAttachmentSchema, type BlogInput } from '@/lib/validators/blog';
import { BlogMediaUploader } from './BlogMediaUploader';
import { ImageUploader } from './ImageUploader';
import { MarkdownEditor } from './MarkdownEditor';

export function BlogEditor({ id, initial }: { id?: string; initial?: BlogInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [activeLocale, setActiveLocale] = useState<'vi' | 'en'>('vi');
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? '');
  const [attachments, setAttachments] = useState(initial?.attachments ?? []);
  const [contentVi, setContentVi] = useState(initial?.contentVi ?? '');
  const [contentEn, setContentEn] = useState(initial?.contentEn ?? '');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let rawAttachments: unknown;
    try { rawAttachments = JSON.parse(String(data.get('attachments') ?? '[]')) as unknown; } catch { setError('Please check the attached media and try again.'); return; }
    const parsedAttachments = blogAttachmentSchema.array().safeParse(rawAttachments);
    if (!parsedAttachments.success) { setError('Please check the attached media and try again.'); return; }
    setError('');
    startTransition(async () => {
      const result = await saveBlogPost({
        slug: String(data.get('slug') ?? ''),
        authorName: String(data.get('authorName') ?? ''),
        tags: String(data.get('tags') ?? '').split(',').map((value) => value.trim()).filter(Boolean),
        coverUrl,
        titleVi: String(data.get('titleVi') ?? ''),
        titleEn: String(data.get('titleEn') ?? ''),
        excerptVi: String(data.get('excerptVi') ?? ''),
        excerptEn: String(data.get('excerptEn') ?? ''),
        contentVi,
        contentEn,
        seoTitleVi: String(data.get('seoTitleVi') ?? ''),
        seoTitleEn: String(data.get('seoTitleEn') ?? ''),
        seoDescriptionVi: String(data.get('seoDescriptionVi') ?? ''),
        seoDescriptionEn: String(data.get('seoDescriptionEn') ?? ''),
        attachments: parsedAttachments.data,
        isPublished: data.get('published') === 'on',
        isFeatured: data.get('featured') === 'on',
      }, id);
      if (result.ok) router.push('/admin/blog');
      else setError(result.message);
    });
  }

  return <form className="admin-form admin-editor" onSubmit={submit}>
    <div className="admin-form-layout">
      <div className="admin-form-main">
        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Story setup</legend>
          <p className="admin-form-section-intro">Create a strong headline, a useful promise and a clear path through the story.</p>
          <div className="form-grid"><div className="form-field"><label htmlFor="blog-slug">Slug</label><input id="blog-slug" name="slug" defaultValue={initial?.slug} placeholder="useful-ai-for-real-world-problems" required /></div><div className="form-field"><label htmlFor="blog-author">Author</label><input id="blog-author" name="authorName" defaultValue={initial?.authorName ?? 'Hezb Community'} required /></div></div>
          <div className="form-field"><label htmlFor="blog-tags">Tags</label><input id="blog-tags" name="tags" defaultValue={initial?.tags.join(', ')} placeholder="AI, Product, Operations" /><small className="field-hint">Separate tags with commas. They help readers scan related ideas.</small></div>
          <div className="form-field"><label>Cover image</label><ImageUploader bucket="blog-media" label="Upload cover image" value={coverUrl} onUploaded={setCoverUrl} /><input type="hidden" name="coverUrl" value={coverUrl} /></div>
        </fieldset>

        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Bilingual content</legend>
          <p className="admin-form-section-intro">Write both versions now so the article is complete in every locale.</p>
          <div className="editor-locale-tabs" role="tablist" aria-label="Article language"><button className={activeLocale === 'vi' ? 'active' : ''} type="button" role="tab" aria-selected={activeLocale === 'vi'} onClick={() => setActiveLocale('vi')}>Tiếng Việt</button><button className={activeLocale === 'en' ? 'active' : ''} type="button" role="tab" aria-selected={activeLocale === 'en'} onClick={() => setActiveLocale('en')}>English</button></div>
          <div className="form-grid"><div className="form-field"><label htmlFor="blog-title-vi">Title (VI)</label><input id="blog-title-vi" name="titleVi" defaultValue={initial?.titleVi} required /></div><div className="form-field"><label htmlFor="blog-title-en">Title (EN)</label><input id="blog-title-en" name="titleEn" defaultValue={initial?.titleEn} required /></div></div>
          <div className="form-grid"><div className="form-field"><label htmlFor="blog-excerpt-vi">Excerpt (VI)</label><textarea id="blog-excerpt-vi" name="excerptVi" defaultValue={initial?.excerptVi} rows={4} required /></div><div className="form-field"><label htmlFor="blog-excerpt-en">Excerpt (EN)</label><textarea id="blog-excerpt-en" name="excerptEn" defaultValue={initial?.excerptEn} rows={4} required /></div></div>
          <div hidden><input name="contentVi" value={contentVi} readOnly /><input name="contentEn" value={contentEn} readOnly /></div>
          {activeLocale === 'vi' ? <MarkdownEditor id="blog-content-vi" label="Article body (VI)" value={contentVi} onChange={setContentVi} /> : <MarkdownEditor id="blog-content-en" label="Article body (EN)" value={contentEn} onChange={setContentEn} />}
        </fieldset>

        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Search preview</legend>
          <p className="admin-form-section-intro">Optional SEO copy keeps the article preview specific and useful.</p>
          <div className="form-grid"><div className="form-field"><label htmlFor="blog-seo-title-vi">SEO title (VI)</label><input id="blog-seo-title-vi" name="seoTitleVi" defaultValue={initial?.seoTitleVi} maxLength={180} /></div><div className="form-field"><label htmlFor="blog-seo-title-en">SEO title (EN)</label><input id="blog-seo-title-en" name="seoTitleEn" defaultValue={initial?.seoTitleEn} maxLength={180} /></div></div>
          <div className="form-grid"><div className="form-field"><label htmlFor="blog-seo-description-vi">SEO description (VI)</label><textarea id="blog-seo-description-vi" name="seoDescriptionVi" defaultValue={initial?.seoDescriptionVi} rows={3} maxLength={320} /></div><div className="form-field"><label htmlFor="blog-seo-description-en">SEO description (EN)</label><textarea id="blog-seo-description-en" name="seoDescriptionEn" defaultValue={initial?.seoDescriptionEn} rows={3} maxLength={320} /></div></div>
        </fieldset>

        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Attachments</legend>
          <p className="admin-form-section-intro">Add several images or downloadable files to make the article richer.</p>
          <BlogMediaUploader value={attachments} onChange={setAttachments} />
          <input type="hidden" name="attachments" value={JSON.stringify(attachments)} readOnly />
        </fieldset>
      </div>
      <aside className="admin-form-side">
        <div className="form-panel admin-form-publish">
          <p className="eyebrow">Publishing</p><h2>{id ? 'Update article' : 'Create article'}</h2><p>Keep a draft private while the narrative and media are still taking shape.</p>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <div className="admin-checks"><label className="admin-check"><input type="checkbox" name="published" defaultChecked={initial?.isPublished} /> Published article</label><label className="admin-check"><input type="checkbox" name="featured" defaultChecked={initial?.isFeatured} /> Featured on blog</label></div>
          <button className="button button-primary admin-submit" type="submit" disabled={pending}><Save size={16} />{pending ? 'Saving...' : 'Save article'}</button>
        </div>
      </aside>
    </div>
  </form>;
}
