'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { MemberCard } from './MemberCard';
import type { MemberView } from '@/types/view-models';

type MemberSliderLabels = {
  title: string;
  previous: string;
  next: string;
  goToMember: string;
};

export function MemberSlider({ members, labels }: { members: MemberView[]; labels: MemberSliderLabels }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function syncActive() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const slides = Array.from(viewport.children);
    const nearest = slides.reduce((bestIndex, slide, index) => {
      const best = slides[bestIndex];
      return Math.abs((slide as HTMLElement).offsetLeft - viewport.scrollLeft) < Math.abs((best as HTMLElement).offsetLeft - viewport.scrollLeft) ? index : bestIndex;
    }, 0);
    setActive(nearest);
  }

  function goTo(index: number) {
    const viewport = viewportRef.current;
    const slide = viewport?.children[index] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setActive(index);
  }

  return <div className="member-slider" role="region" aria-roledescription="carousel" aria-label={labels.title}>
    <div className="member-slider-toolbar">
      <span className="sr-only" aria-live="polite">{active + 1} / {members.length}</span>
      <div className="member-slider-controls">
        <button className="icon-button" type="button" aria-label={labels.previous} disabled={active === 0} onClick={() => goTo(active - 1)}><ChevronLeft size={18} /></button>
        <button className="icon-button" type="button" aria-label={labels.next} disabled={active === members.length - 1} onClick={() => goTo(active + 1)}><ChevronRight size={18} /></button>
      </div>
    </div>
    <div ref={viewportRef} className="member-slider-viewport" tabIndex={0} onScroll={syncActive}>
      {members.map((member) => <div className="member-slide" key={member.id}><MemberCard member={member} /></div>)}
    </div>
    <div className="member-slider-dots" role="tablist" aria-label={labels.title}>
      {members.map((member, index) => <button className={`member-dot ${active === index ? 'active' : ''}`} key={member.id} type="button" role="tab" aria-selected={active === index} aria-label={`${labels.goToMember} ${index + 1}`} onClick={() => goTo(index)} />)}
    </div>
  </div>;
}
