import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'), title: 'Hezb - Build what\'s next', description: 'Hezb builds AI and software products for real-world problems.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
