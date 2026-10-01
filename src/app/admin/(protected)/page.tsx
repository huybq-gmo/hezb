import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { localAdminMessages } from '@/lib/admin-data';
import { localMembers, localProjects } from '@/lib/data';

export const metadata = { title: 'Dashboard | Hezb', robots: { index: false, follow: false } };

export default function AdminDashboard() {
  const newMessages = localAdminMessages.filter((message) => message.status === 'new').length;
  const stats = [['Projects', localProjects.length - 1], ['Published', localProjects.filter((item) => item.is_published).length], ['Members', localMembers.filter((item) => item.is_published).length], ['New messages', newMessages]];
  return <><div className="admin-topline"><div><p className="eyebrow">Hezb / Workspace</p><h1>Dashboard</h1></div><Link className="button button-small" href="/vi">View website <ArrowRight size={15} /></Link></div><div className="admin-note">Local demo mode: data is read from versioned fixtures. Connect Supabase to enable persistence.</div><div className="stat-grid">{stats.map(([label, value]) => <div className="stat-card" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="section-heading"><div><p className="eyebrow">Inbox</p><h2>Recent messages</h2></div><Link className="button button-small" href="/admin/messages">Open inbox <ArrowRight size={15} /></Link></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Sender</th><th>Topic</th><th>Status</th><th>Date</th></tr></thead><tbody>{localAdminMessages.map((message) => <tr key={message.id}><td><strong>{message.name}</strong><br /><span style={{ color: 'var(--muted)' }}>{message.company}</span></td><td>{message.topic}</td><td><span className={`status-pill ${message.status === 'new' ? 'new' : ''}`}>{message.status}</span></td><td>{message.createdAt}</td></tr>)}</tbody></table></div></>;
}
