import { cookies } from 'next/headers';
import { getServerClient } from './server';

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const localCookie = cookieStore.get('hezb-demo-admin');
  if (process.env.NODE_ENV === 'development' && localCookie?.value === '1') return true;
  const hasSupabaseSession = cookieStore.getAll().some(({ name }) => name.startsWith('sb-') && name.includes('-auth-token'));
  if (!hasSupabaseSession) return false;
  const client = await getServerClient();
  if (!client) return false;
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user?.id) return false;
  const { data, error: adminError } = await client.rpc('is_admin');
  if (!adminError && data === true) return true;
  await client.auth.signOut();
  return false;
}

export async function requireAdmin(): Promise<boolean> {
  return isAdmin();
}
