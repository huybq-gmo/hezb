import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('career migration protects jobs, applications, and private CVs', async () => {
  const migration = await read('supabase/migrations/0002_careers.sql');
  for (const table of ['create table public.jobs', 'create table public.job_translations', 'create table public.job_applications']) assert.match(migration, new RegExp(table));
  assert.match(migration, /job_applications_public_insert/);
  assert.match(migration, /candidate-cvs/);
  assert.match(migration, /candidate_cv_admin_read/);
  assert.match(migration, /public\.is_admin\(\)/);
});

test('public career board and admin workflow are wired', async () => {
  const page = await read('src/app/[locale]/careers/page.tsx');
  const board = await read('src/components/site/JobBoard.tsx');
  const actions = await read('src/lib/actions/careers.ts');
  const admin = await read('src/app/admin/(protected)/careers/page.tsx');
  assert.match(page, /getPublishedJobs/);
  assert.match(page, /JobBoard/);
  assert.match(board, /applyToJob/);
  assert.match(board, /type="file"/);
  assert.match(actions, /candidateCvMaxBytes/);
  assert.match(actions, /requireAdmin\(\)/g);
  assert.match(admin, /ApplicationTable/);
});

test('community hero and project illustrations are local assets', async () => {
  const home = await read('src/app/[locale]/page.tsx');
  const projects = await read('src/lib/queries/projects.ts');
  assert.match(home, /hezb-hero-community\.jpg/);
  assert.match(projects, /project-ai\.jpg/);
  assert.match(projects, /project-automation\.jpg/);
  assert.match(projects, /project-platform\.jpg/);
});

test('Google Search Console verification is configured in root metadata', async () => {
  const layout = await read('src/app/layout.tsx');
  assert.match(layout, /verification:\s*\{\s*google:/);
  assert.match(layout, /v6w8uXRzuNiKzMpolQ0w7XVus1_KVxToH76n7CdiRbg/);
});
