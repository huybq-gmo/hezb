import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Phase 0 repository artifacts are present', async () => {
  for (const path of [
    'project/context.md',
    'AGENTS.md',
    '.env.example',
    'supabase/config.toml',
    'supabase/migrations/0001_initial_schema.sql',
    'supabase/seed.sql',
    'docs/PHASE-0-SETUP.md',
  ]) {
    const content = await read(path);
    assert.ok(content.length > 0, `${path} should not be empty`);
  }
});

test('schema contains the required tables, RLS, and storage policies', async () => {
  const migration = await read('supabase/migrations/0001_initial_schema.sql');
  for (const table of [
    'categories',
    'projects',
    'project_translations',
    'members',
    'member_translations',
    'contact_messages',
    'admins',
  ]) {
    assert.match(migration, new RegExp(`create table public\\.${table}\\b`));
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.match(migration, /create or replace function public\.is_admin\(\)/);
  assert.match(migration, /contact_messages_public_insert/);
  assert.match(migration, /contact_messages_admin_all/);
  assert.match(migration, /project_media_admin_insert/);
  assert.match(migration, /member_media_admin_insert/);
  assert.match(migration, /insert into storage\.buckets/);
  assert.match(migration, /grant insert on public\.contact_messages to anon, authenticated/);
  assert.match(migration, /grant select, insert, update, delete on public\.categories,[\s\S]*public\.admins to authenticated/);
});

test('development seed includes a published set and a protected draft fixture', async () => {
  const seed = await read('supabase/seed.sql');
  assert.match(seed, /sample-vision-qc/);
  assert.match(seed, /'sample-vision-qc'.*false/s);
  assert.match(seed, /sample-ai-insights/);
  assert.match(seed, /sample-ops-automation/);
  assert.match(seed, /sample-custom-platform/);
});

test('environment example keeps server secrets distinct from public variables', async () => {
  const env = await read('.env.example');
  assert.match(env, /NEXT_PUBLIC_SUPABASE_ANON_KEY=/);
  assert.match(env, /TURNSTILE_SECRET_KEY=/);
  assert.match(env, /SUPABASE_SERVICE_ROLE_KEY=/);
  assert.match(env, /CONTACT_EMAIL_ENABLED=false/);
  assert.doesNotMatch(env, /sk-[A-Za-z0-9]{10,}/);
});

test('context records the external Phase 0 gate', async () => {
  const context = await read('project/context.md');
  assert.match(context, /Phase State/);
  assert.match(context, /blocked-by-external-credentials|External Actions Still Required/);
  assert.match(context, /sample-vision-qc/);
});
