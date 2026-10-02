import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Hezb community - Build what\'s next',
  description: 'Hezb is a community building AI and software for real-world problems.',
  verification: { google: 'v6w8uXRzuNiKzMpolQ0w7XVus1_KVxToH76n7CdiRbg' },
  icons: {
    icon: '/brand/hezb-logo-mono.svg',
    shortcut: '/brand/hezb-logo-mono.svg',
    apple: '/brand/hezb-logo-mono.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
