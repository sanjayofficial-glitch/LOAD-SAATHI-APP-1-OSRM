import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[LoadSaathi] Missing Supabase environment variables. '
    + 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY '
    + 'in your Vercel Dashboard → Project Settings → Environment Variables.'
  );
}

/**
 * Creates a Supabase client configured with a Clerk JWT for authorization.
 * @param clerkToken - The Clerk authentication token to use for Authorization header
 * @returns Supabase client instance with global headers set to include the Clerk token
 */
export const createClerkSupabaseClient = (clerkToken: string) => {
  return createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
    }
  );
};