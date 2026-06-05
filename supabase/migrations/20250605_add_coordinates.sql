-- PHASE 1 — Additive Database Changes
-- These are pure ADD operations. They cannot break anything.

-- Coordinates for trips (new columns, nullable, safe)
ALTER TABLE trips ADD COLUMN IF NOT EXISTS origin_lat numeric;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS origin_lng numeric;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS destination_lat numeric;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS destination_lng numeric;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS estimated_distance_km numeric;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS estimated_duration_min integer;

-- Coordinates for shipments (same, safe)
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin_lat numeric;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin_lng numeric;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS destination_lat numeric;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS destination_lng numeric;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS estimated_distance_km numeric;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS estimated_duration_min integer;

-- Extra notification fields (safe)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url text;
