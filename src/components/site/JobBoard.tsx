'use client';

import { ArrowRight, MapPin, Radio, X } from 'lucide-react';
import { useState, useTransition } from 'react';
import { applyToJob } from '@/lib/actions/careers';
import type { Locale } from '@/types/db';
import type { JobView } from '@/types/view-models';
import type { Messages } from '@/lib/i18n';
import { TurnstileWidget } from './TurnstileWidget';

function listLines(value: string): string[] {
  return value.split('\n').map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
}

export function JobBoard({ locale, jobs, messages }: { locale: Locale; jobs: JobView[]; messages: Messages }) {
  const [selected, setSelected] = useState<JobView | null>(null);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileVersion, setTurnstileVersion] = useState(0);

  function open(job: JobView) {
    setSelected(job);
    setSuccess(false);
    setError('');
  }

  function close() {
    if (pending) return;
    setSelected(null);
    setSuccess(false);
    setError('');
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set('turnstileToken', turnstileToken);
    setError('');
    startTransition(async () => {
      const result = await applyToJob(data);
      if (result.ok) {
        setSuccess(true);
        setTurnstileToken('');
        setTurnstileVersion((version) => version + 1);
        form.reset();
      } else {
        setError(result.message);
      }
    });
  }

  return <>
    {jobs.length ? <div className="job-grid">{jobs.map((job) => <article className="job-card" key={job.id}>
      <div className="job-card-top"><p className="eyebrow">{messages.careers.employmentTypes[job.employmentType]}</p><span className="job-open-dot" aria-label={messages.careers.openings} /></div>
      <h2>{job.title}</h2>
      <p className="job-summary">{job.summary}</p>
      <div className="job-meta"><span><MapPin size={15} />{job.location}</span>{job.isRemote ? <span><Radio size={15} />{messages.careers.remote}</span> : null}</div>
      <details className="job-details"><summary>{messages.careers.description}</summary><p>{job.description}</p>{job.requirements ? <><h3>{messages.careers.requirements}</h3><ul>{listLines(job.requirements).map((item) => <li key={item}>{item}</li>)}</ul></> : null}</details>
      <button className="button button-primary" type="button" onClick={() => open(job)}>{messages.careers.apply} <ArrowRight size={16} /></button>
    </article>)}</div> : <div className="empty-state">{messages.careers.status}</div>}

    {selected ? <div className="job-application-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="job-application-dialog" role="dialog" aria-modal="true" aria-labelledby="job-application-title">
        <div className="job-application-header"><div><p className="eyebrow">{messages.careers.apply}</p><h2 id="job-application-title">{selected.title}</h2></div><button className="icon-button" type="button" onClick={close} aria-label={messages.careers.close}><X size={18} /></button></div>
        {success ? <div className="form-success" role="status">{messages.careers.applicationSuccess}</div> : <form className="job-application-form" onSubmit={submit}>
          {error ? <div className="field-error" role="alert">{error || messages.careers.applicationError}</div> : null}
          <input type="hidden" name="jobId" value={selected.id} /><input type="hidden" name="locale" value={locale} />
          <div className="form-grid"><div className="form-field"><label htmlFor="career-name">{messages.careers.name} *</label><input id="career-name" name="name" autoComplete="name" required minLength={2} maxLength={120} /></div><div className="form-field"><label htmlFor="career-email">{messages.careers.email} *</label><input id="career-email" name="email" type="email" autoComplete="email" required /></div></div>
          <div className="form-grid"><div className="form-field"><label htmlFor="career-phone">{messages.careers.phone}</label><input id="career-phone" name="phone" autoComplete="tel" /></div><div className="form-field"><label htmlFor="career-portfolio">{messages.careers.portfolio}</label><input id="career-portfolio" name="portfolioUrl" type="url" placeholder="https://" /></div></div>
          <div className="form-field"><label htmlFor="career-note">{messages.careers.coverNote} *</label><textarea id="career-note" name="coverNote" rows={5} required minLength={10} maxLength={5000} /></div>
          <div className="form-field"><label htmlFor="career-cv">{messages.careers.cv} *</label><input id="career-cv" name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /><small>{messages.careers.cvHint}</small></div>
          <div className="sr-only" aria-hidden="true"><label htmlFor="career-website">Website</label><input id="career-website" name="website" tabIndex={-1} autoComplete="off" /></div>
          <TurnstileWidget key={turnstileVersion} onToken={setTurnstileToken} />
          <button className="button button-primary" type="submit" disabled={pending}>{pending ? messages.careers.sendingApplication : messages.careers.sendApplication} <ArrowRight size={16} /></button>
        </form>}
      </section>
    </div> : null}
  </>;
}
