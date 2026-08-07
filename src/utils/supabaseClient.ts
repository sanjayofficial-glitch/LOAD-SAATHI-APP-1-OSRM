import { createClient } from '@supabase/supabase-js';
import { createLogger } from '@/lib/logger';

const log = createLogger('SupabaseClient');

/**
 * Clerk-authenticated Supabase client factory.
 * Used for ALL data mutations (inserts, updates, deletes) that require
 * user authorization via Clerk JWT. The token is passed as the
 * Authorization header so Supabase RLS policies can verify the user.
 *
 * For Realtime subscriptions (read-only), use the anonymous client
 * from @/integrations/supabase/client instead.
 *
 * IMPORTANT: Each call creates a fresh client with the provided token.
 * Previously this cached clients by token prefix, but cached clients
 * could retain stale/expired Authorization headers causing 401 errors
 * when Clerk rotated tokens. Creating a new client is cheap (just
 * config setup) so the cache is no longer needed.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  log.warn(
    'Missing Supabase environment variables. '
    + 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY '
    + 'in your Vercel Dashboard → Project Settings → Environment Variables.'
  );
}

/**
 * Creates a fresh Supabase client configured with a Clerk JWT for authorization.
 * Always creates a new client to ensure the Authorization header has a valid token.
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
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: `sb-clerk-${clerkToken.slice(0, 8)}`,
      },
    }
  );
};