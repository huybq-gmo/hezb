# Hezb Coding Agent Instructions

Read this file and `HEZB_PLAN.md` before changing the project. Follow phases in `PHASES.md` in order and update `project/context.md` after each phase.

## Product

Hezb is an AI and software company. The website has bilingual public pages (`vi` and `en`), static business copy in `messages/{locale}.json`, dynamic projects and members from Supabase, a contact inbox, and a protected admin area. The slogan is "Build what's next."

## Fixed Stack

- Next.js App Router, TypeScript strict, `pnpm`
- Tailwind CSS, shadcn/ui, lucide-react
- Supabase Postgres/Auth/Storage/Edge Functions
- `@supabase/supabase-js` and `@supabase/ssr`
- `next-intl`, `react-hook-form`, `zod`, `@hookform/resolvers`
- Cloudflare Workers through `@opennextjs/cloudflare`

Do not add another provider, paid service, or dependency outside this list without recording a technical decision first.

## Data and Security Rules

1. Keep TypeScript strict and never use `any`.
2. Keep public Supabase queries in `src/lib/queries/` and use the cookie-free public client. Admin/session work uses the server client.
3. Never expose a service-role key to the browser or commit a real secret.
4. Static menu/business copy belongs in locale message files. Projects, members, and contact messages belong in Supabase.
5. Public project/member queries must filter `is_published = true`; English translations fall back field-by-field to Vietnamese.
6. Validate all mutations with shared zod schemas. Every admin mutation calls `requireAdmin()` and revalidates affected public paths.
7. Contact inserts use the anon client and must not call `.select()` afterward.
8. Schema changes require a new migration. Do not edit an applied migration or make an undocumented dashboard change.
9. Media is limited to 5 MB and the approved image types; public reads and admin writes are enforced by Storage policies.
10. Every phase must leave passing lint, typecheck, build, and focused tests once those scripts exist.

## UX and Accessibility

Use the design tokens in `HEZB_PLAN.md`: indigo `#4F46E5`, cyan `#22D3EE`, ink `#0F172A`, light/dark themes, and Inter. Use semantic headings, labels, alt text, visible focus states, keyboard navigation, responsive layouts, and WCAG AA contrast.

## Workflow

- Inspect the current worktree before editing and preserve unrelated user changes.
- Make focused changes, add a test for each phase, and run the phase acceptance commands.
- Update `project/context.md` with verified evidence, pending blockers, and the next gate.
- Use commit messages like `feat(projects): add public project queries` when committing is requested.
