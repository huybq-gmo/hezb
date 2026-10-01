import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { getMessages } from '@/lib/i18n';
import { requireAdmin } from '@/lib/supabase/admin-guard';

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await requireAdmin())) redirect('/admin/login');
  const labels = getMessages('vi').admin;
  return <div className="admin-shell"><Sidebar labels={labels} /><section className="admin-content">{children}</section></div>;
}
