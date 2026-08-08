-- ================================================================
-- LOADSAATHI — Fix live location feature (realtime + upsert)
-- Date: 2026-08-08
-- Purpose:
--   1. Add `driver_locations` and `load_locations` to the
--      `supabase_realtime` publication so postgres_changes events
--      actually fire. Without this, the live map / trip tracking
--      subscriptions receive NOTHING (the tables were created by
--      migrations that never altered the publication).
--   2. Add a UNIQUE(driver_id) constraint so the app's upserts with
--      ON CONFLICT (driver_id) succeed. Currently they fail with
--      "there is no unique or exclusion constraint matching the
--      ON CONFLICT specification" (the table only has a PK on id).
--
-- Run this once in your Supabase SQL Editor:
--   https://supabase.com/dashboard/project/<YOUR-PROJECT>/sql/new
--
-- Safe to re-run (idempotent).
-- ================================================================

-- ----------------------------------------------------------------
-- 1) Realtime publication membership
-- ----------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'driver_locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'load_locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.load_locations;
  END IF;
END $$;

-- ----------------------------------------------------------------
-- 2) UNIQUE(driver_id) for ON CONFLICT (driver_id) upserts
-- ----------------------------------------------------------------
-- Dedupe existing rows first (keep the most recently updated row per
-- driver) so the constraint can be created without violating data.
DELETE FROM public.driver_locations a
USING public.driver_locations b
WHERE a.driver_id = b.driver_id
  AND (
    COALESCE(a.updated_at, 'epoch') < COALESCE(b.updated_at, 'epoch')
    OR (
      COALESCE(a.updated_at, 'epoch') = COALESCE(b.updated_at, 'epoch')
      AND a.id < b.id
    )
  );

ALTER TABLE public.driver_locations DROP CONSTRAINT IF EXISTS driver_locations_driver_id_unique;
ALTER TABLE public.driver_locations
  ADD CONSTRAINT driver_locations_driver_id_unique UNIQUE (driver_id);

-- ================================================================
-- VERIFICATION
--   SELECT pubname, tablename FROM pg_publication_tables
--   WHERE pubname = 'supabase_realtime'
--     AND tablename IN ('driver_locations', 'load_locations');
--
--   SELECT conname, conrelid::regclass
--   FROM pg_constraint
--   WHERE conname = 'driver_locations_driver_id_unique';
-- ================================================================
