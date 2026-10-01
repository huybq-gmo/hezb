type ContactRecord = { name: string; email: string; company?: string | null; topic: string; message: string; locale: string };

function recordFrom(value: unknown): ContactRecord | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.name !== 'string' || typeof record.email !== 'string' || typeof record.message !== 'string' || typeof record.topic !== 'string' || typeof record.locale !== 'string') return null;
  return { name: record.name, email: record.email, company: typeof record.company === 'string' ? record.company : null, topic: record.topic, message: record.message, locale: record.locale };
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const payload: unknown = await request.json().catch(() => null);
  const root = typeof payload === 'object' && payload !== null ? payload as Record<string, unknown> : {};
  const record = recordFrom(root.record);
  if (!record) return Response.json({ ok: false, error: 'Invalid webhook payload' }, { status: 400 });
  if (Deno.env.get('CONTACT_EMAIL_ENABLED') !== 'true') return Response.json({ ok: true, skipped: true });

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const notifyEmail = Deno.env.get('NOTIFY_EMAIL');
  if (!apiKey || !notifyEmail) return Response.json({ ok: false, error: 'Email adapter is not configured' }, { status: 500 });
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'Hezb website <onboarding@resend.dev>', to: [notifyEmail], subject: `[Hezb] New ${record.topic} enquiry from ${record.name}`, text: `${record.name} (${record.email})${record.company ? ` - ${record.company}` : ''}\n\n${record.message}` }) });
  if (!response.ok) return Response.json({ ok: false, error: 'Email provider rejected the request' }, { status: 502 });
  return Response.json({ ok: true });
});
