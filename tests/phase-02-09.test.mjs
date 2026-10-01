import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('typed query layer enforces public visibility and locale fallback', async () => {
  const projects = await read('src/lib/queries/projects.ts');
  const members = await read('src/lib/queries/members.ts');
  assert.match(projects, /is_published.*true/);
  assert.match(projects, /byLocale\(translations, locale\)/);
  assert.match(projects, /getPublishedSlugs/);
  assert.match(members, /is_published.*true/);
  assert.match(members, /byLocale\(translations, locale\)/);
  assert.match(projects, /fallback\?\.title/);
  assert.match(projects, /fallback\?\.summary/);
  assert.match(members, /fallback\?\.name/);
  assert.match(members, /fallback\?\.bio/);
});

test('public routes cover landing, static pages, projects, members, and contact', async () => {
  for (const path of ['src/app/[locale]/page.tsx', 'src/app/[locale]/about/page.tsx', 'src/app/[locale]/careers/page.tsx', 'src/app/[locale]/projects/page.tsx', 'src/app/[locale]/projects/[slug]/page.tsx', 'src/app/[locale]/members/page.tsx', 'src/app/[locale]/contact/page.tsx']) {
    const content = await read(path);
    assert.ok(content.length > 100, `${path} should contain a route implementation`);
  }
});

test('contact path validates, checks honeypot/Turnstile, and inserts without select', async () => {
  const action = await read('src/lib/actions/contact.ts');
  assert.match(action, /contactSchema\.safeParse/);
  assert.match(action, /honeypot/);
  assert.match(action, /verifyTurnstile/);
  assert.match(action, /\.insert\(/);
  assert.doesNotMatch(action, /insert\([\s\S]*\)\.select\(/);
});

test('admin mutations guard access and revalidate public pages', async () => {
  const projects = await read('src/lib/actions/projects.ts');
  const messages = await read('src/lib/actions/messages.ts');
  assert.match(projects, /requireAdmin\(\)/g);
  assert.match(projects, /revalidatePath/);
  assert.match(messages, /requireAdmin\(\)/);
  assert.match(messages, /revalidatePath/);
});

test('SEO and hardening routes exist', async () => {
  const sitemap = await read('src/app/sitemap.ts');
  const robots = await read('src/app/robots.ts');
  const project = await read('src/app/[locale]/projects/[slug]/page.tsx');
  assert.match(sitemap, /getPublishedSlugs/);
  assert.match(sitemap, /sitemap/);
  assert.match(robots, /disallow: \['\/admin', '\/api'\]/);
  assert.match(project, /notFound\(\)/);
  assert.match(project, /generateMetadata/);
});

test('admin is excluded from indexing and has a protected layout', async () => {
  const layout = await read('src/app/admin/(protected)/layout.tsx');
  const root = await read('src/app/admin/layout.tsx');
  assert.match(layout, /requireAdmin/);
  assert.match(layout, /redirect\('\/admin\/login'\)/);
  const guard = await read('src/lib/supabase/admin-guard.ts');
  assert.match(guard, /auth\.signOut/);
  assert.match(root, /robots/);
});

test('optional outbound email preserves the inbox contract', async () => {
  const functionSource = await read('supabase/functions/notify-contact/index.ts');
  const docs = await read('docs/NOTIFY.md');
  assert.match(functionSource, /CONTACT_EMAIL_ENABLED/);
  assert.match(functionSource, /RESEND_API_KEY/);
  assert.match(functionSource, /skipped: true/);
  assert.match(docs, /source of truth/);
});

test('member mutations use the same admin guard and public revalidation', async () => {
  const members = await read('src/lib/actions/members.ts');
  assert.match(members, /requireAdmin\(\)/);
  assert.match(members, /memberSchema\.safeParse/);
  assert.match(members, /revalidatePath/);
  assert.match(members, /toggleMember/);
  assert.match(members, /reorderMember/);
});

test('admin message mutations validate runtime status and identifiers', async () => {
  const action = await read('src/lib/actions/messages.ts');
  const validator = await read('src/lib/validators/message.ts');
  assert.match(action, /messageStatusSchema\.safeParse/);
  assert.match(action, /messageIdSchema\.safeParse/);
  assert.match(validator, /archived/);
  assert.match(validator, /max\(100\)/);
});

test('admin reads use authenticated server queries with fixture fallback', async () => {
  const projects = await read('src/lib/queries/projects.ts');
  const members = await read('src/lib/queries/members.ts');
  const messages = await read('src/lib/queries/messages.ts');
  const dashboard = await read('src/lib/queries/admin.ts');
  for (const source of [projects, members, messages, dashboard]) assert.match(source, /getServerClient/);
  assert.match(projects, /getAdminProjects/);
  assert.match(members, /getAdminMembers/);
  assert.match(messages, /contact_messages/);
});

test('public media validators reject arbitrary external URLs', async () => {
  const project = await read('src/lib/validators/project.ts');
  const member = await read('src/lib/validators/member.ts');
  assert.match(project, /supabase\.co/);
  assert.match(member, /supabase\.in/);
});

test('admin workspaces expose member editing and message detail actions', async () => {
  const memberRoute = await read('src/app/admin/(protected)/members/[id]/page.tsx');
  const memberTable = await read('src/components/admin/MemberTable.tsx');
  const messages = await read('src/components/admin/MessageTable.tsx');
  const messageAction = await read('src/lib/actions/messages.ts');
  assert.match(memberRoute, /getAdminMemberInput/);
  assert.match(memberTable, /deleteMember/);
  assert.match(memberTable, /toggleMember/);
  assert.match(messages, /showModal/);
  assert.match(messages, /mailto:/);
  assert.match(messageAction, /deleteMessage/);
});

test('team section uses a transparent-image slider', async () => {
  const slider = await read('src/components/site/MemberSlider.tsx');
  const card = await read('src/components/site/MemberCard.tsx');
  const css = await read('src/app/globals.css');
  const placeholder = await read('public/brand/hezb-member-placeholder.svg');
  assert.match(css, /scroll-snap-type/);
  assert.match(card, /avatarUrl/);
  assert.match(slider, /aria-roledescription="carousel"/);
  assert.match(css, /object-fit: contain/);
  assert.match(css, /member-slider-viewport/);
  assert.match(css, /background: transparent/);
  assert.doesNotMatch(placeholder, /<rect/);
});

test('theme preference loads after mount to keep server and client markup stable', async () => {
  const themeToggle = await read('src/components/site/ThemeToggle.tsx');
  assert.match(themeToggle, /useState<Theme>\('system'\)/);
  assert.match(themeToggle, /useEffect\(\(\) => \{\s+const saved = window\.localStorage\.getItem\('hezb-theme'\);/);
  assert.doesNotMatch(themeToggle, /useState<Theme>\(\(\) =>[\s\S]*localStorage\.getItem/);
});
