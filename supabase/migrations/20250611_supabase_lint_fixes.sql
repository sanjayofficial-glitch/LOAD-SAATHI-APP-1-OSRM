-- ================================================================
-- LOADSAATHI — Supabase Database Lint Fixes
-- Date: 2025-06-11
-- Purpose: Fix all lint warnings from `supabase db lint`
-- ================================================================
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard/project/<YOUR-PROJECT>/sql/new
-- ================================================================

-- ================================================================
-- LINT 0011: function_search_path_mutable
-- Fix: Set search_path on update_updated_at_column() so it doesn't
--      depend on the session's mutable search_path.
-- ================================================================
-- WARNING: update_updated_at_column() has a role mutable search_path
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- ================================================================
-- LINT 0014: extension_in_public
-- Fix: Move pg_trgm to a dedicated extensions schema.
-- The GIN indexes using gin_trgm_ops will continue to work because
-- we add `extensions` to the database-level search_path.
-- ================================================================
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Note: Existing GIN indexes using gin_trgm_ops store the extension OID,
-- not the schema-qualified name, so they continue to work after the move.
-- No need to alter the database-level search_path.

-- ================================================================
-- LINT 0024: rls_policy_always_true (permissive RLS)
-- Fix: Create a SECURITY DEFINER function for cross-user notification
--      creation, then restrict the INSERT policy to self-inserts only.
-- ================================================================

-- Create the SECURITY DEFINER function for notification creation
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id text,
  p_message text,
  p_type text DEFAULT NULL,
  p_title text DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_related_trip_id uuid DEFAULT NULL,
  p_related_shipment_request_id uuid DEFAULT NULL
)
RETURNS uuid
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id, message, type, title, action_url,
    related_trip_id, related_shipment_request_id
  )
  VALUES (
    p_user_id, p_message, p_type, p_title, p_action_url,
    p_related_trip_id, p_related_shipment_request_id
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Grant execute to authenticated users (they call this via rpc)
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;

-- Replace the permissive INSERT policy with a restricted one
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Users can create own notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

-- ================================================================
-- LINT 0026: pg_graphql_anon_table_exposed
-- Fix: Revoke SELECT from anon on all public tables.
--      The app requires authentication for all operations, so anon
--      should not see any table structure in GraphQL.
-- ================================================================
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT ON TABLES FROM anon;

-- ================================================================
-- LINT 0027: pg_graphql_authenticated_table_exposed
-- Note: This is a WARN-level lint about GraphQL discoverability.
-- Authenticated users need base SELECT on these tables for PostgREST
-- + RLS to function correctly. The data is protected by RLS policies.
-- We accept this lint because fixing it would break the app's ability
-- to query user data for JOINs in trip/shipment listings.
--
-- If stricter GraphQL exposure control is needed, create views that
-- expose only non-sensitive fields and revoke SELECT on base tables:
--   CREATE VIEW public.user_profiles AS
--     SELECT id, full_name, user_type, rating, total_trips
--     FROM public.users;
--   GRANT SELECT ON public.user_profiles TO authenticated;
--   REVOKE SELECT ON public.users FROM authenticated;
-- ================================================================

-- ================================================================
-- LINT 0028 & 0029: anon/authenticated_security_definer_function
-- Fix: Revoke EXECUTE on rls_auto_enable from both roles since it
--      shouldn't be callable through the API.
-- ================================================================
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable FROM anon, authenticated;

-- ================================================================
-- VERIFICATION
-- ================================================================
-- Re-run `supabase db lint` to confirm all warnings are resolved.
-- Or check individual issues:
--
-- Check function search_path:
--   SELECT proname, prosrc FROM pg_proc WHERE proname = 'update_updated_at_column';
--
-- Check extension schema:
--   SELECT extname, nspname FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace;
--
-- Check RLS policies:
--   SELECT tablename, policyname, cmd, qual, with_check
--   FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
--
-- Check table privileges:
--   SELECT grantee, table_name, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated');
--
-- Check function privileges:
--   SELECT nspname, proname, proacl
--   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE nspname = 'public' AND proname = 'rls_auto_enable';

-- ================================================================
-- ROLLBACK
-- ================================================================
-- 1. REVOKE EXECUTE ON FUNCTION public.create_notification FROM authenticated;
--    DROP FUNCTION IF EXISTS public.create_notification;
-- 2. DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;
--    CREATE POLICY "System can create notifications" ON public.notifications
--      FOR INSERT TO authenticated WITH CHECK (true);
-- 3. GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
--    GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
-- 4. GRANT EXECUTE ON FUNCTION public.rls_auto_enable TO anon, authenticated;
-- 5. ALTER EXTENSION pg_trgm SET SCHEMA public;
--    DROP SCHEMA IF EXISTS extensions;
-- 6. ALTER FUNCTION public.update_updated_at_column() RESET search_path;
-- ================================================================
