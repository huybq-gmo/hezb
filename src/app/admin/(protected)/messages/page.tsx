import { localAdminMessages } from '@/lib/admin-data';

export const metadata = { title: 'Messages | Hezb', robots: { index: false, follow: false } };

export default function AdminMessagesPage() { return <><div className="admin-topline"><div><p className="eyebrow">Inbox</p><h1>Messages</h1></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Sender</th><th>Topic</th><th>Message</th><th>Status</th><th>Date</th></tr></thead><tbody>{localAdminMessages.map((message) => <tr key={message.id}><td><strong>{message.name}</strong><br /><span style={{ color: 'var(--muted)' }}>{message.email}</span></td><td>{message.topic}</td><td>{message.message}</td><td><span className={`status-pill ${message.status === 'new' ? 'new' : ''}`}>{message.status}</span></td><td>{message.createdAt}</td></tr>)}</tbody></table></div></>; }
