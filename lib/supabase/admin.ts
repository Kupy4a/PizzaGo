import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl } from './config';

// Server-only key. It bypasses row-level security, so it must never be
// exposed to the browser: no NEXT_PUBLIC_ prefix, and this file is only
// imported from route handlers.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const hasServiceRole = serviceRoleKey.length > 0;

export function createAdminClient() {
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
