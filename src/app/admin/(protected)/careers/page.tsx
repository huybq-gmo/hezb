import Link from 'next/link';
import { getAdminJobs, getJobApplications } from '@/lib/queries/careers';
import { JobTable } from '@/components/admin/JobTable';
import { ApplicationTable } from '@/components/admin/ApplicationTable';

export const metadata = { title: 'Careers | Hezb', robots: { index: false, follow: false } };

export default async function AdminCareersPage() {
  const [jobs, applications] = await Promise.all([getAdminJobs('en'), getJobApplications()]);
  return <><div className="admin-topline"><div><p className="eyebrow">People operations</p><h1>Careers</h1></div><Link className="button button-primary button-small" href="/admin/careers/new">Add role</Link></div><div className="admin-note">Publish a role when applications are ready. Candidate CVs stay private and are available only to admins.</div><h2 className="admin-section-title">Open roles</h2><JobTable jobs={jobs} /><h2 className="admin-section-title">Applications <span className="admin-count">{applications.length}</span></h2><ApplicationTable applications={applications} /></>;
}
