-- Digital Freight Credit Score System
-- Score range: 300–900, default 550 (fair) for new users

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
