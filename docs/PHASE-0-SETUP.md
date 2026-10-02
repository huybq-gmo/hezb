# Phase 0 Setup and Evidence

This document separates repository work from actions that require access to Supabase or Cloudflare. Do not replace pending steps with guessed values.

## Local verification

```bash
node --test tests/phase-00.test.mjs
```

The test checks the versioned schema contract, seed visibility fixture, environment variable classification, and the Phase 0 context.

## Supabase development project

1. Install and authenticate the Supabase CLI.
2. Create/select the development project and link it without committing the access token:

   ```bash
   supabase login
   supabase link --project-ref "$SUPABASE_DEV_PROJECT_REF"
   supabase db push
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
   ```

   Use the dashboard SQL editor for `seed.sql` if the CLI does not support remote seed execution in the installed version. Record the command and result in `project/context.md`.
3. Confirm the three published projects and two published members are visible with the anon key, while `sample-vision-qc` and `sample-designer` are not.
4. Create an Auth email/password user, add its UUID to `public.admins`, and verify that a non-admin cannot access admin data. Disable public sign-up in Authentication settings.
5. Confirm `public.site_settings` has one row and update its public email, phone, address, and response-time values from `/admin/settings`.

## Cloudflare and optional email

Create Turnstile and a Workers project only after deciding the production URL. Keep `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` outside Git. `CONTACT_EMAIL_ENABLED=false` is the default and the inbox remains authoritative.

## Production handoff

Repeat migrations against the production project after reviewing the seed (development fixtures must not be promoted). Configure Supabase Auth redirect URLs and the Cloudflare Worker environment through the provider secret manager.

## Evidence rule

The Phase 0 gate is not complete until the operator records the linked project reference, migration/seed result, admin login check, and redirect/resource decisions in `project/context.md`. Never put access tokens or real secrets in that file.
