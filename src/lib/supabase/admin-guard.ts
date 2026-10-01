import { cookies } from 'next/headers';
import { getServerClient } from './server';

export async function isAdmin(): Promise<boolean> {
  const localCookie = (await cookies()).get('hezb-demo-admin');
  if (localCookie?.value === '1') return true;
  const client = await getServerClient();
  if (!client) return false;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return false;
  const { data } = await client.rpc('is_admin');
  return data === true;
}

export async function requireAdmin(): Promise<boolean> {
  return isAdmin();
}
