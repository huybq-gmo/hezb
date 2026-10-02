import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('social preview image is a raster asset', async () => {
  const image = await stat(new URL('../public/brand/hezb-social-card.jpg', import.meta.url));
  assert.ok(image.size > 1000);
  const bytes = await readFile(new URL('../public/brand/hezb-social-card.jpg', import.meta.url));
  assert.equal(bytes.subarray(0, 2).toString('hex'), 'ffd8');
});

test('root and localized metadata expose Facebook, Zalo, and X preview cards', async () => {
  const rootLayout = await read('src/app/layout.tsx');
  const seo = await read('src/lib/seo.ts');
  const projectPage = await read('src/app/[locale]/projects/[slug]/page.tsx');
  assert.match(rootLayout, /socialPreviewImage/);
  assert.match(rootLayout, /summary_large_image/);
  assert.match(seo, /hezb-social-card\.jpg/);
  assert.match(seo, /summary_large_image/);
  assert.match(seo, /images:/);
  assert.match(projectPage, /summary_large_image/);
  assert.match(projectPage, /images:/);
  assert.match(projectPage, /project\.coverUrl/);
});
