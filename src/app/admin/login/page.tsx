import { LoginForm } from '@/components/admin/LoginForm';

export const metadata = { title: 'Admin login | Hezb', robots: { index: false, follow: false } };

export default function AdminLoginPage() { return <main className="admin-login"><LoginForm labels={{ email: 'Email', password: 'Password', signIn: 'Admin login', error: 'Use your Hezb administrator account.' }} /></main>; }
