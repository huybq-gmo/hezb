# Contact notification adapter

The `contact_messages` row is the source of truth. The `notify-contact` Edge Function is optional and never deletes or modifies the inbox row.

## Disabled mode (default)

Keep `CONTACT_EMAIL_ENABLED=false`. The contact form inserts through the public anon client and admins read the inbox in `/admin/messages`.

## Enabled mode

Set these Edge Function secrets outside Git:

```bash
supabase secrets set CONTACT_EMAIL_ENABLED=true RESEND_API_KEY=... NOTIFY_EMAIL=...
supabase functions deploy notify-contact
```

Create a Supabase Database Webhook for `public.contact_messages` INSERT events pointing to the function URL and include the function authorization secret configured by Supabase. Verify the function returns `skipped: true` in disabled mode before enabling outbound email. Email failure must not remove or roll back the inbox message.
