import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAdminDashboardData } from '@/lib/queries/admin';

export const metadata = { title: 'Dashboard | Hezb', robots: { index: false, follow: false } };

export default async function AdminDashboard() {
  const data = await getAdminDashboardData();
  const stats = [['Projects', data.totalProjects], ['Published', data.publishedProjects], ['Members', data.publishedMembers], ['New messages', data.newMessages]] as const;
  return <><div className="admin-topline"><div><p className="eyebrow">Hezb / Workspace</p><h1>Dashboard</h1></div><Link className="button button-small" href="/vi">View website <ArrowRight size={15} /></Link></div><div className="admin-note">Local demo mode is used only when Supabase is not configured. Production data is read through the authenticated server client.</div><div className="stat-grid">{stats.map(([label, value]) => <div className="stat-card" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="section-heading"><div><p className="eyebrow">Inbox</p><h2>Recent messages</h2></div><Link className="button button-small" href="/admin/messages">Open inbox <ArrowRight size={15} /></Link></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Sender</th><th>Topic</th><th>Status</th><th>Date</th></tr></thead><tbody>{data.recentMessages.map((message) => <tr key={message.id}><td><strong>{message.name}</strong><br /><span style={{ color: 'var(--muted)' }}>{message.company}</span></td><td>{message.topic}</td><td><span className={`status-pill ${message.status === 'new' ? 'new' : ''}`}>{message.status}</span></td><td>{message.createdAt}</td></tr>)}</tbody></table></div></>;
}
