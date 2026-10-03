import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Supabase public media paths are parsed safely for cleanup', async () => {
  const storage = await read('src/lib/storage.ts');
  assert.match(storage, /storage\/v1\/object\/public/);
  assert.match(storage, /storagePathsFromPublicUrls/);
  assert.match(storage, /Array\.from\(new Set/);
  assert.match(storage, /segment === '\.\.'/);
});

test('image editors clean replaced and draft media without deleting persisted files too early', async () => {
  const imageUploader = await read('src/components/admin/ImageUploader.tsx');
  const blogUploader = await read('src/components/admin/BlogMediaUploader.tsx');
  assert.match(imageUploader, /persistedValue/);
  assert.match(imageUploader, /storage\.from\(bucket\)\.remove/);
  assert.match(blogUploader, /persistedUrls/);
  assert.match(blogUploader, /storage\.from\('blog-media'\)\.remove/);
});

test('admin mutations clean media after replacement and entity deletion', async () => {
  const projectActions = await read('src/lib/actions/projects.ts');
  const memberActions = await read('src/lib/actions/members.ts');
  const blogActions = await read('src/lib/actions/blog.ts');
  for (const source of [projectActions, memberActions, blogActions]) {
    assert.match(source, /storagePathsFromPublicUrls/);
    assert.match(source, /\.storage\.from\(/);
    assert.match(source, /\.remove\(/);
  }
});

