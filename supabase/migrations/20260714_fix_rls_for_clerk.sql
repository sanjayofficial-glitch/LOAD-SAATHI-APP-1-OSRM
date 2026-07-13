-- Migration: Fix RLS policies for Clerk JWT integration
-- Problem: trips, shipments, requests, and profiles tables use auth.uid()::text
-- in RLS policies, but the app uses Clerk JWTs where auth.jwt()->>'sub' is correct.
-- This causes INSERT/UPDATE/DELETE to fail silently for authenticated users.

-- ===================== TRIPS =====================
DROP POLICY IF EXISTS "Truckers can create trips" ON public.trips;
DROP POLICY IF EXISTS "Truckers can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Truckers can delete own trips" ON public.trips;

CREATE POLICY "Truckers can create trips" ON public.trips
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = trucker_id);

CREATE POLICY "Truckers can update own trips" ON public.trips
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = trucker_id);

CREATE POLICY "Truckers can delete own trips" ON public.trips
  FOR DELETE TO authenticated USING (auth.jwt()->>'sub' = trucker_id);

-- ===================== SHIPMENTS =====================
DROP POLICY IF EXISTS "Shippers can create shipments" ON public.shipments;
DROP POLICY IF EXISTS "Shippers can update own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Shippers can delete own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Anyone can see pending shipments" ON public.shipments;

CREATE POLICY "Anyone can see pending shipments" ON public.shipments
  FOR SELECT TO authenticated USING (status = 'pending' OR auth.jwt()->>'sub' = shipper_id);

CREATE POLICY "Shippers can create shipments" ON public.shipments
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = shipper_id);

CREATE POLICY "Shippers can update own shipments" ON public.shipments
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = shipper_id);

CREATE POLICY "Shippers can delete own shipments" ON public.shipments
  FOR DELETE TO authenticated USING (auth.jwt()->>'sub' = shipper_id);

-- ===================== REQUESTS =====================
DROP POLICY IF EXISTS "Users can view own requests" ON public.requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.requests;

CREATE POLICY "Users can view own requests" ON public.requests
  FOR SELECT TO authenticated USING (auth.jwt()->>'sub' = shipper_id OR auth.jwt()->>'sub' = receiver_id);

CREATE POLICY "Users can create requests" ON public.requests
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = shipper_id);

CREATE POLICY "Users can update own requests" ON public.requests
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = shipper_id OR auth.jwt()->>'sub' = receiver_id);

-- ===================== SHIPMENT_REQUESTS =====================
DROP POLICY IF EXISTS "Users can view shipment requests" ON public.shipment_requests;
DROP POLICY IF EXISTS "Truckers can create shipment requests" ON public.shipment_requests;
DROP POLICY IF EXISTS "Users can update shipment requests" ON public.shipment_requests;

CREATE POLICY "Users can view shipment requests" ON public.shipment_requests
  FOR SELECT TO authenticated USING (auth.jwt()->>'sub' = trucker_id OR auth.jwt()->>'sub' = shipper_id);

CREATE POLICY "Truckers can create shipment requests" ON public.shipment_requests
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = trucker_id);

CREATE POLICY "Users can update shipment requests" ON public.shipment_requests
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = trucker_id OR auth.jwt()->>'sub' = shipper_id);

-- ===================== REVIEWS =====================
DROP POLICY IF EXISTS "Users can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

CREATE POLICY "Users can view reviews" ON public.reviews
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = shipper_id);

-- ===================== MESSAGES =====================
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;

CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT TO authenticated USING (auth.jwt()->>'sub' = sender_id OR auth.jwt()->>'sub' = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = sender_id);

CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = recipient_id);
