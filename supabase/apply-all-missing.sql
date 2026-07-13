-- =============================================================
-- COMBINED MIGRATION: Run this ONCE in Supabase SQL Editor
-- Order matters: each section builds on the previous one.
-- =============================================================


-- =============================================================
-- SECTION 1: credit_scores table + scoring function + triggers
-- Source: 20260702_credit_scores.sql
-- =============================================================

CREATE TABLE IF NOT EXISTS public.credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 300 AND score <= 900),
  factors JSONB NOT NULL DEFAULT '{}',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id ON public.credit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_score ON public.credit_scores(score);

CREATE OR REPLACE FUNCTION public.calculate_credit_score(p_user_id TEXT)
RETURNS TABLE(score INTEGER, factors JSONB)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_type TEXT;
  v_total_trips INTEGER := 0;
  v_completed_trips INTEGER := 0;
  v_cancelled_trips INTEGER := 0;
  v_terminated_trips INTEGER := 0;
  v_delivered_trips INTEGER := 0;
  v_completion_rate NUMERIC := 0;
  v_avg_rating NUMERIC := 0;
  v_review_count INTEGER := 0;
  v_days_active INTEGER := 0;
  v_message_count INTEGER := 0;
  v_accepted_requests INTEGER := 0;
  v_total_requests INTEGER := 0;

  v_completion_score NUMERIC := 0;
  v_reliability_score NUMERIC := 0;
  v_communication_score NUMERIC := 0;
  v_review_score NUMERIC := 0;
  v_tenure_score NUMERIC := 0;
  v_total_score NUMERIC := 0;
  v_factors JSONB;
BEGIN
  SELECT user_type INTO v_user_type
  FROM public.users
  WHERE id = p_user_id;

  IF v_user_type = 'trucker' THEN
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed'),
      COUNT(*) FILTER (WHERE status = 'cancelled'),
      COUNT(*) FILTER (WHERE status IN ('completed', 'delivered', 'in_transit', 'cancelled')),
      COUNT(*) FILTER (WHERE status IN ('delivered', 'completed'))
    INTO v_completed_trips, v_cancelled_trips, v_terminated_trips, v_delivered_trips
    FROM public.trips
    WHERE trucker_id = p_user_id;

    SELECT COALESCE(AVG(rating), 0), COUNT(*)
    INTO v_avg_rating, v_review_count
    FROM public.reviews
    WHERE trucker_id = p_user_id AND reviewer_role = 'shipper';

    SELECT COUNT(*) INTO v_message_count
    FROM public.messages
    WHERE sender_id = p_user_id;

    SELECT
      COALESCE(COUNT(*) FILTER (WHERE status = 'accepted'), 0),
      COUNT(*)
    INTO v_accepted_requests, v_total_requests
    FROM public.requests
    WHERE trucker_id = p_user_id;

  ELSIF v_user_type = 'shipper' THEN
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed'),
      COUNT(*) FILTER (WHERE status = 'cancelled'),
      COUNT(*) FILTER (WHERE status IN ('completed', 'in_transit', 'delivered', 'cancelled')),
      COUNT(*) FILTER (WHERE status IN ('delivered', 'completed'))
    INTO v_completed_trips, v_cancelled_trips, v_terminated_trips, v_delivered_trips
    FROM public.shipments
    WHERE shipper_id = p_user_id;

    SELECT COALESCE(AVG(rating), 0), COUNT(*)
    INTO v_avg_rating, v_review_count
    FROM public.reviews
    WHERE shipper_id = p_user_id AND reviewer_role = 'trucker';

    SELECT COUNT(*) INTO v_message_count
    FROM public.messages
    WHERE sender_id = p_user_id;

    SELECT
      COALESCE(COUNT(*) FILTER (WHERE status = 'accepted'), 0),
      COUNT(*)
    INTO v_accepted_requests, v_total_requests
    FROM public.shipment_requests
    WHERE shipper_id = p_user_id;
  END IF;

  SELECT COALESCE(EXTRACT(DAY FROM now() - created_at)::INTEGER, 0)
  INTO v_days_active
  FROM public.users
  WHERE id = p_user_id;

  -- 1. Completion Rate (max 270 = 30%)
  IF v_terminated_trips > 0 THEN
    v_completion_rate := v_completed_trips::NUMERIC / v_terminated_trips;
    v_completion_score := 270.0 * v_completion_rate;
  ELSE
    v_completion_score := 135.0;
  END IF;

  -- 2. Reliability (max 225 = 25%)
  IF v_terminated_trips > 0 THEN
    v_reliability_score := 225.0 * (v_delivered_trips::NUMERIC / v_terminated_trips);
  ELSE
    v_reliability_score := 112.5;
  END IF;

  -- 3. Communication (max 135 = 15%)
  IF v_days_active > 0 THEN
    v_communication_score := LEAST(135.0, (v_message_count::NUMERIC / GREATEST(v_days_active, 1)) * 7.5)
      + LEAST(45.0, COALESCE(v_accepted_requests::NUMERIC / NULLIF(v_total_requests, 0), 0.5) * 45.0);
  ELSE
    v_communication_score := 90.0;
  END IF;
  v_communication_score := LEAST(135.0, v_communication_score);

  -- 4. Reviews (max 180 = 20%)
  IF v_review_count > 0 THEN
    v_review_score := (v_avg_rating / 5.0) * 180.0;
  ELSE
    v_review_score := 90.0;
  END IF;

  -- 5. Tenure & Volume (max 90 = 10%)
  v_tenure_score := LEAST(45.0, (v_days_active::NUMERIC / 365.0) * 45.0)
    + LEAST(45.0, v_completed_trips::NUMERIC * 5.0);

  v_total_score := 300 + v_completion_score + v_reliability_score
    + v_communication_score + v_review_score + v_tenure_score;

  v_total_score := GREATEST(300, LEAST(900, v_total_score));

  v_factors := jsonb_build_object(
    'completion', jsonb_build_object(
      'score', ROUND(v_completion_score)::INTEGER,
      'max', 270,
      'rate', ROUND(v_completion_rate::NUMERIC, 2),
      'completed', v_completed_trips,
      'cancelled', v_cancelled_trips
    ),
    'reliability', jsonb_build_object(
      'score', ROUND(v_reliability_score)::INTEGER,
      'max', 225,
      'delivered', v_delivered_trips,
      'terminated', v_terminated_trips
    ),
    'communication', jsonb_build_object(
      'score', ROUND(v_communication_score)::INTEGER,
      'max', 135,
      'messagesSent', v_message_count,
      'acceptedRequests', v_accepted_requests,
      'totalRequests', v_total_requests
    ),
    'reviews', jsonb_build_object(
      'score', ROUND(v_review_score)::INTEGER,
      'max', 180,
      'averageRating', ROUND(v_avg_rating::NUMERIC, 2),
      'reviewCount', v_review_count
    ),
    'tenure', jsonb_build_object(
      'score', ROUND(v_tenure_score)::INTEGER,
      'max', 90,
      'daysActive', v_days_active,
      'completedTrips', v_completed_trips
    ),
    'tier', CASE
      WHEN v_total_score >= 750 THEN 'excellent'
      WHEN v_total_score >= 650 THEN 'good'
      WHEN v_total_score >= 550 THEN 'fair'
      WHEN v_total_score >= 450 THEN 'needs_improvement'
      ELSE 'poor'
    END
  );

  INSERT INTO public.credit_scores (user_id, score, factors, calculated_at)
  VALUES (p_user_id, ROUND(v_total_score)::INTEGER, v_factors, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    score = EXCLUDED.score,
    factors = EXCLUDED.factors,
    calculated_at = EXCLUDED.calculated_at;

  RETURN QUERY
  SELECT ROUND(v_total_score)::INTEGER AS score, v_factors AS factors;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_credit_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  affected_user_id TEXT;
BEGIN
  IF TG_TABLE_NAME = 'trips' THEN
    affected_user_id := COALESCE(NEW.trucker_id, OLD.trucker_id);
  ELSIF TG_TABLE_NAME = 'shipments' THEN
    affected_user_id := COALESCE(NEW.shipper_id, OLD.shipper_id);
  ELSIF TG_TABLE_NAME = 'reviews' THEN
    PERFORM public.calculate_credit_score(COALESCE(NEW.trucker_id, OLD.trucker_id));
    PERFORM public.calculate_credit_score(COALESCE(NEW.shipper_id, OLD.shipper_id));
    RETURN COALESCE(NEW, OLD);
  ELSIF TG_TABLE_NAME = 'requests' THEN
    affected_user_id := COALESCE(NEW.trucker_id, OLD.trucker_id);
  ELSIF TG_TABLE_NAME = 'shipment_requests' THEN
    affected_user_id := COALESCE(NEW.trucker_id, OLD.trucker_id);
  END IF;

  IF affected_user_id IS NOT NULL THEN
    PERFORM public.calculate_credit_score(affected_user_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_credit_score_trips ON public.trips;
CREATE TRIGGER trg_refresh_credit_score_trips
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.refresh_credit_score();

DROP TRIGGER IF EXISTS trg_refresh_credit_score_shipments ON public.shipments;
CREATE TRIGGER trg_refresh_credit_score_shipments
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.refresh_credit_score();

DROP TRIGGER IF EXISTS trg_refresh_credit_score_reviews ON public.reviews;
CREATE TRIGGER trg_refresh_credit_score_reviews
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_credit_score();

DROP TRIGGER IF EXISTS trg_refresh_credit_score_requests ON public.requests;
CREATE TRIGGER trg_refresh_credit_score_requests
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.refresh_credit_score();

DROP TRIGGER IF EXISTS trg_refresh_credit_score_shipment_requests ON public.shipment_requests;
CREATE TRIGGER trg_refresh_credit_score_shipment_requests
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.shipment_requests
  FOR EACH ROW EXECUTE FUNCTION public.refresh_credit_score();

ALTER TABLE public.credit_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS credit_scores_select_all ON public.credit_scores;
CREATE POLICY credit_scores_select_all
  ON public.credit_scores
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS credit_scores_insert_own ON public.credit_scores;
CREATE POLICY credit_scores_insert_own
  ON public.credit_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS credit_scores_update_own ON public.credit_scores;
CREATE POLICY credit_scores_update_own
  ON public.credit_scores
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text);


-- =============================================================
-- SECTION 2: Driver risk scoring (extends credit_scores)
-- Source: 20260713_driver_risk_scoring.sql (FIXED for your schema)
-- =============================================================

ALTER TABLE public.credit_scores
  ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS risk_flags JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS risk_calculated_at TIMESTAMPTZ DEFAULT NULL;

CREATE OR REPLACE FUNCTION public.calculate_driver_risk(p_user_id TEXT)
RETURNS TABLE(risk_score INTEGER, risk_flags JSONB)
LANGUAGE plpgsql
AS $$
DECLARE
  v_cancellation_rate NUMERIC := 0;
  v_rating_drops INTEGER := 0;
  v_response_time_avg NUMERIC := 0;
  v_total_trips INTEGER := 0;
  v_completed_trips INTEGER := 0;
  v_cancelled_trips INTEGER := 0;
  v_avg_rating NUMERIC := 0;
  v_prev_avg_rating NUMERIC := 0;
  v_risk_score INTEGER := 0;
  v_flags JSONB;
  v_flag_list TEXT[] := '{}';
  v_risk_level TEXT;
BEGIN
  -- Get trip stats
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'cancelled')
  INTO v_total_trips, v_completed_trips, v_cancelled_trips
  FROM public.trips
  WHERE trucker_id = p_user_id;

  -- Cancellation rate
  IF v_total_trips > 0 THEN
    v_cancellation_rate := v_cancelled_trips::NUMERIC / v_total_trips;
  END IF;

  -- Rating drops: compare last 30 days vs previous 30 days
  SELECT COALESCE(AVG(rating), 0)
  INTO v_avg_rating
  FROM public.reviews
  WHERE trucker_id = p_user_id
    AND created_at >= NOW() - INTERVAL '30 days';

  SELECT COALESCE(AVG(rating), 0)
  INTO v_prev_avg_rating
  FROM public.reviews
  WHERE trucker_id = p_user_id
    AND created_at >= NOW() - INTERVAL '60 days'
    AND created_at < NOW() - INTERVAL '30 days';

  IF v_prev_avg_rating > 0 AND v_avg_rating < v_prev_avg_rating THEN
    v_rating_drops := 1;
  END IF;

  -- Response time: average time between request creation and response
  SELECT COALESCE(AVG(
    EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600.0
  ), 0)
  INTO v_response_time_avg
  FROM public.requests
  WHERE receiver_id = p_user_id
    AND status IN ('accepted', 'declined')
    AND updated_at > created_at;

  -- Build risk flags
  IF v_cancellation_rate > 0.3 THEN
    v_flag_list := array_append(v_flag_list, 'high_cancellation_rate');
    v_risk_score := v_risk_score + 30;
  ELSIF v_cancellation_rate > 0.15 THEN
    v_flag_list := array_append(v_flag_list, 'moderate_cancellation_rate');
    v_risk_score := v_risk_score + 15;
  END IF;

  IF v_rating_drops > 0 THEN
    v_flag_list := array_append(v_flag_list, 'rating_declining');
    v_risk_score := v_risk_score + 20;
  END IF;

  IF v_response_time_avg > 24 THEN
    v_flag_list := array_append(v_flag_list, 'slow_response');
    v_risk_score := v_risk_score + 20;
  ELSIF v_response_time_avg > 12 THEN
    v_flag_list := array_append(v_flag_list, 'moderate_response_time');
    v_risk_score := v_risk_score + 10;
  END IF;

  IF v_total_trips = 0 THEN
    v_flag_list := array_append(v_flag_list, 'new_driver');
    v_risk_score := v_risk_score + 10;
  END IF;

  -- Determine risk level
  v_risk_level := CASE
    WHEN v_risk_score >= 60 THEN 'high'
    WHEN v_risk_score >= 30 THEN 'medium'
    WHEN v_risk_score >= 10 THEN 'low'
    ELSE 'minimal'
  END;

  v_flags := jsonb_build_object(
    'risk_level', v_risk_level,
    'flags', to_jsonb(v_flag_list),
    'cancellation_rate', ROUND(v_cancellation_rate::NUMERIC, 3),
    'cancelled_trips', v_cancelled_trips,
    'total_trips', v_total_trips,
    'rating_drops', v_rating_drops,
    'avg_response_hours', ROUND(v_response_time_avg::NUMERIC, 1),
    'current_rating', ROUND(v_avg_rating::NUMERIC, 2)
  );

  -- Update credit_scores with risk data
  UPDATE public.credit_scores
  SET risk_score = v_risk_score,
      risk_flags = v_flags,
      risk_calculated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_risk_score, v_flags;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_driver_risk()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  affected_user_id TEXT;
BEGIN
  IF TG_TABLE_NAME = 'trips' THEN
    affected_user_id := COALESCE(NEW.trucker_id, OLD.trucker_id);
  ELSIF TG_TABLE_NAME = 'reviews' THEN
    affected_user_id := COALESCE(NEW.trucker_id, OLD.trucker_id);
  END IF;

  IF affected_user_id IS NOT NULL THEN
    PERFORM public.calculate_driver_risk(affected_user_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_driver_risk_trips ON public.trips;
CREATE TRIGGER trg_refresh_driver_risk_trips
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.refresh_driver_risk();

DROP TRIGGER IF EXISTS trg_refresh_driver_risk_reviews ON public.reviews;
CREATE TRIGGER trg_refresh_driver_risk_reviews
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_driver_risk();


-- =============================================================
-- SECTION 3: driver_locations table + RLS
-- Source: 20260713_driver_locations.sql (your modified version)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.driver_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  driver_id text NOT NULL,
  trip_id uuid,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  heading numeric,
  speed numeric,
  accuracy numeric,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT driver_locations_pkey PRIMARY KEY (id),
  CONSTRAINT driver_locations_driver_id_unique UNIQUE (driver_id),
  CONSTRAINT driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(id),
  CONSTRAINT driver_locations_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id)
);

CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON public.driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_updated_at ON public.driver_locations(updated_at DESC);

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read driver_locations"
  ON public.driver_locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Driver can insert own location"
  ON public.driver_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Driver can update own location"
  ON public.driver_locations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- =============================================================
-- SECTION 4: create_notification RPC function
-- Used by: src/utils/notifications.ts
-- =============================================================

DROP FUNCTION IF EXISTS public.create_notification(text,text,text,text,text,uuid,uuid);

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_title TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_related_trip_id UUID DEFAULT NULL,
  p_related_shipment_request_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id, message, type, title, action_url,
    related_trip_id, related_shipment_request_id
  ) VALUES (
    p_user_id, p_message, p_type, p_title, p_action_url,
    p_related_trip_id, p_related_shipment_request_id
  );
END;
$$;


-- =============================================================
-- SECTION 5: get_route_history RPC function
-- Used by: supabase/functions/price-predict/index.ts
-- =============================================================

DROP FUNCTION IF EXISTS public.get_route_history(text,text);

CREATE OR REPLACE FUNCTION public.get_route_history(
  p_origin TEXT,
  p_dest TEXT
)
RETURNS TABLE(
  price_per_tonne NUMERIC,
  weight_tonnes NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT ph.price_per_tonne, ph.weight_tonnes, ph.created_at
  FROM public.price_history ph
  WHERE ph.origin_city = p_origin
    AND ph.destination_city = p_dest
  ORDER BY ph.created_at DESC
  LIMIT 100;
END;
$$;


-- =============================================================
-- DONE. All missing database objects created.
-- =============================================================
