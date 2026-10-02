# Hezb Deployment Guide

This guide deploys the Hezb Next.js application to Cloudflare Workers with OpenNext and connects it to Supabase.

Production values for this repository:

| Item | Value |
| --- | --- |
| Cloudflare Worker | `contact` |
| Public URL | `https://contact.hezb.workers.dev` |
| Admin login | `https://contact.hezb.workers.dev/admin/login` |
| Adapter | `@opennextjs/cloudflare` |
| Email notifications | Disabled (`CONTACT_EMAIL_ENABLED=false`) |

Do not commit `.env.local`, `.env.production.local`, API tokens, passwords, or a Supabase service-role key.

## 1. Prerequisites

Install or have access to:

- Node.js 22 or newer
- `pnpm`
- Supabase CLI, if applying migrations from the terminal
- A Supabase project with permission to manage database/Auth settings
- A Cloudflare account with Workers deployment permission

From the repository root, verify the local tools:

```bash
node --version
pnpm --version
pnpm exec wrangler --version
```

The repository pins the application and Wrangler versions in `package.json`. Do not upgrade them as part of a routine deploy.

## 2. Configure Supabase

### 2.1 Apply the schema

Create or select the Supabase project that will back this Worker. The project reference is the identifier before `.supabase.co` in the project URL.

Using the Supabase CLI:

```bash
supabase login
supabase link --project-ref <SUPABASE_PROJECT_REF>
supabase db push
```

The migrations create the application tables, public contact settings, Row Level Security policies, `project-media`, `member-media`, and private `candidate-cvs` buckets, plus the `is_admin()` function. Apply `0001_initial_schema.sql`, then `0002_careers.sql`, then `0003_site_settings.sql` to enable jobs, candidate applications, and database-managed contact details.

For local development only, reset and seed the local database with:

```bash
supabase db reset
```

`supabase/seed.sql` contains development fixtures, including `sample-*` content. It does not create an Auth user. Do not run a destructive database reset against production. For production, apply migrations with `supabase db push`, then add approved business content through the admin UI or an explicitly reviewed SQL release.

### 2.2 Create the production admin

1. Open Supabase Dashboard > **Authentication > Users**.
2. Select **Add user**, create an email/password user, and copy the user UUID.
3. In **SQL Editor**, grant that Auth user application admin access:

   ```sql
   insert into public.admins (id)
   values ('AUTH_USER_UUID')
   on conflict (id) do nothing;
   ```

4. Disable public sign-up under **Authentication > Providers > Email**.
5. Under **Authentication > URL Configuration**, set the site URL and allowed application URL to:

   ```text
   https://contact.hezb.workers.dev
   ```

The local fallback account `demo@hezb.local` / `demo` is available only when running in development without Supabase credentials. It is deliberately disabled in production.

### 2.3 Optional Turnstile

Turnstile is optional. Leave both values empty to deploy without it:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

To enable it, create a Turnstile site for `contact.hezb.workers.dev`, set both keys, and redeploy. The public site key is bundled into the browser; the secret key must remain server-only.

## 3. Configure production environment variables

Create the ignored production environment file in the repository root:

```bash
if [ ! -f .env.production.local ]; then cp .env.example .env.production.local; fi
```

Edit `.env.production.local` with the Supabase values from **Project Settings > API**:

```dotenv
# Public values. These are bundled by Next.js during the production build.
NEXT_PUBLIC_SUPABASE_URL=https://<SUPABASE_PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
NEXT_PUBLIC_SITE_URL=https://contact.hezb.workers.dev
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# Server-only values.
TURNSTILE_SECRET_KEY=

# Email/Resend is intentionally disabled for this deployment.
CONTACT_EMAIL_ENABLED=false
RESEND_API_KEY=
NOTIFY_EMAIL=

# Do not enable the local demo account in production.
HEZB_DEMO_ADMIN_EMAIL=
HEZB_DEMO_ADMIN_PASSWORD=

# Not used by the Next.js Worker. Keep empty and never expose it to the browser.
SUPABASE_SERVICE_ROLE_KEY=
```

`NEXT_PUBLIC_SITE_URL` must include the protocol. Use `https://contact.hezb.workers.dev`, not `contact.hezb.workers.dev`.

The production file is ignored by Git. Confirm before deploying:

```bash
git check-ignore -v .env.production.local
```

## 4. Run the release checks

Install exactly from the lockfile and run the checks before uploading anything:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run browser tests when Playwright is available:

```bash
pnpm test:e2e
```

The Next.js build reads `.env.production.local` and `.env.local`; the production file takes precedence for production values. A successful `pnpm build` must generate the OpenNext middleware and Worker artifacts without an `Invalid URL` error.

## 5. Authenticate Cloudflare and deploy

Authenticate Wrangler once for the target Cloudflare account:

```bash
pnpm exec wrangler login
pnpm exec wrangler whoami
```

`wrangler.jsonc` sets the Worker name to `contact`, so the Workers development URL is `https://contact.hezb.workers.dev`.

Deploy with the package script:

```bash
pnpm run deploy
```

Use `pnpm run deploy`, not `pnpm deploy`. The script builds the Next.js application with OpenNext and then uploads `.open-next/worker.js` and `.open-next/assets` to Cloudflare.

Record the **Current Version ID** printed by Wrangler after a successful deployment. It is required for rollback and incident tracking.

## 6. Verify the deployed Worker

Run the following smoke checks against the production URL:

```bash
curl -sS -o /dev/null -D - https://contact.hezb.workers.dev/vi
curl -sS -o /dev/null -D - https://contact.hezb.workers.dev/en
curl -sS -o /dev/null -D - https://contact.hezb.workers.dev/admin/login
curl -sS -o /dev/null -D - https://contact.hezb.workers.dev/sitemap.xml
curl -sS -o /dev/null -D - https://contact.hezb.workers.dev/robots.txt
```

Expected status codes:

- `/vi`, `/en`, `/admin/login`, `/sitemap.xml`, `/robots.txt`: `200`
- `/admin`, `/admin/projects`, `/admin/members`, `/admin/messages`: `307` with `location: /admin/login` when anonymous

Check protected routes explicitly:

```bash
for path in /admin /admin/projects /admin/members /admin/messages; do
  curl -sS -o /dev/null -D - "https://contact.hezb.workers.dev${path}"
done
```

Then sign in at `/admin/login` with the Supabase Auth user that was inserted into `public.admins`. Verify that the dashboard, projects, members, and messages screens load. A normal Supabase user that is not in `public.admins` must be redirected back to the login page.

Confirm the SEO URL and public navigation:

```bash
curl -sS https://contact.hezb.workers.dev/sitemap.xml | rg 'https://contact\.hezb\.workers\.dev'
curl -sS https://contact.hezb.workers.dev/vi | rg '#Hezb|#BuildWhatsNext|#AI|/admin/login'
```

The second command should produce no matches.

## 7. Normal operations

### Content

Use the authenticated admin area to manage projects, members, and contact messages. Keep unpublished rows private. Replace all `sample-*` fixtures and placeholder contact values before announcing the site publicly.

### Schema changes

Never edit an applied migration. Add a new file under `supabase/migrations/`, apply it to the linked project, regenerate database types if the schema changed, run the release checks, and deploy the Worker again:

```bash
supabase db push
pnpm typecheck
pnpm test
pnpm run deploy
```

### Email behavior

With `CONTACT_EMAIL_ENABLED=false`, contact submissions are still stored in the Supabase `contact_messages` inbox. No Resend API key or notification email is needed. Only enable the email adapter after configuring and testing the `notify-contact` Edge Function and its Resend credentials.

### Rollback

List recent Worker versions:

```bash
pnpm exec wrangler deployments list
```

Roll back to a known-good version after confirming the target version ID:

```bash
pnpm exec wrangler rollback <VERSION_ID> --name contact --yes
```

Rollback Worker code first. Database migrations and Supabase data are not rolled back automatically; use a new forward migration or restore a reviewed backup.

## 8. Troubleshooting

### `TypeError: Invalid URL`

`NEXT_PUBLIC_SITE_URL` is missing the protocol or is not loaded during the build. Set:

```text
NEXT_PUBLIC_SITE_URL=https://contact.hezb.workers.dev
```

Then run `pnpm run deploy` again.

### Admin redirects even after a successful login

Check all of the following:

1. The Supabase URL and anon key in `.env.production.local` point to the intended project.
2. The Auth user exists and can sign in.
3. The user UUID exists in `public.admins`.
4. The migration containing `public.is_admin()` was applied.
5. The Worker was redeployed after changing environment values.

### The site shows sample projects

The seed is development content. Replace or unpublish sample rows from the admin UI before launch; public queries only expose rows where `is_published = true`.

### Contact form does not send email

This deployment intentionally disables outbound email. Read the message in the admin inbox. To enable notifications, configure the Edge Function and set `CONTACT_EMAIL_ENABLED=true`, `RESEND_API_KEY`, and `NOTIFY_EMAIL` outside the repository, then test before release.

## 9. Release checklist

- [ ] Supabase migrations are applied to the intended project.
- [ ] Career migration `0002_careers.sql` is applied and private CV signed links work for an admin.
- [ ] Production Auth user exists and its UUID is in `public.admins`.
- [ ] Public sign-up is disabled.
- [ ] `NEXT_PUBLIC_SITE_URL=https://contact.hezb.workers.dev` is set before build.
- [ ] Resend remains disabled unless intentionally configured.
- [ ] Sample projects, members, and placeholder contact details are replaced.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
- [ ] Anonymous `/admin/*` requests redirect to `/admin/login`.
- [ ] Admin login and CRUD operations work against the intended Supabase project.
- [ ] Sitemap, robots, public pages, and contact inbox have been checked.
- [ ] Worker Version ID is recorded for rollback.
