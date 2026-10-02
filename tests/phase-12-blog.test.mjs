import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('blog migration protects published content and public media', async () => {
  const migration = await read('supabase/migrations/0004_blog.sql');
  for (const table of ['create table public.blog_posts', 'create table public.blog_post_translations', 'create table public.blog_post_attachments']) assert.match(migration, new RegExp(table));
  assert.match(migration, /blog_posts_public_read/);
  assert.match(migration, /blog_post_attachments_public_read/);
  assert.match(migration, /blog-media/);
  assert.match(migration, /public\.is_admin\(\)/);
});

test('blog query and actions keep public visibility and admin guards', async () => {
  const query = await read('src/lib/queries/blog.ts');
  const actions = await read('src/lib/actions/blog.ts');
  assert.match(query, /is_published/);
  assert.match(query, /getPublishedBlogSlugs/);
  assert.match(query, /getAdminBlogPostInput/);
  assert.match(actions, /requireAdmin\(\)/g);
  assert.match(actions, /revalidatePath\('\/sitemap\.xml'\)/);
});

test('public blog routes and bilingual navigation are wired', async () => {
  const listPage = await read('src/app/[locale]/blog/page.tsx');
  const detailPage = await read('src/app/[locale]/blog/[slug]/page.tsx');
  const header = await read('src/components/site/Header.tsx');
  const messages = await read('messages/vi.json');
  assert.match(listPage, /getBlogPosts/);
  assert.match(detailPage, /ReactMarkdown/);
  assert.match(detailPage, /getPublishedBlogSlugs/);
  assert.match(header, /`\/\$\{locale\}\/blog`/);
  assert.match(messages, /"blog"/);
});

test('admin blog editor supports preview, bilingual body, and multiple attachments', async () => {
  const editor = await read('src/components/admin/BlogEditor.tsx');
  const markdown = await read('src/components/admin/MarkdownEditor.tsx');
  const media = await read('src/components/admin/BlogMediaUploader.tsx');
  assert.match(editor, /BlogMediaUploader/);
  assert.match(editor, /MarkdownEditor/);
  assert.match(editor, /attachments/);
  assert.match(markdown, /Preview/);
  assert.match(markdown, /ReactMarkdown/);
  assert.match(media, /multiple/);
  assert.match(media, /blog-media/);
});
