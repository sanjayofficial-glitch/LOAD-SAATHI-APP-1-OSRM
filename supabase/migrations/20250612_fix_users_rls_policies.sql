-- ================================================================
-- LOADSAATHI — Fix Missing RLS Policies on `users` table
-- Date: 2025-06-12
-- Issue: Users table only had a SELECT policy, missing INSERT/UPDATE/DELETE
-- This caused ChooseRole.tsx to fail with RLS violation when trying
-- to create or update a user's profile after Clerk authentication.
-- ================================================================
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard/project/aejvxilhydyfbwkhjpdt/sql/new
-- ================================================================

-- ================================================================
-- SECTION 1: MISSING INSERT/UPDATE/DELETE POLICIES FOR users
-- ================================================================

-- Allow authenticated users to create their own profile
-- This is needed by ChooseRole.tsx when a new user picks their role
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = id);

-- Allow authenticated users to update their own profile
-- This is needed by ChooseRole.tsx when re-selecting role,
-- and by Profile.tsx for profile updates
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id);

-- Allow authenticated users to delete their own profile
CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE TO authenticated
  USING (auth.uid()::text = id);

-- ================================================================
-- SECTION 2: FIX SELECT POLICY — allow other auth users to read
--            names for JOINs in trip/shipment listings
-- ================================================================

-- Drop the existing restrictive policy (can only see own profile)
DROP POLICY IF EXISTS "Users can see own profile" ON public.users;

-- Create a permissive read policy (needed for JOINs to show names)
-- Still restricted to authenticated users (not public)
CREATE POLICY "Authenticated users can read all users" ON public.users
  FOR SELECT TO authenticated
  USING (true);

-- ================================================================
-- VERIFICATION QUERIES (run separately to confirm)
-- ================================================================
-- Check all policies on users table:
--   SELECT tablename, policyname, permissive, cmd, qual
--   FROM pg_policies WHERE tablename = 'users'
--   ORDER BY policyname;
-- ================================================================
