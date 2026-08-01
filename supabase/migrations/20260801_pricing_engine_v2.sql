-- =============================================================
-- Pricing Engine V2: Configurable rates, corridors, seasons
-- =============================================================

-- 1. Vehicle rate configuration
CREATE TABLE IF NOT EXISTS public.pricing_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_type text NOT NULL UNIQUE,
  rate_per_km numeric NOT NULL,
  min_price numeric NOT NULL,
  max_price numeric NOT NULL,
  base_capacity_tonnes numeric,
  updated_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.pricing_config (vehicle_type, rate_per_km, min_price, max_price, base_capacity_tonnes) VALUES
('mini_truck', 14, 1800, 3500, 2),
('pickup', 16, 2000, 4000, 3),
('14ft', 18, 2200, 4500, 5),
('17ft', 20, 2500, 5000, 8),
('22ft', 22, 2800, 5500, 12),
('container', 25, 3000, 6000, 16),
('trailer', 28, 3200, 7000, 25)
ON CONFLICT (vehicle_type) DO NOTHING;

-- 2. Corridor multipliers (state-pair based)
CREATE TABLE IF NOT EXISTS public.corridor_multipliers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_state text NOT NULL,
  destination_state text NOT NULL,
  multiplier numeric NOT NULL DEFAULT 1.0,
  note text,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(origin_state, destination_state)
);

INSERT INTO public.corridor_multipliers (origin_state, destination_state, multiplier, note) VALUES
('Odisha', 'Jharkhand', 1.05, 'High-demand industrial corridor'),
('Jharkhand', 'West Bengal', 1.08, 'Mining belt route'),
('West Bengal', 'Odisha', 1.03, 'Return corridor'),
('Odisha', 'West Bengal', 1.06, 'Steel belt route'),
('Jharkhand', 'Odisha', 1.04, 'Reverse mining route'),
('Bihar', 'West Bengal', 1.02, 'Agricultural corridor'),
('Chhattisgarh', 'Odisha', 1.01, 'Adjacent state'),
('Delhi', 'Maharashtra', 1.10, 'Long-haul premium'),
('Maharashtra', 'Delhi', 1.08, 'Return long-haul'),
('Karnataka', 'Tamil Nadu', 1.03, 'South corridor'),
('Gujarat', 'Maharashtra', 1.04, 'Western industrial')
ON CONFLICT (origin_state, destination_state) DO NOTHING;

-- 3. Seasonal multipliers (month-based)
CREATE TABLE IF NOT EXISTS public.seasonal_multipliers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  month int NOT NULL CHECK (month BETWEEN 1 AND 12),
  multiplier numeric NOT NULL DEFAULT 1.0,
  note text,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(month)
);

INSERT INTO public.seasonal_multipliers (month, multiplier, note) VALUES
(1, 1.02, 'Post-holiday resumption'),
(2, 0.98, 'Pre-fiscal year end'),
(3, 1.00, 'Normal'),
(4, 0.97, 'Pre-monsoon lull'),
(5, 0.96, 'Low season'),
(6, 1.08, 'Monsoon disruption premium'),
(7, 1.10, 'Peak monsoon'),
(8, 1.07, 'Late monsoon'),
(9, 1.03, 'Post-monsoon recovery'),
(10, 1.05, 'Festival season demand'),
(11, 1.04, 'Year-end rush'),
(12, 1.06, 'Year-end + fiscal closing')
ON CONFLICT (month) DO NOTHING;

-- 4. Feature flags
CREATE TABLE IF NOT EXISTS public.pricing_flags (
  flag_name text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.pricing_flags (flag_name, enabled) VALUES
('enable_ai', true),
('enable_history', true),
('enable_corridor', true),
('enable_config', true),
('enable_seasonal', true),
('enable_blending', true)
ON CONFLICT (flag_name) DO NOTHING;

-- 5. RLS policies
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corridor_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access pricing_config" ON public.pricing_config;
CREATE POLICY "Service role full access pricing_config" ON public.pricing_config FOR ALL USING (true);

DROP POLICY IF EXISTS "Authenticated can read pricing_config" ON public.pricing_config;
CREATE POLICY "Authenticated can read pricing_config" ON public.pricing_config
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role full access corridor_multipliers" ON public.corridor_multipliers;
CREATE POLICY "Service role full access corridor_multipliers" ON public.corridor_multipliers FOR ALL USING (true);

DROP POLICY IF EXISTS "Authenticated can read corridor_multipliers" ON public.corridor_multipliers;
CREATE POLICY "Authenticated can read corridor_multipliers" ON public.corridor_multipliers
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role full access seasonal_multipliers" ON public.seasonal_multipliers;
CREATE POLICY "Service role full access seasonal_multipliers" ON public.seasonal_multipliers FOR ALL USING (true);

DROP POLICY IF EXISTS "Authenticated can read seasonal_multipliers" ON public.seasonal_multipliers;
CREATE POLICY "Authenticated can read seasonal_multipliers" ON public.seasonal_multipliers
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role full access pricing_flags" ON public.pricing_flags;
CREATE POLICY "Service role full access pricing_flags" ON public.pricing_flags FOR ALL USING (true);

DROP POLICY IF EXISTS "Authenticated can read pricing_flags" ON public.pricing_flags;
CREATE POLICY "Authenticated can read pricing_flags" ON public.pricing_flags
  FOR SELECT TO authenticated USING (true);
