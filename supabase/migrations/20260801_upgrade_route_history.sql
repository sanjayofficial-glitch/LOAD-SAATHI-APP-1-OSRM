-- =============================================================
-- Upgrade get_route_history() to return median/P25/P75/IQR
-- Backward compatible: existing callers still get price_per_tonne, weight_tonnes, created_at
-- New aggregated fields are nullable (null on all rows except the first)
-- =============================================================

DROP FUNCTION IF EXISTS public.get_route_history(text, text);

CREATE OR REPLACE FUNCTION public.get_route_history(
  p_origin TEXT,
  p_dest TEXT
)
RETURNS TABLE(
  price_per_tonne NUMERIC,
  weight_tonnes NUMERIC,
  created_at TIMESTAMPTZ,
  median_price NUMERIC,
  p25_price NUMERIC,
  p75_price NUMERIC,
  iqr_price NUMERIC,
  record_count BIGINT
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_prices NUMERIC[];
  v_count BIGINT;
  v_median NUMERIC;
  v_p25 NUMERIC;
  v_p75 NUMERIC;
  v_iqr NUMERIC;
  v_first_id uuid;
BEGIN
  -- Collect sorted prices
  SELECT ARRAY_AGG(ph.price_per_tonne ORDER BY ph.price_per_tonne), COUNT(*)
  INTO v_prices, v_count
  FROM public.price_history ph
  WHERE ph.origin_city = p_origin
    AND ph.destination_city = p_dest;

  v_count := COALESCE(v_count, 0);

  IF v_count = 0 THEN
    RETURN QUERY
    SELECT NULL::NUMERIC, NULL::NUMERIC, NULL::TIMESTAMPTZ,
           NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, 0::BIGINT
    WHERE false;
    RETURN;
  END IF;

  -- Median
  IF v_count % 2 = 0 THEN
    v_median := (v_prices[v_count / 2] + v_prices[v_count / 2 + 1]) / 2;
  ELSE
    v_median := v_prices[(v_count + 1) / 2];
  END IF;

  -- P25 and P75
  v_p25 := v_prices[GREATEST(1, v_count / 4)];
  v_p75 := v_prices[LEAST(v_count, (v_count * 3) / 4)];
  v_iqr := v_p75 - v_p25;

  -- Get the most recent row ID to attach stats to
  SELECT ph.id INTO v_first_id
  FROM public.price_history ph
  WHERE ph.origin_city = p_origin AND ph.destination_city = p_dest
  ORDER BY ph.created_at DESC LIMIT 1;

  -- Return raw rows + stats on the most recent row only
  RETURN QUERY
  SELECT ph.price_per_tonne, ph.weight_tonnes, ph.created_at,
         CASE WHEN ph.id = v_first_id THEN v_median ELSE NULL END,
         CASE WHEN ph.id = v_first_id THEN v_p25 ELSE NULL END,
         CASE WHEN ph.id = v_first_id THEN v_p75 ELSE NULL END,
         CASE WHEN ph.id = v_first_id THEN v_iqr ELSE NULL END,
         v_count
  FROM public.price_history ph
  WHERE ph.origin_city = p_origin
    AND ph.destination_city = p_dest
  ORDER BY ph.created_at DESC
  LIMIT 100;
END;
$$;


-- =============================================================
-- Corridor average RPC: get avg price for a state-pair corridor
-- Used as fallback when exact route has no history
-- =============================================================

CREATE OR REPLACE FUNCTION public.get_corridor_average(
  p_origin_state TEXT,
  p_dest_state TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_avg NUMERIC;
BEGIN
  SELECT AVG(ph.price_per_tonne) INTO v_avg
  FROM public.price_history ph
  WHERE ph.origin_state = p_origin_state
    AND ph.destination_state = p_dest_state;

  RETURN v_avg;
END;
$$;
