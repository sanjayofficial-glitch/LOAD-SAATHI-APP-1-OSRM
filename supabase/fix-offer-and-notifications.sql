-- FIX 1: Notifications cross-user RLS
-- Problem: Truckers can't create notifications for shippers because
-- auth.jwt()->>'sub' is the trucker's ID, not the shipper's.
-- Fix: Allow any authenticated user to insert notifications for any user.
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;

CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'sub' IS NOT NULL);


-- FIX 2: shipment_requests cross-user SELECT
-- Problem: Shipper needs to see all pending shipment_requests for their shipments,
-- not just ones where they are trucker_id.
-- (Only if this is an issue — check existing policies first)
-- The current SELECT policy allows viewing if JWT sub = trucker_id OR JWT sub = shipper_id.
-- This should be fine. Keep as-is.


-- DIAGNOSTIC: Verify Clerk JWT is working for inserts
-- Run this AFTER signing in as a trucker and attempting to send an offer.
-- Check the browser console for [submitOffer] Full error: output.
-- If you see "new row violates row-level security policy", the JWT sub
-- doesn't match the trucker_id. Verify Clerk JWT template 'supabase'
-- includes the user ID in the 'sub' claim.
