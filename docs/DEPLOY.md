# Hezb deployment checklist

## Build

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The current app runs without Supabase credentials using development fixtures. Production must set the public Supabase URL/key and the server-only Turnstile secret. Do not use the local demo admin mode in production.

## Supabase

1. Create or select the production project and link it with `supabase link --project-ref ...`.
2. Apply versioned migrations with `supabase db push`; review `seed.sql` and do not promote sample fixtures.
3. Create an Auth email/password admin user, insert its UUID into `public.admins`, and disable public sign-up.
4. Configure `project-media` and `member-media` policies from the migration and test anon read/admin write behavior.
5. Configure Auth redirect URLs for the Worker URL and local development URL.

## Cloudflare Workers / OpenNext

Set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` as public Worker vars. Set `TURNSTILE_SECRET_KEY`, `CONTACT_EMAIL_ENABLED`, and optional Resend secrets through the Worker secret manager. Build with the OpenNext Cloudflare adapter version pinned in `package.json`; do not expose `SUPABASE_SERVICE_ROLE_KEY` to the Next.js runtime.

## Go-live checks

- Verify `/vi` and `/en` home, project list/detail, members and contact.
- Verify unpublished rows never appear in UI, detail routes or sitemap.
- Verify anon cannot read `admins` or `contact_messages` and cannot upload storage objects.
- Run Playwright against the deployed URL, then check Lighthouse mobile for home and projects.
- Replace every `sample-*` fixture and placeholder contact value before launch.
- Keep a migration rollback plan and a manual Supabase backup before each schema change.

## Release checklist

- [ ] Replace every `sample-*` project/member, placeholder email, phone and address with approved production content.
- [ ] Confirm `NEXT_PUBLIC_SITE_URL`, Supabase URL/anon key, Auth redirect URLs and Turnstile site/secret keys for the same environment.
- [ ] Create the production Auth admin user, insert only its UUID into `public.admins`, and disable public sign-up.
- [ ] Run the anon/admin security smoke checks: draft visibility, `admins`/`contact_messages` reads, and storage upload policy.
- [ ] Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and Playwright against the release URL.
- [ ] Check mobile Lighthouse for `/vi` and `/vi/projects`; archive the report with the release.
- [ ] Confirm a Supabase backup exists and record the migration version and Worker deployment revision.

## Rollback

1. Keep the previous Worker deployment revision available in Cloudflare and roll traffic back there first if the site is unhealthy.
2. Do not edit an applied migration. For a schema correction, ship a new forward migration after taking a Supabase backup.
3. If a content release is wrong, unpublish the affected project/member from the admin UI; this preserves inbox and audit data while public queries hide it.
4. Re-run the smoke suite and record the incident, revision and migration state in `project/context.md` before restoring normal deploys.
