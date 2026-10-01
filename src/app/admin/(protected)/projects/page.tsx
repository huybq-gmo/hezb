import Link from 'next/link';
import { Plus, ArrowUpRight } from 'lucide-react';
import { localProjects, localCategories, localProjectTranslations } from '@/lib/data';

export const metadata = { title: 'Projects | Hezb', robots: { index: false, follow: false } };

export default function AdminProjectsPage() {
  return <><div className="admin-topline"><div><p className="eyebrow">Content</p><h1>Projects</h1></div><Link className="button button-primary button-small" href="/admin/projects/new"><Plus size={15} /> Add project</Link></div><div className="admin-note">Drafts remain hidden from public routes and sitemap until they are published.</div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Project</th><th>Category</th><th>Year</th><th>Featured</th><th>Status</th><th>Action</th></tr></thead><tbody>{localProjects.map((project) => { const title = localProjectTranslations.find((translation) => translation.project_id === project.id && translation.locale === 'en')?.title ?? project.slug; const category = localCategories.find((item) => item.id === project.category_id)?.name_en ?? '-'; return <tr key={project.id}><td><strong>{title}</strong><br /><span style={{ color: 'var(--muted)' }}>{project.slug}</span></td><td>{category}</td><td>{project.year}</td><td>{project.is_featured ? 'Yes' : '-'}</td><td><span className={`status-pill ${project.is_published ? '' : 'draft'}`}>{project.is_published ? 'Published' : 'Draft'}</span></td><td><Link className="button button-small" href={`/en/projects/${project.slug}`} target="_blank" aria-label={`Open ${title}`}><ArrowUpRight size={14} /></Link></td></tr>; })}</tbody></table></div></>;
}
