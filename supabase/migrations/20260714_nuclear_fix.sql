-- =============================================================
-- NUCLEAR FIX: Drop and recreate ALL trigger functions + RLS
-- for tables that reference trucker_id / shipper_id / receiver_id
-- Run this ONCE in Supabase SQL Editor
-- =============================================================

-- ==================== DROP ALL TRIGGERS FIRST ====================
DROP TRIGGER IF EXISTS trg_refresh_credit_score_trips ON public.trips;
DROP TRIGGER IF EXISTS trg_refresh_credit_score_shipments ON public.shipments;
DROP TRIGGER IF EXISTS trg_refresh_credit_score_reviews ON public.reviews;
DROP TRIGGER IF EXISTS trg_refresh_credit_score_requests ON public.requests;
DROP TRIGGER IF EXISTS trg_refresh_credit_score_shipment_requests ON public.shipment_requests;
DROP TRIGGER IF EXISTS trg_refresh_driver_risk_trips ON public.trips;
DROP TRIGGER IF EXISTS trg_refresh_driver_risk_reviews ON public.reviews;
DROP TRIGGER IF EXISTS trg_refresh_driver_risk_requests ON public.requests;

-- ==================== CREDIT SCORE FUNCTION ====================
CREATE OR REPLACE FUNCTION public.calculate_credit_score(p_user_id TEXT)
RETURNS TABLE(score INTEGER, factors JSONB)
LANGUAGE plpgsql AS $$
DECLARE
  v_user_type TEXT;
  v_completed_trips INTEGER := 0;
  v_cancelled_trips INTEGER := 0;
  v_terminated_trips INTEGER := 0;
  v_delivered_trips INTEGER := 0;
  v_avg_rating NUMERIC := 0;
  v_review_count INTEGER := 0;
  v_days_active INTEGER := 0;
  v_message_count INTEGER := 0;
  v_accepted_requests INTEGER := 0;
  v_total_requests INTEGER := 0;
  v_total_score NUMERIC := 0;
  v_factors JSONB;
BEGIN
  SELECT user_type INTO v_user_type FROM public.users WHERE id = p_user_id;

  IF v_user_type = 'trucker' THEN
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed'),
      COUNT(*) FILTER (WHERE status = 'cancelled'),
      COUNT(*) FILTER (WHERE status IN ('completed','delivered','in_transit','cancelled')),
      COUNT(*) FILTER (WHERE status IN ('delivered','completed'))
    INTO v_completed_trips, v_cancelled_trips, v_terminated_trips, v_delivered_trips
    FROM public.trips WHERE trucker_id = p_user_id;

    SELECT COALESCE(AVG(rating),0), COUNT(*)
    INTO v_avg_rating, v_review_count
    FROM public.reviews WHERE trucker_id = p_user_id AND reviewer_role = 'shipper';

    SELECT COUNT(*) INTO v_message_count FROM public.messages WHERE sender_id = p_user_id;

    SELECT COALESCE(COUNT(*) FILTER (WHERE status='accepted'),0), COUNT(*)
    INTO v_accepted_requests, v_total_requests
    FROM public.requests WHERE receiver_id = p_user_id;

  ELSIF v_user_type = 'shipper' THEN
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed'),
      COUNT(*) FILTER (WHERE status = 'cancelled'),
      COUNT(*) FILTER (WHERE status IN ('completed','in_transit','delivered','cancelled')),
      COUNT(*) FILTER (WHERE status IN ('delivered','completed'))
    INTO v_completed_trips, v_cancelled_trips, v_terminated_trips, v_delivered_trips
    FROM public.shipments WHERE shipper_id = p_user_id;

    SELECT COALESCE(AVG(rating),0), COUNT(*)
    INTO v_avg_rating, v_review_count
    FROM public.reviews WHERE shipper_id = p_user_id AND reviewer_role = 'trucker';

    SELECT COUNT(*) INTO v_message_count FROM public.messages WHERE sender_id = p_user_id;

    SELECT COALESCE(COUNT(*) FILTER (WHERE status='accepted'),0), COUNT(*)
    INTO v_accepted_requests, v_total_requests
    FROM public.shipment_requests WHERE shipper_id = p_user_id;
  END IF;

  SELECT COALESCE(EXTRACT(DAY FROM now()-created_at)::INTEGER,0)
  INTO v_days_active FROM public.users WHERE id = p_user_id;

  -- Completion (30%), Reliability (25%), Communication (15%), Reviews (20%), Tenure (10%)
  v_total_score := 300
    + CASE WHEN v_terminated_trips > 0 THEN 270 * (v_completed_trips::NUMERIC / v_terminated_trips) ELSE 135 END
    + CASE WHEN v_terminated_trips > 0 THEN 225 * (v_delivered_trips::NUMERIC / v_terminated_trips) ELSE 112.5 END
    + CASE WHEN v_total_requests > 0 THEN 135 * (v_accepted_requests::NUMERIC / v_total_requests) ELSE 67.5 END
    + CASE WHEN v_review_count > 0 THEN 180 * (v_avg_rating / 5.0) ELSE 90 END
    + LEAST(90, (v_days_active::NUMERIC / 365.0) * 90);

  v_total_score := GREATEST(300, LEAST(900, v_total_score));

  v_factors := jsonb_build_object(
    'completion', jsonb_build_object('score', ROUND(v_total_score), 'completed', v_completed_trips, 'total', v_terminated_trips),
    'reviews', jsonb_build_object('avgRating', ROUND(v_avg_rating,1), 'count', v_review_count),
    'tenure', jsonb_build_object('daysActive', v_days_active, 'completedTrips', v_completed_trips)
  );

  INSERT INTO public.credit_scores (user_id, score, factors, calculated_at)
  VALUES (p_user_id, ROUND(v_total_score)::INTEGER, v_factors, now())
  ON CONFLICT (user_id) DO UPDATE SET
    score = EXCLUDED.score, factors = EXCLUDED.factors, calculated_at = EXCLUDED.calculated_at;

  RETURN QUERY SELECT ROUND(v_total_score)::INTEGER, v_factors;
END;
$$;

-- ==================== CREDIT SCORE TRIGGER FUNCTION ====================
CREATE OR REPLACE FUNCTION public.refresh_credit_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE affected_user_id TEXT;
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
    affected_user_id := COALESCE(NEW.receiver_id, OLD.receiver_id);
  ELSIF TG_TABLE_NAME = 'shipment_requests' THEN
    affected_user_id := COALESCE(NEW.trucker_id, OLD.trucker_id);
  END IF;

  IF affected_user_id IS NOT NULL THEN
    PERFORM public.calculate_credit_score(affected_user_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ==================== DRIVER RISK FUNCTION ====================
CREATE OR REPLACE FUNCTION public.calculate_driver_risk(p_user_id TEXT)
RETURNS TABLE(risk_score INTEGER, risk_flags JSONB)
LANGUAGE plpgsql AS $$
DECLARE
  v_cancellation_rate NUMERIC := 0;
  v_total_trips INTEGER := 0;
  v_cancelled_trips INTEGER := 0;
  v_risk_score INTEGER := 0;
  v_flags JSONB;
  v_flag_list TEXT[] := '{}';
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'cancelled')
  INTO v_total_trips, v_cancelled_trips
  FROM public.trips WHERE trucker_id = p_user_id;

  IF v_total_trips > 0 THEN
    v_cancellation_rate := v_cancelled_trips::NUMERIC / v_total_trips;
  END IF;

  IF v_cancellation_rate > 0.3 THEN
    v_flag_list := array_append(v_flag_list, 'high_cancellation_rate');
    v_risk_score := v_risk_score + 30;
  ELSIF v_cancellation_rate > 0.15 THEN
    v_flag_list := array_append(v_flag_list, 'moderate_cancellation_rate');
    v_risk_score := v_risk_score + 15;
  END IF;

  IF v_total_trips = 0 THEN
    v_flag_list := array_append(v_flag_list, 'new_driver');
    v_risk_score := v_risk_score + 10;
  END IF;

  v_flags := jsonb_build_object(
    'risk_level', CASE WHEN v_risk_score >= 60 THEN 'high' WHEN v_risk_score >= 30 THEN 'medium' WHEN v_risk_score >= 10 THEN 'low' ELSE 'minimal' END,
    'flags', to_jsonb(v_flag_list),
    'cancellation_rate', ROUND(v_cancellation_rate, 3),
    'cancelled_trips', v_cancelled_trips,
    'total_trips', v_total_trips
  );

  UPDATE public.credit_scores
  SET risk_score = v_risk_score, risk_flags = v_flags, risk_calculated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_risk_score, v_flags;
END;
$$;

-- ==================== DRIVER RISK TRIGGER FUNCTION ====================
CREATE OR REPLACE FUNCTION public.refresh_driver_risk()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE affected_user_id TEXT;
BEGIN
  IF TG_TABLE_NAME = 'trips' THEN
    affected_user_id := COALESCE(NEW.trucker_id, OLD.trucker_id);
  ELSIF TG_TABLE_NAME = 'reviews' THEN
    affected_user_id := COALESCE(NEW.trucker_id, OLD.trucker_id);
  ELSIF TG_TABLE_NAME = 'requests' THEN
    affected_user_id := COALESCE(NEW.receiver_id, OLD.receiver_id);
  END IF;

  IF affected_user_id IS NOT NULL THEN
    PERFORM public.calculate_driver_risk(affected_user_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ==================== RECREATE ALL TRIGGERS ====================
CREATE TRIGGER trg_refresh_credit_score_trips
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.refresh_credit_score();

CREATE TRIGGER trg_refresh_credit_score_shipments
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.refresh_credit_score();

CREATE TRIGGER trg_refresh_credit_score_reviews
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_credit_score();

CREATE TRIGGER trg_refresh_driver_risk_trips
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.refresh_driver_risk();

CREATE TRIGGER trg_refresh_driver_risk_reviews
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_driver_risk();

-- ==================== FIX ALL RLS POLICIES ====================

-- TRIPS
DROP POLICY IF EXISTS "Truckers can create trips" ON public.trips;
DROP POLICY IF EXISTS "Truckers can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Truckers can delete own trips" ON public.trips;
CREATE POLICY "Truckers can create trips" ON public.trips
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = trucker_id);
CREATE POLICY "Truckers can update own trips" ON public.trips
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = trucker_id);
CREATE POLICY "Truckers can delete own trips" ON public.trips
  FOR DELETE TO authenticated USING (auth.jwt()->>'sub' = trucker_id);

-- SHIPMENTS
DROP POLICY IF EXISTS "Shippers can create shipments" ON public.shipments;
DROP POLICY IF EXISTS "Shippers can update own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Shippers can delete own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Anyone can see pending shipments" ON public.shipments;
CREATE POLICY "Anyone can see pending shipments" ON public.shipments
  FOR SELECT TO authenticated USING (status = 'pending' OR auth.jwt()->>'sub' = shipper_id);
CREATE POLICY "Shippers can create shipments" ON public.shipments
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = shipper_id);
CREATE POLICY "Shippers can update own shipments" ON public.shipments
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = shipper_id);
CREATE POLICY "Shippers can delete own shipments" ON public.shipments
  FOR DELETE TO authenticated USING (auth.jwt()->>'sub' = shipper_id);

-- REQUESTS
DROP POLICY IF EXISTS "Users can view own requests" ON public.requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.requests;
CREATE POLICY "Users can view own requests" ON public.requests
  FOR SELECT TO authenticated USING (auth.jwt()->>'sub' = shipper_id OR auth.jwt()->>'sub' = receiver_id);
CREATE POLICY "Users can create requests" ON public.requests
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = shipper_id);
CREATE POLICY "Users can update own requests" ON public.requests
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = shipper_id OR auth.jwt()->>'sub' = receiver_id);

-- SHIPMENT_REQUESTS
DROP POLICY IF EXISTS "Users can view shipment requests" ON public.shipment_requests;
DROP POLICY IF EXISTS "Truckers can create shipment requests" ON public.shipment_requests;
DROP POLICY IF EXISTS "Users can update shipment requests" ON public.shipment_requests;
CREATE POLICY "Users can view shipment requests" ON public.shipment_requests
  FOR SELECT TO authenticated USING (auth.jwt()->>'sub' = trucker_id OR auth.jwt()->>'sub' = shipper_id);
CREATE POLICY "Truckers can create shipment requests" ON public.shipment_requests
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = trucker_id);
CREATE POLICY "Users can update shipment requests" ON public.shipment_requests
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = trucker_id OR auth.jwt()->>'sub' = shipper_id);

-- REVIEWS
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = shipper_id);

-- MESSAGES
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT TO authenticated USING (auth.jwt()->>'sub' = sender_id OR auth.jwt()->>'sub' = recipient_id);
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = sender_id);
CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = recipient_id);

-- PRICE_HISTORY
DROP POLICY IF EXISTS "Users can insert own price history" ON public.price_history;
CREATE POLICY "Users can insert own price history" ON public.price_history
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = user_id);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;
CREATE POLICY "Users can create own notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = user_id);

-- DRIVER_LOCATIONS
DROP POLICY IF EXISTS "Driver can insert own location" ON public.driver_locations;
DROP POLICY IF EXISTS "Driver can update own location" ON public.driver_locations;
CREATE POLICY "Driver can insert own location" ON public.driver_locations
  FOR INSERT TO authenticated WITH CHECK (auth.jwt()->>'sub' = driver_id);
CREATE POLICY "Driver can update own location" ON public.driver_locations
  FOR UPDATE TO authenticated USING (auth.jwt()->>'sub' = driver_id)
  WITH CHECK (auth.jwt()->>'sub' = driver_id);
