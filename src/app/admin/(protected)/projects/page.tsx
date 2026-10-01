import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ProjectTable } from '@/components/admin/ProjectTable';
import { getAdminProjects } from '@/lib/queries/projects';

export const metadata = { title: 'Projects | Hezb', robots: { index: false, follow: false } };

export default async function AdminProjectsPage() { const projects = await getAdminProjects('en'); return <><div className="admin-topline"><div><p className="eyebrow">Content</p><h1>Projects</h1></div><Link className="button button-primary button-small" href="/admin/projects/new"><Plus size={15} /> Add project</Link></div><div className="admin-note">Drafts remain hidden from public routes and sitemap until they are published.</div><ProjectTable projects={projects} /></>; }
