'use client';

import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { submitContact } from '@/lib/actions/contact';
import type { ContactInput } from '@/lib/validators/contact';
import type { Locale } from '@/types/db';
import type { Messages } from '@/lib/i18n';
import { TurnstileWidget } from './TurnstileWidget';

export function ContactForm({ locale, messages }: { locale: Locale; messages: Messages }) {
  const [pending, startTransition] = useTransition(); const [success, setSuccess] = useState(false); const [serverError, setServerError] = useState(''); const [turnstileToken, setTurnstileToken] = useState(''); const [turnstileVersion, setTurnstileVersion] = useState(0);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactInput>({ defaultValues: { locale, topic: 'ai', name: '', email: '', company: '', phone: '', message: '', honeypot: '', turnstileToken: '' } });
  const submit = (values: ContactInput) => { setServerError(''); startTransition(async () => { const result = await submitContact({ ...values, turnstileToken }); if (result.ok) { setSuccess(true); setTurnstileToken(''); setTurnstileVersion((version) => version + 1); reset({ ...values, name: '', email: '', company: '', phone: '', message: '', turnstileToken: '' }); } else { setServerError(result.message); } }); };
  return <form className="form-panel" onSubmit={handleSubmit(submit)} noValidate>
    {success ? <div className="form-success" role="status">{messages.contact.success}</div> : null}
    {serverError ? <div className="field-error" role="alert" style={{ marginBottom: 15 }}>{serverError}</div> : null}
    <div className="form-grid"><div className="form-field"><label htmlFor="contact-name">{messages.contact.name} *</label><input id="contact-name" autoComplete="name" {...register('name', { required: 'Please enter your name.' })} aria-invalid={Boolean(errors.name)} />{errors.name ? <p className="field-error">{errors.name.message}</p> : null}</div><div className="form-field"><label htmlFor="contact-email">{messages.contact.email} *</label><input id="contact-email" type="email" autoComplete="email" {...register('email', { required: 'Please enter your email.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email.' } })} aria-invalid={Boolean(errors.email)} />{errors.email ? <p className="field-error">{errors.email.message}</p> : null}</div></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="contact-company">{messages.contact.company}</label><input id="contact-company" autoComplete="organization" {...register('company')} /></div><div className="form-field"><label htmlFor="contact-phone">{messages.contact.phone}</label><input id="contact-phone" autoComplete="tel" {...register('phone')} /></div></div>
    <div className="form-field"><label htmlFor="contact-topic">{messages.contact.topic}</label><select id="contact-topic" {...register('topic')}>{Object.entries(messages.contact.topics).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
    <div className="form-field"><label htmlFor="contact-message">{messages.contact.message} *</label><textarea id="contact-message" rows={6} {...register('message', { required: 'Please enter a message.' })} aria-invalid={Boolean(errors.message)} />{errors.message ? <p className="field-error">{errors.message.message}</p> : null}</div>
    <div className="sr-only" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" tabIndex={-1} autoComplete="off" {...register('honeypot')} /></div>
    <TurnstileWidget key={turnstileVersion} onToken={setTurnstileToken} />
    <button className="button button-primary" type="submit" disabled={pending}>{pending ? messages.contact.sending : messages.contact.send}</button>
  </form>;
}
