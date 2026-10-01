import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ProjectView } from '@/types/view-models';

export function ProjectCard({ project }: { project: ProjectView }) {
  return <Link className="project-card" href={`/${project.locale}/projects/${project.slug}`}>
    <div className="project-visual">
      {project.coverUrl ? <Image src={project.coverUrl} alt="" fill sizes="(max-width: 720px) 100vw, 33vw" unoptimized /> : <span>{project.title.slice(0, 1)}</span>}
      <span className="visual-arrow"><ArrowUpRight size={19} /></span>
    </div>
    <div className="project-copy"><div className="card-kicker"><span>{project.category?.name}</span>{project.year ? <span>{project.year}</span> : null}</div><h3>{project.title}</h3><p>{project.summary}</p><div className="tech-list">{project.tech.slice(0, 3).map((tech) => <span key={tech}>{tech}</span>)}</div></div>
  </Link>;
}
