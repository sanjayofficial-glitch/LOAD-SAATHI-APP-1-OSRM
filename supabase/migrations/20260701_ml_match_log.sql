-- ML match training data log
CREATE TABLE IF NOT EXISTS public.ml_match_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE SET NULL,
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  origin_match_score numeric,
  destination_match_score numeric,
  proximity_score numeric,
  capacity_score numeric,
  price_score numeric,
  date_score numeric,
  rating_score numeric,
  total_deterministic_score numeric,
  ai_score numeric,
  ai_reasoning text,
  outcome text CHECK (outcome IN ('offer_sent', 'accepted', 'declined', 'ignored', 'request_sent')),
  user_id text,
  origin_city text,
  destination_city text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ml_match_log_outcome ON public.ml_match_log(outcome);
CREATE INDEX IF NOT EXISTS idx_ml_match_log_created_at ON public.ml_match_log(created_at);
CREATE INDEX IF NOT EXISTS idx_ml_match_log_route ON public.ml_match_log(origin_city, destination_city);

ALTER TABLE public.ml_match_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read ml_match_log analytics" ON public.ml_match_log;
CREATE POLICY "Anyone can read ml_match_log analytics" ON public.ml_match_log
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert ml_match_log" ON public.ml_match_log;
CREATE POLICY "Users can insert ml_match_log" ON public.ml_match_log
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = user_id);
