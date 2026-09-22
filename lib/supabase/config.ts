// Shared by server and browser code: NEXT_PUBLIC_* values are inlined at build time.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// New projects call it the publishable key, older ones the anon key; both work.
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Without Supabase the shop still works: orders go to a local JSON file
// and account pages are hidden.
export const isSupabaseConfigured =
  /^https?:\/\//.test(supabaseUrl) &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey.length > 0 &&
  !supabaseAnonKey.startsWith('your-');
