import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/db';

const ADMIN_LOGIN_PATH = '/admin/login';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === ADMIN_LOGIN_PATH || !pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const hasDemoAdmin = process.env.NODE_ENV === 'development'
    && request.cookies.get('hezb-demo-admin')?.value === '1';
  const hasSupabaseSession = request.cookies.getAll().some(({ name }) => (
    name.startsWith('sb-') && name.includes('-auth-token')
  ));

  if (hasDemoAdmin) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (hasSupabaseSession && supabaseUrl && supabaseKey) {
    let response = NextResponse.next({ request });
    const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!userError && user) {
      const { data, error } = await supabase.rpc('is_admin');
      if (!error && data === true) return response;
    }
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = ADMIN_LOGIN_PATH;
  loginUrl.search = '';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
