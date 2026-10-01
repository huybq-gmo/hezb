# Hezb Project Context

## Snapshot

- **Project:** Hezb company website
- **Purpose:** Public bilingual website for Hezb (AI and software), with published projects, members, contact inbox, and a protected admin area.
- **Locales:** `vi` (default) and `en`; public URLs always include the locale (`/vi/...`, `/en/...`).
- **Architecture:** Next.js App Router + TypeScript strict, Supabase Cloud (Postgres/Auth/Storage/Edge Functions), Cloudflare Workers through OpenNext.
- **Source of truth:** `HEZB_PLAN.md`, `PHASES.md`, `TECHNICAL_DECISIONS.md`, and the migration files under `supabase/migrations/`.

## Phase State

| Phase | Status | Notes |
|---|---|---|
| 0 - Preparation | Repository complete; external gate pending | Schema, RLS, seed, env contract and assets are versioned. Cloud provisioning still requires an operator. |
| 1 - Foundation | Complete locally | Next.js App Router, TypeScript strict, locale routes, theme, shell, Supabase clients and branding are working on Node 18. |
| 2 - Typed data layer | Complete locally | Typed query layer, field-level `vi` fallback and local fixtures are covered by tests. |
| 3 - Landing | Complete locally | Bilingual landing, About, Careers and Members pages use static messages plus query layer. |
| 4 - Projects/SEO | Complete locally | Filter/list/detail, safe Markdown, draft boundary, metadata, sitemap and robots are implemented. |
| 5 - Contact | Complete locally | Zod + RHF form, honeypot, optional Turnstile, anon insert contract and notify-contact Edge Function are implemented. |
| 6 - Admin auth/shell | Complete locally | Protected layout, Supabase auth path, local demo auth, responsive sidebar and noindex metadata are implemented. |
| 7 - Admin projects | Complete locally | Typed editor, translations, publish/feature/reorder/delete actions and 5 MB media validation are implemented. Cloud persistence needs Supabase verification. |
| 8 - Admin members/messages | Complete locally | Member editor/action, inbox table, status workflow and media validation are implemented. Cloud persistence needs Supabase verification. |
| 9 - Hardening/deploy | Local checks complete; deploy pending | Error/loading/404, E2E, docs, SEO and accessibility foundations pass. Lighthouse, cloud security smoke and Worker deploy remain pending. |

## Verified In Repository

- `AGENTS.md` contains the coding-agent rules from the master plan.
- `.env.example` documents the public/server environment contract without real secrets.
- `supabase/migrations/0001_initial_schema.sql` defines the application schema, RLS policies, helper function, triggers, and public media buckets.
- `supabase/seed.sql` contains development-only categories, published fixtures, and the required unpublished `sample-vision-qc` fixture.
- `supabase/config.toml` identifies the local CLI project configuration.
- `tests/phase-00.test.mjs` checks the Phase 0 repository contract with Node's built-in test runner.
- `node --test tests/phase-00.test.mjs` passed: 5 tests, 0 failures (2026-10-01).
- `package.json` and `pnpm-lock.yaml` define the Next.js/Supabase/i18n/form/OpenNext stack. Next 15.5.26 is pinned because the available host is Node 18.19.1.
- Branding assets from `docs/assets/` are copied into `public/brand/` and used by the app.
- Initial local baseline covered 13 contract tests before the Phase 9 hardening additions.
- `node --test tests/*.test.mjs` passed: 19 tests, 0 failures after hardening/admin workflow, team slider coverage, and the theme hydration regression test (2026-10-01).
- `./node_modules/.bin/eslint .` passed and `./node_modules/.bin/tsc --noEmit` passed.
- `./node_modules/.bin/next build` passed; all public/admin routes compiled and sitemap/robots were generated.
- `./node_modules/.bin/playwright test` passed: 5 browser tests (landing/projects, draft/admin guard, contact validation, category/detail, demo admin members/messages).
- Team section uses a responsive scroll-snap slider with keyboard-visible previous/next controls and transparent member placeholder media at `public/brand/hezb-member-placeholder.svg`; no member-specific assets were available in `docs/assets/`.
- `ThemeToggle` now starts with a stable `system` state and reads `localStorage` only after mount, preventing server/client markup drift. A Chrome smoke check with `hezb-theme=dark` reported no hydration errors.
- Admin server reads now use authenticated Supabase queries with local fixture fallback; member/project CRUD routes include edit, publish/feature toggles, reorder and delete controls.
- Public translation merging falls back field-by-field to Vietnamese, and project/member media validators reject arbitrary external URLs.

## External Actions Still Required

These cannot be verified from this repository and must be completed before the Phase 0 gate:

1. Create or select Supabase development and production projects (or document the single-project quota decision).
2. Apply migrations and seed with the Supabase CLI against the development project.
3. Create an Auth admin user, insert its UUID into `public.admins`, and disable public sign-up.
4. Create Cloudflare Turnstile and Workers resources; store secrets in the local secret manager or `.env.local` only.
5. Confirm Supabase Auth redirect URLs, production URL, and whether the optional Resend adapter is enabled.
6. Review the approved logo asset already copied from `docs/assets/` into `public/brand/`.

Do not mark these actions complete without evidence from the relevant dashboard/CLI command. Never commit `.env.local` or real secrets.

## Phase 0 Acceptance Evidence

- [x] Repository schema, RLS, storage policies, and development seed are versioned.
- [x] Environment variables are classified as public or server-only.
- [x] A smoke test validates the required Phase 0 files and security invariants.
- [x] Phase 1-9 local implementation and focused tests are present.
- [x] Public E2E smoke tests pass against the local dev server.
- [ ] Supabase Cloud migration/seed reset succeeds.
- [ ] Admin login and `public.admins` membership are verified.
- [ ] Turnstile/Cloudflare resources and redirect URLs are documented with real values outside Git.
- [ ] Supabase anon/admin security smoke test runs against a real project.
- [ ] Lighthouse mobile and production Worker deployment are verified.

## Next Gate

Provision Supabase/Cloudflare, run the migration/seed command in `docs/PHASE-0-SETUP.md`, set production env vars, and rerun the same lint/typecheck/build/E2E suite against the deployed Worker. Replace all `sample-*` and placeholder contact values before go-live.

## Change Log

- **2026-10-01:** Initialized project context and Phase 0 repository contract. No cloud credentials were available in the workspace, so external provisioning remains explicitly pending.
- **2026-10-01:** Phase 0 repository smoke test passed 5/5. Supabase CLI and `psql` are not installed, so remote migration/seed execution remains pending.
- **2026-10-01:** Implemented Phases 1-9 locally using assets from `docs/assets/`; 13 contract tests, lint, typecheck, production build and 3 Playwright tests pass. Cloud verification/deploy remains explicitly pending.
- **2026-10-01:** Hardened locale fallback, runtime mutation validation, authenticated admin reads, member/project CRUD UI, message detail/delete workflow and metadata/alt text. 18 contract tests, lint, typecheck, production build and 5 Playwright tests pass. Supabase/Cloudflare/Lighthouse evidence remains pending.
- **2026-10-01:** Moved remaining public section/page labels into both locale message files, fixed CSS compatibility warnings, and reran the full local gate: 17 contract tests, lint, typecheck, production build and 5 Playwright tests pass.
- **2026-10-01:** Admin guard now signs out authenticated non-admin users before redirecting; final typecheck, lint, build and diff checks pass. Local server is available at `http://127.0.0.1:3000`.
- **2026-10-01:** Replaced the landing team grid with a responsive scroll-snap slider and transparent member media treatment; contract tests 19/19, E2E 5/5, typecheck, lint and production build pass. Visual screenshots were checked at desktop and mobile sizes.
- **2026-10-01:** Fixed theme hydration drift by deferring the persisted theme read to `useEffect`; contract tests 19/19, typecheck, lint, production build, E2E 5/5, and a Chrome dark-theme hydration smoke check pass.
