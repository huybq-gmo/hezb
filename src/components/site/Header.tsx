import Link from 'next/link';
import type { Locale } from '@/types/db';
import type { Messages } from '@/lib/i18n';
import { LangSwitch } from './LangSwitch';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function Header({ locale, messages }: { locale: Locale; messages: Messages }) {
  const nav = [
    ['home', `/${locale}`],
    ['about', `/${locale}/about`],
    ['projects', `/${locale}/projects`],
    ['members', `/${locale}/members`],
    ['careers', `/${locale}/careers`],
    ['contact', `/${locale}/contact`],
  ] as const;
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="logo-link" href={`/${locale}`} aria-label="Hezb home"><Logo /></Link>
        <nav className="site-nav" aria-label="Primary navigation">
          {nav.map(([key, href]) => <Link key={key} href={href}>{messages.nav[key]}</Link>)}
        </nav>
        <div className="header-actions">
          <LangSwitch locale={locale} label={messages.common.language} />
          <ThemeToggle label={messages.common.theme} />
          <Link className="button button-small button-dark" href="/admin/login">Admin</Link>
        </div>
      </div>
    </header>
  );
}
