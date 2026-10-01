import { localAdminMessages, type AdminMessage } from '@/lib/admin-data';
import { getServerClient } from '@/lib/supabase/server';

export async function getAdminMessages(): Promise<AdminMessage[]> {
  const client = await getServerClient();
  if (client) {
    const { data, error } = await client.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((message) => ({
        id: message.id,
        name: message.name,
        email: message.email,
        company: message.company ?? '',
        topic: message.topic,
        message: message.message,
        status: message.status,
        createdAt: message.created_at,
      }));
    }
  }
  return localAdminMessages;
}
