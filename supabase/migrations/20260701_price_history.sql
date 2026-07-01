-- Price history table for AI price prediction training data
CREATE TABLE IF NOT EXISTS public.price_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_city text NOT NULL,
  destination_city text NOT NULL,
  origin_state text,
  destination_state text,
  weight_tonnes numeric NOT NULL,
  price_per_tonne numeric NOT NULL,
  vehicle_type text,
  user_id text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('trucker', 'shipper')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_route ON public.price_history(origin_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON public.price_history(created_at);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read price history" ON public.price_history;
CREATE POLICY "Anyone can read price history" ON public.price_history
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert own price history" ON public.price_history;
CREATE POLICY "Users can insert own price history" ON public.price_history
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = user_id);
