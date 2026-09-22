import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/supabase/config';

// Health check, also called daily by the Vercel cron in vercel.json.
// The query counts as activity, so the free Supabase project isn't paused
// after a week without visitors.
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: true, database: 'not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from('products').select('id').limit(1);

  if (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ ok: false, database: 'error' }, { status: 503 });
  }
  return NextResponse.json({ ok: true, database: 'ok' });
}
