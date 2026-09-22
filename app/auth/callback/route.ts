import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Target of the confirmation email link: swaps the one-time code for a session.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL('/account', url.origin));
  }
  return NextResponse.redirect(new URL('/login', url.origin));
}
