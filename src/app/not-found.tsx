import Link from 'next/link';

export default function NotFound() { return <main className="admin-login"><div className="login-panel"><p className="eyebrow">404 / Hezb</p><h1>Page not found</h1><p>The page or project you requested is not available.</p><Link className="button button-primary" href="/vi">Back home</Link></div></main>; }
