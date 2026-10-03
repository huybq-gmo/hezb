import { getCloudflareContext } from '@opennextjs/cloudflare';
import { headers } from 'next/headers';

type ContactRateLimitBinding = {
  limit: (options: { key: string }) => Promise<{ success: boolean }>;
};

declare global {
  interface CloudflareEnv {
    CONTACT_RATE_LIMITER?: ContactRateLimitBinding;
  }
}

export const rateLimitMessage = 'Too many attempts. Please wait a minute and try again.';

function firstForwardedIp(value: string | null): string {
  return value?.split(',')[0]?.trim() || '';
}

async function requestKey(scope: string): Promise<string> {
  const requestHeaders = await headers();
  const ip = requestHeaders.get('cf-connecting-ip')?.trim()
    || firstForwardedIp(requestHeaders.get('x-forwarded-for'))
    || requestHeaders.get('x-real-ip')?.trim()
    || 'unknown';
  return `${scope}:${ip.slice(0, 128)}`;
}

export async function checkRateLimit(scope: 'contact' | 'application'): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const limiter = env.CONTACT_RATE_LIMITER;
    if (!limiter) return true;
    const result = await limiter.limit({ key: await requestKey(scope) });
    return result.success;
  } catch {
    // Local Next.js runs do not have a Cloudflare binding. Turnstile and the honeypot remain active there.
    return true;
  }
}
