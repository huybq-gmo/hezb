import type { ReactNode } from 'react';

export function SectionHeading({ eyebrow, title, body, action }: { eyebrow?: string; title: string; body?: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h2>{title}</h2>{body ? <p className="section-intro">{body}</p> : null}</div>{action}</div>;
}
