import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('blog editor uploads and inserts optimized inline images at the cursor', async () => {
  const editor = await read('src/components/admin/MarkdownEditor.tsx');
  const blogEditor = await read('src/components/admin/BlogEditor.tsx');
  const optimizer = await read('src/lib/image-optimization.ts');
  assert.match(editor, /ImagePlus/);
  assert.match(editor, /onUploadImage/);
  assert.match(editor, /!\[\$\{alt\}\]\(\$\{url\}\)/);
  assert.match(blogEditor, /uploadInlineImage/);
  assert.match(blogEditor, /optimizeImage/);
  assert.match(optimizer, /image\/webp/);
  assert.match(optimizer, /maxImageDimension/);
  assert.match(optimizer, /qualitySteps/);
});

test('blog image rendering keeps oversized content inside the article column', async () => {
  const css = await read('src/app/globals.css');
  assert.match(css, /\.prose img, \.markdown-preview img \{[^}]*max-width: 100%/);
  assert.match(css, /max-height: 720px/);
  assert.match(css, /overflow-x: hidden/);
});

test('blog cleanup includes image URLs embedded in Markdown content', async () => {
  const storage = await read('src/lib/storage.ts');
  const actions = await read('src/lib/actions/blog.ts');
  assert.match(storage, /storagePathsFromText/);
  assert.match(actions, /previousInlineMedia/);
  assert.match(actions, /nextInlineMedia/);
});
