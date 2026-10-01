'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="admin-login"><div className="login-panel"><p className="eyebrow">Something went wrong</p><h1>We hit a temporary problem.</h1><p>Please try again. Your data has not been changed.</p><button className="button button-primary" type="button" onClick={reset}>Try again</button></div></main>;
}
