import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[LoadSaathi] Missing Supabase environment variables. '
    + 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY '
    + 'in your Vercel Dashboard → Project Settings → Environment Variables.'
  );
}

// The anon key is public by design (required for Supabase client). Access control
// is enforced entirely via Row-Level Security (RLS) policies on each table — the
// key itself is harmless without valid RLS rules. Audit supabase/final-schema.sql
// to verify every table has an RLS policy before deploying to production.

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

