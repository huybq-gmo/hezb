import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { MemberSlider } from '@/components/site/MemberSlider';
import { MemberCard } from '@/components/site/MemberCard';
import { ProjectCard } from '@/components/site/ProjectCard';
import { SectionHeading } from '@/components/site/SectionHeading';
import { getMessages } from '@/lib/i18n';
import { getFeaturedMembers } from '@/lib/queries/members';
import { getFeaturedProjects } from '@/lib/queries/projects';
import { isLocale } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const messages = getMessages(rawLocale);
  const [projects, members] = await Promise.all([getFeaturedProjects(rawLocale), getFeaturedMembers(rawLocale, 3)]);
  return <>
    <section className="hero"><div className="container hero-grid"><div><p className="eyebrow">{messages.home.eyebrow}</p><h1>{messages.home.heroBefore} <em>{messages.home.heroHighlight}</em> {messages.home.heroAfter}</h1><p className="hero-body">{messages.home.heroBody}</p><div className="hero-actions"><Link className="button button-primary" href={`/${rawLocale}/contact`}>{messages.common.contact} <ArrowRight size={17} /></Link><Link className="button" href={`/${rawLocale}/projects`}>{messages.common.viewProjects}</Link></div></div><div className="hero-aside"><div className="hero-image"><Image src="/illustrations/hezb-hero-community.jpg" alt={messages.home.heroImageAlt} fill sizes="(max-width: 960px) 100vw, 480px" priority /></div><p>{messages.home.heroCaption}<br />Build what&apos;s next.</p></div></div></section>
    <section className="section"><div className="container story-grid"><div><p className="eyebrow">{messages.home.storyEyebrow}</p><p className="story-copy">{messages.home.storyBody}</p></div><p className="story-detail">{messages.home.storyDetail}</p></div></section>
    <section className="section section-soft"><div className="container"><SectionHeading eyebrow={messages.home.missionEyebrow} title={messages.home.missionTitle} body={messages.home.missionBody} /><div className="feature-grid">{messages.home.mission.map(([title, body], index) => <article className="feature-card" key={title}><span className="feature-index">0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow={messages.home.valuesEyebrow} title={messages.home.valuesTitle} /><div className="feature-grid">{messages.home.values.map(([title, body], index) => <article className="feature-card" key={title}><span className="feature-index">0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
    {projects.length ? <section className="section section-soft"><div className="container"><SectionHeading eyebrow={messages.home.featuredEyebrow} title={messages.home.featuredProjects} body={messages.home.featuredProjectsBody} action={<Link className="button button-small" href={`/${rawLocale}/projects`}>{messages.common.viewAll} <ArrowRight size={15} /></Link>} /><div className="project-grid">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div></div></section> : null}
    {members.length ? <section className="section"><div className="container"><SectionHeading eyebrow={messages.home.teamEyebrow} title={messages.home.teamTitle} body={messages.home.teamBody} action={<Link className="button button-small" href={`/${rawLocale}/members`}>{messages.common.viewAll} <ArrowRight size={15} /></Link>} />{members.length <= 3 ? <div className="member-grid">{members.map((member) => <MemberCard key={member.id} member={member} />)}</div> : <MemberSlider members={members} labels={{ title: messages.home.teamTitle, previous: messages.common.previous, next: messages.common.next, goToMember: messages.common.goToMember }} />}</div></section> : null}
    <section className="section cta-band"><div className="container"><div className="cta"><h2>{messages.home.ctaTitle}</h2><p>{messages.home.ctaBody}</p><Link className="button" href={`/${rawLocale}/contact`}>{messages.common.contact} <ArrowRight size={16} /></Link></div></div></section>
  </>;
}
