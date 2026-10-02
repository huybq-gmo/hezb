'use client';

import Link from 'next/link';
import { BookOpenText, BriefcaseBusiness, ExternalLink, FolderKanban, Inbox, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAdmin } from '@/lib/actions/auth';

export function Sidebar({ labels }: { labels: { dashboard: string; projects: string; members: string; blog: string; careers: string; messages: string; settings: string; website: string; logout: string } }) {
  const pathname = usePathname(); const router = useRouter();
  const items = [[`/admin`, labels.dashboard, LayoutDashboard], [`/admin/projects`, labels.projects, FolderKanban], [`/admin/members`, labels.members, Users], [`/admin/blog`, labels.blog, BookOpenText], [`/admin/careers`, labels.careers, BriefcaseBusiness], [`/admin/messages`, labels.messages, Inbox], [`/admin/settings`, labels.settings, Settings]] as const;
  return <aside className="admin-sidebar"><h2>Hezb / Admin</h2><nav className="admin-nav">{items.map(([href, label, Icon]) => <Link className={pathname === href || (href !== '/admin' && pathname.startsWith(href)) ? 'active' : ''} href={href} key={href}><Icon size={16} />{label}</Link>)}<Link href="/vi" target="_blank"><ExternalLink size={16} />{labels.website}</Link><button className="admin-nav-link" type="button" onClick={() => { void logoutAdmin().then(() => router.push('/admin/login')); }}><LogOut size={16} />{labels.logout}</button></nav></aside>;
}
