import Link from 'next/link';
import type { Locale } from '@/types/db';
import type { Messages } from '@/lib/i18n';

export function Footer({ locale, messages }: { locale: Locale; messages: Messages }) {
  return <footer className="site-footer"><div className="container footer-inner"><div><Link className="footer-brand" href={`/${locale}`}>Hezb</Link><p>{messages.footer.copyright}</p></div><div className="footer-meta"><span>{messages.footer.hashtags}</span><Link href={`/${locale}/contact`}>{messages.nav.contact} <span aria-hidden="true">↗</span></Link></div></div></footer>;
}
