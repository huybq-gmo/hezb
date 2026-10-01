import { getAdminMessages } from '@/lib/queries/messages';
import { MessageTable } from '@/components/admin/MessageTable';

export const metadata = { title: 'Messages | Hezb', robots: { index: false, follow: false } };

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages();
  return <><div className="admin-topline"><div><p className="eyebrow">Inbox</p><h1>Messages</h1></div></div><MessageTable messages={messages} /></>;
}
