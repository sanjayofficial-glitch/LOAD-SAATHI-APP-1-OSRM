-- Migration: Fix RLS for trucker trip start/deliver/complete flow
-- Run this in your Supabase SQL Editor

-- 1. Allow truckers to update shipments linked to their trips via accepted booking requests
-- This is needed when a trucker starts/delivers/completes a trip and needs to update
-- the linked shipment statuses
DROP POLICY IF EXISTS "Truckers can update linked shipments" ON public.shipments;
CREATE POLICY "Truckers can update linked shipments" ON public.shipments
  FOR UPDATE TO authenticated USING (
    id IN (
      SELECT r.shipment_id 
      FROM public.requests r 
      JOIN public.trips t ON r.trip_id = t.id 
      WHERE t.trucker_id = auth.jwt()->>'sub' 
        AND r.status = 'accepted' 
        AND r.shipment_id IS NOT NULL
    )
  );

-- 2. Allow any authenticated user to create notifications for other users
-- This is needed when a trucker sends notifications to shippers (and vice versa)
-- The notification table's user_id is the recipient, not the sender
DROP POLICY IF EXISTS "Users can create notifications for others" ON public.notifications;
CREATE POLICY "Users can create notifications for others" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);
