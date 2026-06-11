-- ================================================================
-- LOADSAATHI — Schema Optimization Migration
-- Date: 2025-06-11
-- Purpose: Fix all identified schema issues
-- Your database uses `users` table (not `profiles`). This migration
-- is adapted for the `users` table schema from final-schema.sql.
-- ================================================================
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard/project/<YOUR-PROJECT>/sql/new
-- ================================================================

-- ================================================================
-- SECTION 1: EXTENSIONS
-- ================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ================================================================
-- SECTION 2: ADD updated_at TO users + TRIGGER FUNCTION
-- ================================================================
-- The users table is missing updated_at entirely. Also create the
-- generic trigger function for all tables that have updated_at.

-- Add updated_at to users (doesn't have it in final-schema.sql)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create the auto-update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users
DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to trips (already has updated_at column)
DROP TRIGGER IF EXISTS set_trips_updated_at ON trips;
CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to shipment_requests (already has updated_at column)
DROP TRIGGER IF EXISTS set_shipment_requests_updated_at ON shipment_requests;
CREATE TRIGGER set_shipment_requests_updated_at
  BEFORE UPDATE ON shipment_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SECTION 3: ADD MISSING updated_at COLUMNS TO 5 TABLES
-- ================================================================

ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add triggers for these new columns
DROP TRIGGER IF EXISTS set_shipments_updated_at ON shipments;
CREATE TRIGGER set_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_requests_updated_at ON requests;
CREATE TRIGGER set_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_reviews_updated_at ON reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_messages_updated_at ON messages;
CREATE TRIGGER set_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_notifications_updated_at ON notifications;
CREATE TRIGGER set_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SECTION 4: ADD origin_state / destination_state TO SHIPMENTS
-- ================================================================
-- Trips already has these via migration 20250923.
-- Adding to shipments for consistent state-level matching.

ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS origin_state text,
  ADD COLUMN IF NOT EXISTS destination_state text;

-- ================================================================
-- SECTION 5: ADD MISSING NOTIFICATIONS COLUMNS
-- ================================================================
-- final-schema.sql doesn't have type/title/action_url on notifications.
-- Migration 20250605 adds these, but just in case they're missing:

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS action_url text;

-- ================================================================
-- SECTION 6: COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ================================================================

-- Trips: trucker dashboard (WHERE trucker_id = X AND status = Y)
CREATE INDEX IF NOT EXISTS idx_trips_trucker_status
  ON trips(trucker_id, status);

-- Trips: browse page (WHERE status = 'active' ORDER BY departure_date)
CREATE INDEX IF NOT EXISTS idx_trips_status_departure
  ON trips(status, departure_date);

-- Trips: route search (WHERE origin_city = X AND destination_city = Y)
CREATE INDEX IF NOT EXISTS idx_trips_route
  ON trips(origin_city, destination_city);

-- Shipments: shipper dashboard (WHERE shipper_id = X AND status = Y)
CREATE INDEX IF NOT EXISTS idx_shipments_shipper_status
  ON shipments(shipper_id, status);

-- Shipments: browse page (WHERE status = 'pending' ORDER BY departure_date)
CREATE INDEX IF NOT EXISTS idx_shipments_status_departure
  ON shipments(status, departure_date);

-- Requests: check inbox (WHERE receiver_id = X AND status = Y)
CREATE INDEX IF NOT EXISTS idx_requests_receiver_status
  ON requests(receiver_id, status);

-- Shipment requests: check offers (WHERE shipper_id = X AND status = Y)
CREATE INDEX IF NOT EXISTS idx_shipment_requests_shipper_status
  ON shipment_requests(shipper_id, status);

-- Messages: conversation view (WHERE (sender_id = X AND recipient_id = Y) ORDER BY created_at)
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(sender_id, recipient_id, created_at);

-- ================================================================
-- SECTION 7: TRIGRAM INDEXES FOR CITY SEARCH
-- ================================================================
-- The app uses ILIKE '%city%' for city search. At scale, this is
-- a full table scan without trigram indexes.

CREATE INDEX IF NOT EXISTS idx_trips_origin_city_trgm
  ON trips USING gin (origin_city gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_trips_destination_city_trgm
  ON trips USING gin (destination_city gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_shipments_origin_city_trgm
  ON shipments USING gin (origin_city gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_shipments_destination_city_trgm
  ON shipments USING gin (destination_city gin_trgm_ops);

-- ================================================================
-- SECTION 8: ON DELETE CASCADE — ENTITY CHAIN
-- ================================================================

-- Trips → Requests (if trip deleted, its requests are meaningless)
ALTER TABLE requests
  DROP CONSTRAINT IF EXISTS requests_trip_id_fkey,
  ADD CONSTRAINT requests_trip_id_fkey
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE;

-- Trips → Reviews (if trip deleted, its reviews are too)
ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_trip_id_fkey,
  ADD CONSTRAINT reviews_trip_id_fkey
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE;

-- Trips → Notifications (notifications can survive with null ref)
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_related_trip_id_fkey,
  ADD CONSTRAINT notifications_related_trip_id_fkey
    FOREIGN KEY (related_trip_id) REFERENCES trips(id) ON DELETE SET NULL;

-- Shipments → Requests (requests can survive with null ref)
ALTER TABLE requests
  DROP CONSTRAINT IF EXISTS requests_shipment_id_fkey,
  ADD CONSTRAINT requests_shipment_id_fkey
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE SET NULL;

-- Shipments → Shipment requests (if shipment deleted, offers are too)
ALTER TABLE shipment_requests
  DROP CONSTRAINT IF EXISTS shipment_requests_shipment_id_fkey,
  ADD CONSTRAINT shipment_requests_shipment_id_fkey
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE;

-- Shipment requests → Notifications
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_related_shipment_request_id_fkey,
  ADD CONSTRAINT notifications_related_shipment_request_id_fkey
    FOREIGN KEY (related_shipment_request_id) REFERENCES shipment_requests(id) ON DELETE SET NULL;

-- Shipment requests → Messages
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_shipment_request_id_fkey,
  ADD CONSTRAINT messages_shipment_request_id_fkey
    FOREIGN KEY (shipment_request_id) REFERENCES shipment_requests(id) ON DELETE SET NULL;

-- Requests → Messages
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_request_id_fkey,
  ADD CONSTRAINT messages_request_id_fkey
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL;

-- ================================================================
-- SECTION 9: MAKE reviews.trucker_id/shipper_id NULLABLE
-- ================================================================
-- If a user is deleted, their reviews should survive without
-- breaking FK constraints.

ALTER TABLE reviews
  ALTER COLUMN trucker_id DROP NOT NULL,
  ALTER COLUMN shipper_id DROP NOT NULL;

ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_trucker_id_fkey,
  ADD CONSTRAINT reviews_trucker_id_fkey
    FOREIGN KEY (trucker_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_shipper_id_fkey,
  ADD CONSTRAINT reviews_shipper_id_fkey
    FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE SET NULL;

-- ================================================================
-- SECTION 10: ON DELETE CASCADE/SET NULL ON USER-FACING FKs
-- ================================================================
-- If a user is deleted, their owned data should cascade.
-- References TO other users should SET NULL.

-- Users → Trips (trucker's trips deleted with their account)
ALTER TABLE trips
  DROP CONSTRAINT IF EXISTS trips_trucker_id_fkey,
  ADD CONSTRAINT trips_trucker_id_fkey
    FOREIGN KEY (trucker_id) REFERENCES users(id) ON DELETE CASCADE;

-- Users → Shipments (shipper's shipments deleted with their account)
ALTER TABLE shipments
  DROP CONSTRAINT IF EXISTS shipments_shipper_id_fkey,
  ADD CONSTRAINT shipments_shipper_id_fkey
    FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE CASCADE;

-- Users → Requests (null the shipper/receiver references)
ALTER TABLE requests
  DROP CONSTRAINT IF EXISTS requests_shipper_id_fkey,
  ADD CONSTRAINT requests_shipper_id_fkey
    FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE requests
  DROP CONSTRAINT IF EXISTS requests_receiver_id_fkey,
  ADD CONSTRAINT requests_receiver_id_fkey
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL;

-- Users → Shipment requests (null the trucker/shipper references)
ALTER TABLE shipment_requests
  DROP CONSTRAINT IF EXISTS shipment_requests_trucker_id_fkey,
  ADD CONSTRAINT shipment_requests_trucker_id_fkey
    FOREIGN KEY (trucker_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE shipment_requests
  DROP CONSTRAINT IF EXISTS shipment_requests_shipper_id_fkey,
  ADD CONSTRAINT shipment_requests_shipper_id_fkey
    FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE SET NULL;

-- Users → Messages (null sender/recipient)
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
  ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey,
  ADD CONSTRAINT messages_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL;

-- Users → Notifications (delete notifications for deleted user)
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
  ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ================================================================
-- SECTION 11: ADD notifications.type INDEX + UNREAD INDEX
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Partial index for unread notifications (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read) WHERE is_read = false;

-- ================================================================
-- SECTION 12: RLS POLICY FIXES
-- ================================================================

-- 12a. USERS: Add a broader SELECT policy so other authenticated users
--     can read names for JOINs in trip/shipment listings.
--     WARNING: This exposes user emails to all authenticated users.
--     If that's a concern, use a VIEW that only exposes non-sensitive fields.

-- Drop the existing restrictive policy (can only see own profile)
DROP POLICY IF EXISTS "Users can see own profile" ON users;

-- Create a permissive read policy (needed for JOINs to show names)
CREATE POLICY "Authenticated users can read all users" ON users
  FOR SELECT TO authenticated USING (true);

-- NOTE: If you want to keep emails private, create a view instead:
-- CREATE VIEW public.user_profiles AS
--   SELECT id, full_name, user_type, rating, total_trips, city, phone
--   FROM public.users;
-- Then grant SELECT on the view to authenticated users.

-- 12b. SHIPMENTS: Fix the policy so shippers can see their own
--     non-pending shipments (matched/completed).
--     Current: WHERE status = 'pending'
--     Fixed:   WHERE status = 'pending' OR auth.uid()::text = shipper_id

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Anyone can see pending shipments" ON shipments;

-- Create the corrected policy
CREATE POLICY "Anyone can see pending shipments" ON shipments
  FOR SELECT TO authenticated USING (status = 'pending' OR auth.uid()::text = shipper_id);

-- 12c. TRUCKERS: Allow truckers to accept/decline booking requests
--     (update status on requests where they are the receiver)

DROP POLICY IF EXISTS "Truckers can update received requests" ON requests;
CREATE POLICY "Truckers can update received requests" ON requests
  FOR UPDATE TO authenticated USING (auth.uid()::text = receiver_id);

-- 12d. SHIPPERS: Allow shippers to accept/decline trucker offers
--     (update status on shipment_requests where they own the shipment)

DROP POLICY IF EXISTS "Shippers can update received shipment requests" ON shipment_requests;
CREATE POLICY "Shippers can update received shipment requests" ON shipment_requests
  FOR UPDATE TO authenticated USING (
    shipment_id IN (SELECT id FROM shipments WHERE shipper_id = auth.uid()::text)
  );

-- ================================================================
-- VERIFICATION QUERIES (run separately to confirm)
-- ================================================================
-- Check triggers:
--   SELECT event_object_table, trigger_name FROM information_schema.triggers WHERE trigger_name LIKE 'set_%';
--
-- Check indexes:
--   SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
--
-- Check CASCADE FKs:
--   SELECT tc.table_name, tc.constraint_name, rc.delete_rule
--   FROM information_schema.table_constraints tc
--   JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
--   WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
--   ORDER BY tc.table_name;
--
-- Check RLS policies:
--   SELECT tablename, policyname, permissive, cmd, qual
--   FROM pg_policies WHERE schemaname = 'public'
--   ORDER BY tablename, policyname;

-- ================================================================
-- ROLLBACK INSTRUCTIONS
-- ================================================================
-- 1. Drop all triggers: DROP TRIGGER IF EXISTS set_<table>_updated_at ON <table>;
-- 2. Drop function: DROP FUNCTION IF EXISTS update_updated_at_column();
-- 3. Drop columns: ALTER TABLE <table> DROP COLUMN IF EXISTS updated_at;
-- 4. Drop indexes: DROP INDEX IF EXISTS <index_name>;
-- 5. Restore original FK constraints (drop cascade version, re-add without cascade)
-- 6. Restore RLS policies (re-create restrictive policies, drop permissive ones)
-- ================================================================
