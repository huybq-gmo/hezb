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
| 0 - Preparation | Repository complete; external gate pending | Repository inputs and a reproducible schema/seed are present. Cloud account setup and credentials still require an operator. |
| 1 - Foundation | Not started | Blocked until Phase 0 external gate is completed. |
| 2 - Typed data layer | Not started | Depends on Phase 1 and generated database types. |
| 3-9 | Not started | Follow `PHASES.md` in order. |

## Verified In Repository

- `AGENTS.md` contains the coding-agent rules from the master plan.
- `.env.example` documents the public/server environment contract without real secrets.
- `supabase/migrations/0001_initial_schema.sql` defines the application schema, RLS policies, helper function, triggers, and public media buckets.
- `supabase/seed.sql` contains development-only categories, published fixtures, and the required unpublished `sample-vision-qc` fixture.
- `supabase/config.toml` identifies the local CLI project configuration.
- `tests/phase-00.test.mjs` checks the Phase 0 repository contract with Node's built-in test runner.
- `node --test tests/phase-00.test.mjs` passed: 5 tests, 0 failures (2026-10-01).

## External Actions Still Required

These cannot be verified from this repository and must be completed before the Phase 0 gate:

1. Create or select Supabase development and production projects (or document the single-project quota decision).
2. Apply migrations and seed with the Supabase CLI against the development project.
3. Create an Auth admin user, insert its UUID into `public.admins`, and disable public sign-up.
4. Create Cloudflare Turnstile and Workers resources; store secrets in the local secret manager or `.env.local` only.
5. Confirm Supabase Auth redirect URLs, production URL, and whether the optional Resend adapter is enabled.
6. Add the approved Hezb logo asset before Phase 1 UI work.

Do not mark these actions complete without evidence from the relevant dashboard/CLI command. Never commit `.env.local` or real secrets.

## Phase 0 Acceptance Evidence

- [x] Repository schema, RLS, storage policies, and development seed are versioned.
- [x] Environment variables are classified as public or server-only.
- [x] A smoke test validates the required Phase 0 files and security invariants.
- [ ] Supabase Cloud migration/seed reset succeeds.
- [ ] Admin login and `public.admins` membership are verified.
- [ ] Turnstile/Cloudflare resources and redirect URLs are documented with real values outside Git.

## Next Gate

Complete the external actions above, run `node --test tests/phase-00.test.mjs`, then run the Supabase migration/seed command documented in `docs/PHASE-0-SETUP.md`. Only after those checks pass should Phase 1 scaffold Next.js and generate `src/types/db.ts`.

## Change Log

- **2026-10-01:** Initialized project context and Phase 0 repository contract. No cloud credentials were available in the workspace, so external provisioning remains explicitly pending.
- **2026-10-01:** Phase 0 repository smoke test passed 5/5. Supabase CLI and `psql` are not installed, so remote migration/seed execution remains pending.
