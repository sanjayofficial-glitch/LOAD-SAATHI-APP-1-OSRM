-- Add in_transit and delivered statuses to trips table
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_status_check;
ALTER TABLE public.trips ADD CONSTRAINT trips_status_check
  CHECK (status = ANY (ARRAY['active'::text, 'in_transit'::text, 'delivered'::text, 'completed'::text, 'cancelled'::text]));
