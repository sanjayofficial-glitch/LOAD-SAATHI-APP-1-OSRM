-- ================================================================
-- LOADSAATHI — Fix "Failed to load trucks" on the Find Trucks page
-- Date: 2026-08-06
-- Purpose: Restore read access for the `authenticated` role on the
--          tables the app reads via PostgREST with Clerk JWTs.
--
-- Symptom:  Shippers see "Failed to load trucks / We couldn't fetch
--           available trucks right now" on /browse-trucks.
-- Root cause (verified): PostgREST returns HTTP 401 SQLSTATE 42501
--           "permission denied for table trips" for the app's exact
--           query. The schema (columns + the `users!trips_trucker_id_fkey`
--           relationship) is valid — the request role simply lacks the
--           base SELECT privilege and/or a matching RLS policy on the
--           trips table.
--
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard/project/<YOUR-PROJECT>/sql/new
-- ================================================================

-- ================================================================
-- SECTION 1: Base table privileges (GRANT)
-- PostgREST requires the requesting role to hold base SELECT on a
-- table BEFORE RLS policies can filter rows. If these grants are
-- missing (table created outside Supabase default privileges, or a
-- REVOKE was applied), every read fails with SQLSTATE 42501.
-- RLS policies in Section 2 still enforce row-level filtering.
-- ================================================================

GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Also keep default privileges aligned for any tables created later.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;

-- ================================================================
-- SECTION 2: RLS SELECT policies (recreated idempotently)
-- These match src/integrations/supabase/final-schema.sql.
-- ================================================================

-- TRIPS — any authenticated user can browse available trips
DROP POLICY IF EXISTS "Anyone can see active trips" ON public.trips;
CREATE POLICY "Anyone can see active trips" ON public.trips
  FOR SELECT TO authenticated USING (true);

-- USERS — required for trucker:users!trips_trucker_id_fkey JOINs in
-- trip listings (shows trucker name/rating instead of a bare ID)
DROP POLICY IF EXISTS "Authenticated users can read all users" ON public.users;
CREATE POLICY "Authenticated users can read all users" ON public.users
  FOR SELECT TO authenticated USING (true);

-- DRIVER_LOCATIONS — live truck map (LiveTruckMap / BrowseTrips map view)
DROP POLICY IF EXISTS "Anyone can read driver_locations" ON public.driver_locations;
CREATE POLICY "Anyone can read driver_locations" ON public.driver_locations
  FOR SELECT TO authenticated USING (true);

-- ================================================================
-- VERIFICATION
-- Run these after applying to confirm access is restored:
--
--   SELECT grantee, table_name, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee = 'authenticated'
--     AND table_name IN ('trips', 'users', 'driver_locations')
--   ORDER BY table_name;
--
--   SELECT tablename, policyname, cmd, qual
--   FROM pg_policies
--   WHERE schemaname = 'public'
--     AND tablename IN ('trips', 'users', 'driver_locations')
--   ORDER BY tablename;
-- ================================================================
