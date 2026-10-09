import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Target of the email links (sign-up confirmation, password recovery):
// swaps the one-time code for a session, then goes where `next` points.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next');
  // Only in-app paths, so the link can't be turned into an open redirect.
  const target = next && /^\/[^/\\]/.test(next) ? next : '/account';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(target, url.origin));
  }
  return NextResponse.redirect(new URL('/login', url.origin));
}
