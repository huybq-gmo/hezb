import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Hezb - Build what\'s next', description: 'Hezb builds AI and software products for real-world problems.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
