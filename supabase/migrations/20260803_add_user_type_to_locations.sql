-- Add user_type column to driver_locations to track both truckers and shippers
ALTER TABLE public.driver_locations 
  ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'trucker' 
  CHECK (user_type IN ('trucker', 'shipper'));

-- Update existing rows: set user_type based on users table
UPDATE public.driver_locations dl
SET user_type = u.user_type
FROM public.users u
WHERE dl.driver_id = u.id AND dl.user_type IS NULL;

-- Add index for filtering by user_type
CREATE INDEX IF NOT EXISTS idx_driver_locations_user_type ON public.driver_locations(user_type);

-- Add index for filtering by updated_at for "online" queries
CREATE INDEX IF NOT EXISTS idx_driver_locations_active ON public.driver_locations(updated_at DESC) WHERE updated_at > now() - interval '15 minutes';
