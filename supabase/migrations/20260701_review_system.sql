-- Review System: unique constraint & auto-rating recalculation
-- Part of Phase 5

-- Prevent duplicate reviews: shipper can only review a trip once
ALTER TABLE public.reviews
ADD CONSTRAINT unique_trip_shipper_review UNIQUE (trip_id, shipper_id);

-- Function to recalculate trucker's average rating from reviews
CREATE OR REPLACE FUNCTION public.update_trucker_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_rating numeric;
  target_trucker_id text;
BEGIN
  target_trucker_id := COALESCE(NEW.trucker_id, OLD.trucker_id);

  SELECT ROUND(AVG(rating)::numeric, 1) INTO avg_rating
  FROM public.reviews
  WHERE trucker_id = target_trucker_id;

  UPDATE public.users
  SET rating = COALESCE(avg_rating, 0)
  WHERE id = target_trucker_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger: recalculate rating on review insert, update, or delete
DROP TRIGGER IF EXISTS trg_reviews_update_rating ON public.reviews;
CREATE TRIGGER trg_reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trucker_rating();
