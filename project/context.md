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
| 9 - Hardening/deploy | Worker deployed; favicon verified in production | Error/loading/404, E2E, docs, SEO and accessibility foundations pass. Worker deployment is live at `https://contact.hezb.workers.dev`; favicon and production route smoke checks pass. Lighthouse, cloud security smoke and Supabase production verification remain pending. |
| 10 - Careers and community refresh | Complete locally; migration pending | Public job board with CV application flow, admin role/application workspace, private CV storage policy, three-member no-carousel landing behavior, community positioning, and local project/hero illustrations are implemented. Apply migration `0002_careers.sql` and verify cloud storage/Auth before production. |

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
- `node --test tests/*.test.mjs` passed: 24 tests, 0 failures after hardening/admin workflow, team slider coverage, theme hydration regression, card-index typography, Turnstile integration, request-level admin gating, and OpenNext deployment artifact coverage (2026-10-02).
- `./node_modules/.bin/eslint .` passed and `./node_modules/.bin/tsc --noEmit` passed.
- `./node_modules/.bin/next build` passed; all public/admin routes compiled and sitemap/robots were generated.
- `./node_modules/.bin/playwright test` passed: 6 browser tests with fixture Supabase/Turnstile env isolation (landing/projects, draft/admin guard, contact validation, category/detail, careers/application dialog, demo admin members/messages/careers).
- Team section uses a responsive scroll-snap slider with keyboard-visible previous/next controls and transparent member placeholder media at `public/brand/hezb-member-placeholder.svg`; no member-specific assets were available in `docs/assets/`.
- `ThemeToggle` now starts with a stable `system` state and reads `localStorage` only after mount, preventing server/client markup drift. A Chrome smoke check with `hezb-theme=dark` reported no hydration errors.
- Mission/value card indexes use a more legible `14px` size with explicit line-height and tracking; a 686px Playwright viewport measured all `01–04` indexes at `14px` and the grid screenshot was inspected.
- Contact now renders the Cloudflare Turnstile widget when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set, forwards the token to the server action, and resets the widget after a successful submit.
- OpenNext deployment artifacts are versioned in `open-next.config.ts` and `wrangler.jsonc`; package scripts expose `open-next:build`, `open-next:preview`, and `deploy`.
- Admin paths are request-gated by `src/middleware.ts`; anonymous and invalid-session requests are redirected to `/admin/login`, while the server-side Supabase `is_admin()` check remains authoritative for access.
- `docs/DEPLOY.md` documents the complete Supabase/OpenNext deployment flow, production environment contract, admin provisioning, no-Resend configuration, smoke checks, rollback, and troubleshooting for `https://contact.hezb.workers.dev`.
- `.env.example` contains placeholders only; the local Supabase URL variable typo was corrected in `.env.local` without recording any secret in project context.
- Admin server reads now use authenticated Supabase queries with local fixture fallback; member/project CRUD routes include edit, publish/feature toggles, reorder and delete controls.
- Public translation merging falls back field-by-field to Vietnamese, and project/member media validators reject arbitrary external URLs.
- Career schema `supabase/migrations/0002_careers.sql` adds bilingual jobs, candidate applications, private `candidate-cvs` storage, and admin-only application reads. Public applications validate CV type/size, honeypot and optional Turnstile before insert.
- The landing page uses a community-focused hero image and local project illustrations. Featured members are capped at three; exactly three members render as a static grid without carousel controls, while larger sets retain the accessible slider.
- Careers UI includes published role cards, detail disclosure, application dialog, bilingual fields, and admin CRUD/status/CV signed-link workflow. `tests/phase-10-careers.test.mjs` covers schema, wiring, and local assets.
- Google Search Console verification is configured through root Next metadata and confirmed in the rendered `/vi` HTML. The verification token is not duplicated in individual pages.
- Root metadata uses `public/brand/hezb-logo-mono.svg` for browser, shortcut and Apple touch icons. Production `/vi` renders all three icon links, and the asset returns `200 image/svg+xml` from the deployed Worker.

## External Actions Still Required

These cannot be verified from this repository and must be completed before the Phase 0 gate:

1. Create or select Supabase development and production projects (or document the single-project quota decision).
2. Apply migrations and seed with the Supabase CLI against the development project.
3. Create an Auth admin user, insert its UUID into `public.admins`, and disable public sign-up.
4. Create Cloudflare Turnstile and Workers resources; store secrets in the local secret manager or `.env.local` only.
5. Confirm Supabase Auth redirect URLs, production URL, and whether the optional Resend adapter is enabled.
6. Review the approved logo asset already copied from `docs/assets/` into `public/brand/`.
7. Confirm the deployed Worker URL and production domain configuration; Wrangler authentication and Node.js 22+ are verified locally.

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
- [ ] Lighthouse mobile and production Worker behavior are verified.
- [x] OpenNext production build/deploy runs under Node.js 22+ with a real Cloudflare account; deployed URL is `https://contact.hezb.workers.dev`.

## Next Gate

Run both Supabase migrations (`0001_initial_schema.sql` and `0002_careers.sql`), create the Auth admin user and add its UUID to `public.admins`, verify candidate-CV private storage and signed links, run Lighthouse and deployed E2E checks against `https://contact.hezb.workers.dev`, then replace all `sample-*` and placeholder contact values before go-live.

## Change Log

- **2026-10-01:** Initialized project context and Phase 0 repository contract. No cloud credentials were available in the workspace, so external provisioning remains explicitly pending.
- **2026-10-01:** Phase 0 repository smoke test passed 5/5. Supabase CLI and `psql` are not installed, so remote migration/seed execution remains pending.
- **2026-10-01:** Implemented Phases 1-9 locally using assets from `docs/assets/`; 13 contract tests, lint, typecheck, production build and 3 Playwright tests pass. Cloud verification/deploy remains explicitly pending.
- **2026-10-01:** Hardened locale fallback, runtime mutation validation, authenticated admin reads, member/project CRUD UI, message detail/delete workflow and metadata/alt text. 18 contract tests, lint, typecheck, production build and 5 Playwright tests pass. Supabase/Cloudflare/Lighthouse evidence remains pending.
- **2026-10-01:** Moved remaining public section/page labels into both locale message files, fixed CSS compatibility warnings, and reran the full local gate: 17 contract tests, lint, typecheck, production build and 5 Playwright tests pass.
- **2026-10-01:** Admin guard now signs out authenticated non-admin users before redirecting; final typecheck, lint, build and diff checks pass. Local server is available at `http://127.0.0.1:3000`.
- **2026-10-01:** Replaced the landing team grid with a responsive scroll-snap slider and transparent member media treatment; contract tests 19/19, E2E 5/5, typecheck, lint and production build pass. Visual screenshots were checked at desktop and mobile sizes.
- **2026-10-01:** Fixed theme hydration drift by deferring the persisted theme read to `useEffect`; contract tests 19/19, typecheck, lint, production build, E2E 5/5, and a Chrome dark-theme hydration smoke check pass.
- **2026-10-01:** Increased mission/value card index typography from 12px to 14px with a focused contract test; contract tests 20/20, typecheck, lint, production build and responsive visual inspection pass.
- **2026-10-01:** Integrated explicit Cloudflare Turnstile rendering/token forwarding, sanitized `.env.example`, corrected the local Supabase URL key typo, added OpenNext/Wrangler deploy artifacts and deterministic fixture E2E env; contract tests 22/22, typecheck, lint, production build and E2E 5/5 pass. Production deploy remains pending Node.js 22+ and provider authentication.
- **2026-10-02:** Fixed the production URL to include the HTTPS scheme and deployed OpenNext to Cloudflare Worker `hezb-website.hezbsoft.workers.dev`. Production checks for `/vi`, `/en`, `/admin/login`, `sitemap.xml` and `robots.txt` returned 200. Resend remains disabled; Turnstile is disabled until a matching public site key is configured.
- **2026-10-02:** Renamed the production Worker to `contact`, deployed `https://contact.hezb.workers.dev` (version `de377c0e-10f2-4edf-8b6b-6f81207fb476`), and added request-level admin gating. Anonymous `/admin/*` requests now return `307` to `/admin/login`; public pages, sitemap and robots checks pass. Production Auth admin creation remains an external Supabase step.
- **2026-10-02:** Tightened the request gate to validate Supabase `auth.getUser()` plus `is_admin()` in middleware. No-cookie and fake-cookie production checks return `307` to `/admin/login`; deployment version `c109c156-4d47-431d-808e-61e92564bb2e` is live.
- **2026-10-02:** Restricted demo auth to development-only and redeployed the fail-closed guard as version `61f41f50-7f83-4210-8973-b14237862545`. Production no-cookie, fake-cookie and demo-cookie checks all return `307` to `/admin/login`.
- **2026-10-02:** Rewrote `docs/DEPLOY.md` as a step-by-step production runbook covering Supabase migrations/Auth admin setup, ignored environment files, OpenNext deployment, smoke checks, rollback, and disabled Resend behavior.
- **2026-10-02:** Added community positioning, a local collaboration hero image, local project illustrations, and static three-member landing behavior without carousel controls.
- **2026-10-02:** Added careers/jobs and candidate CV workflow in migration `0002_careers.sql`, including private storage policies, public application validation, admin role CRUD, application status management, signed CV links, and focused contract tests. Local gates pass: 27 contract tests, 6 E2E tests, lint, typecheck, and production build.
- **2026-10-02:** Added the provided Google Search Console verification token to root metadata. Verification is present in rendered HTML; 28 contract tests, lint, typecheck, and production build pass.
- **2026-10-02:** Added the Hezb mono mark as the browser favicon and redeployed Worker `contact` as version `912e44ac-3337-4bab-9fec-132d52c57cd4`. Production `/vi` exposes shortcut, icon and Apple touch icon links; the SVG asset and `/en`, `/admin/login`, `/sitemap.xml`, `/robots.txt` return 200, while anonymous `/admin` redirects to `/admin/login`. Contract tests 29/29, lint, typecheck and production build pass.
