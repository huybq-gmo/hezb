'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';

export function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const saved = window.localStorage.getItem('hezb-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  function update(next: Theme) {
    setTheme(next);
    if (next === 'system') {
      window.localStorage.removeItem('hezb-theme');
      document.documentElement.removeAttribute('data-theme');
    } else {
      window.localStorage.setItem('hezb-theme', next);
      document.documentElement.dataset.theme = next;
    }
  }

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  return (
    <div className="theme-control">
      <span className="sr-only">{label}</span>
      <button className="icon-button" type="button" aria-label={`${label}: ${theme}`} onClick={() => update(theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system')}>
        <Icon size={17} strokeWidth={1.8} />
      </button>
    </div>
  );
}
