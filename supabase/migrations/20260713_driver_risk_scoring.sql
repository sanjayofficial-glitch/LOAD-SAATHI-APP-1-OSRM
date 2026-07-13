-- Driver Risk Scoring Extension
-- Adds risk flags and a risk score to the credit_scores table
-- Risk score: 0-100 (lower is better)

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
  v_late_deliveries INTEGER := 0;
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

  -- Response time: average time between request and response
  SELECT COALESCE(AVG(
    EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600.0
  ), 0)
  INTO v_response_time_avg
  FROM public.requests
  WHERE trucker_id = p_user_id
    AND status IN ('accepted', 'rejected')
    AND updated_at > created_at;

  -- Late deliveries: trips completed after estimated date
  SELECT COUNT(*)
  INTO v_late_deliveries
  FROM public.trips
  WHERE trucker_id = p_user_id
    AND status = 'completed'
    AND estimated_delivery_date IS NOT NULL
    AND actual_delivery_date > estimated_delivery_date;

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

  IF v_late_deliveries > 3 THEN
    v_flag_list := array_append(v_flag_list, 'frequent_late_deliveries');
    v_risk_score := v_risk_score + 20;
  ELSIF v_late_deliveries > 0 THEN
    v_flag_list := array_append(v_flag_list, 'some_late_deliveries');
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
    'late_deliveries', v_late_deliveries,
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

-- Refresh risk score when trips or reviews change
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
  ELSIF TG_TABLE_NAME = 'requests' THEN
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

DROP TRIGGER IF EXISTS trg_refresh_driver_risk_requests ON public.requests;
CREATE TRIGGER trg_refresh_driver_risk_requests
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.refresh_driver_risk();
