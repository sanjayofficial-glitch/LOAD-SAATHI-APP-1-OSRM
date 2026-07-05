-- Migration: Standardize RLS auth expressions for Clerk integration
-- Problem: credit_scores migration (20260702) uses auth.uid()::text while
-- the canonical schema uses auth.jwt()->>'sub'. For Clerk JWTs, auth.jwt()->>'sub' is correct.
-- Fix: Drop and recreate credit_scores RLS policies with correct auth expression.

-- ===================== CREDIT_SCORES =====================
-- Drop existing policies that use auth.uid()::text
DROP POLICY IF EXISTS "Users can view own credit scores" ON public.credit_scores;
DROP POLICY IF EXISTS "System can insert credit scores" ON public.credit_scores;

-- Recreate with correct Clerk JWT auth
CREATE POLICY "Users can view own credit scores" ON public.credit_scores
  FOR SELECT TO authenticated USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "System can insert credit scores" ON public.credit_scores
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = user_id);

-- Also fix: Ensure notification INSERT policy restricts to self-only
-- (The canonical final-schema.sql already has this, but ensure it's applied)
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;
CREATE POLICY "Users can create own notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = user_id);
