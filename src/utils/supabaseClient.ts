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

/** Map of Clerk JWT token prefix → cached Supabase client instance */
const clientCache = new Map<string, ReturnType<typeof createClient>>();
const CACHE_MAX = 5;

/**
 * Creates a Supabase client configured with a Clerk JWT for authorization.
 * Caches up to 5 clients keyed by token prefix to avoid recreating on every call.
 */
export const createClerkSupabaseClient = (clerkToken: string) => {
  const cacheKey = clerkToken.slice(0, 16);
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  const client = createClient(
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

  // Evict oldest entry if over limit
  if (clientCache.size >= CACHE_MAX) {
    const oldest = clientCache.keys().next().value;
    if (oldest !== undefined) {
      clientCache.delete(oldest);
    }
  }
  clientCache.set(cacheKey, client);
  return client;
};