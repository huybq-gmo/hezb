'use server';

import { cookies } from 'next/headers';
import { getServerClient } from '@/lib/supabase/server';

export type AuthResult = { ok: true } | { ok: false; message: string };

export async function loginAdmin(email: string, password: string): Promise<AuthResult> {
  const client = await getServerClient();
  if (client) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    return error ? { ok: false, message: 'Invalid email or password.' } : { ok: true };
  }
  const expectedEmail = process.env.HEZB_DEMO_ADMIN_EMAIL ?? 'demo@hezb.local';
  const expectedPassword = process.env.HEZB_DEMO_ADMIN_PASSWORD ?? 'demo';
  if (email === expectedEmail && password === expectedPassword) {
    (await cookies()).set('hezb-demo-admin', '1', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    return { ok: true };
  }
  return { ok: false, message: 'Invalid demo credentials.' };
}

export async function logoutAdmin(): Promise<void> {
  const client = await getServerClient(); if (client) await client.auth.signOut();
  (await cookies()).delete('hezb-demo-admin');
}
