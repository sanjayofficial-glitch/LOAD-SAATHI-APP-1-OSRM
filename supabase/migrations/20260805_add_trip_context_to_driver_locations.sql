-- Migration: add_trip_context_to_driver_locations
-- Purpose: Extend driver_locations with trip context for the live map feature
-- Date: 2026-08-05

-- Add trip context columns to driver_locations
ALTER TABLE driver_locations ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id);
ALTER TABLE driver_locations ADD COLUMN IF NOT EXISTS origin_city TEXT;
ALTER TABLE driver_locations ADD COLUMN IF NOT EXISTS destination_city TEXT;
ALTER TABLE driver_locations ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
ALTER TABLE driver_locations ADD COLUMN IF NOT EXISTS available_capacity_tonnes NUMERIC;
ALTER TABLE driver_locations ADD COLUMN IF NOT EXISTS is_sharing BOOLEAN DEFAULT TRUE;
ALTER TABLE driver_locations ADD COLUMN IF NOT EXISTS trip_status TEXT DEFAULT 'active';
ALTER TABLE driver_locations ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- Index for efficient queries (last 5 min, active drivers)
CREATE INDEX IF NOT EXISTS idx_driver_locations_last_seen ON driver_locations (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_locations_trip ON driver_locations (trip_id) WHERE trip_id IS NOT NULL;

-- New table: shipper load demand (for heatmap on trucker's map)
CREATE TABLE IF NOT EXISTS load_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id TEXT NOT NULL REFERENCES users(id),
  shipment_id UUID REFERENCES shipments(id),
  origin_city TEXT NOT NULL,
  dest_city TEXT NOT NULL,
  origin_lat NUMERIC,
  origin_lng NUMERIC,
  dest_lat NUMERIC,
  dest_lng NUMERIC,
  weight_tonnes NUMERIC,
  budget_per_tonne NUMERIC,
  goods_description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for load_locations
ALTER TABLE load_locations ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read load locations (for map display)
CREATE POLICY "Anyone can read load_locations"
  ON load_locations FOR SELECT
  TO authenticated
  USING (true);

-- Shipper can insert own load (uses Clerk JWT sub claim, not auth.uid())
CREATE POLICY "Shipper can insert own load"
  ON load_locations FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = shipper_id);

-- Shipper can update own load
CREATE POLICY "Shipper can update own load"
  ON load_locations FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'sub'::text) = shipper_id)
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = shipper_id);

-- Index for active loads query
CREATE INDEX IF NOT EXISTS idx_load_locations_status ON load_locations (status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_load_locations_shipper ON load_locations (shipper_id);
