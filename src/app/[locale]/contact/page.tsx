import { getMessages } from '@/lib/i18n';
import { isLocale } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/site/ContactForm';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) notFound(); const messages = getMessages(rawLocale);
  return <><section className="page-hero"><div className="container"><p className="eyebrow">Start a conversation</p><h1>{messages.contact.title}</h1><p>{messages.contact.intro}</p></div></section><section className="section"><div className="container contact-layout"><ContactForm locale={rawLocale} messages={messages} /><aside className="contact-details"><div className="contact-detail"><small>Email</small><strong>{messages.contact.emailValue}</strong></div><div className="contact-detail"><small>{messages.contact.phone}</small><strong>{messages.contact.phoneValue}</strong></div><div className="contact-detail"><small>{rawLocale === 'vi' ? 'Địa chỉ' : 'Address'}</small><strong>{messages.contact.address}</strong></div><div className="contact-detail"><small>Response time</small><strong>{rawLocale === 'vi' ? 'Trong 1 ngày làm việc' : 'Within one business day'}</strong></div></aside></div></section></>;
}
