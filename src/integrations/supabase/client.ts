import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('[Supabase] Missing environment variables for anonymous client');
}

// This client is for anonymous/public access only
// For authenticated requests, use createClerkSupabaseClient from @/utils/supabaseClient
export const supabase = createClient(SUPABASE_URL || '', SUPABASE_PUBLISHABLE_KEY || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});