'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/actions/auth';

export function LoginForm({ labels }: { labels: { email: string; password: string; signIn: string; error: string } }) {
  const router = useRouter(); const [pending, startTransition] = useTransition(); const [error, setError] = useState('');
  return <form className="login-panel" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setError(''); startTransition(async () => { const result = await loginAdmin(String(data.get('email') ?? ''), String(data.get('password') ?? '')); if (result.ok) router.push('/admin'); else setError(result.message); }); }}><p className="eyebrow">Hezb / Admin</p><h1>{labels.signIn}</h1><p>{labels.error}</p>{error ? <p className="field-error" role="alert">{error}</p> : null}<div className="form-field"><label htmlFor="admin-email">{labels.email}</label><input id="admin-email" name="email" type="email" autoComplete="email" required /></div><div className="form-field"><label htmlFor="admin-password">{labels.password}</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required /></div><button className="button button-primary" type="submit" disabled={pending}>{pending ? '...' : labels.signIn}</button></form>;
}
