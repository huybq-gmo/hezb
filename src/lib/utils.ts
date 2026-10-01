export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function safeLocale(value: string): 'vi' | 'en' {
  return value === 'en' ? 'en' : 'vi';
}
