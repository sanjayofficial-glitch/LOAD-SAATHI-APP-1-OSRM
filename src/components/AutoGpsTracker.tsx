import { useEffect, useRef } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClerkSupabaseClient } from '@/utils/supabaseClient';

/**
 * AutoGpsTracker - Invisible component that auto-tracks GPS for logged-in truckers.
 * Placed in Layout to ensure authenticated truckers share location for the command center.
 * Sends updates every 5 minutes (free-tier optimized) with trip context for live map display.
 *
 * Uses Clerk JWT → createClerkSupabaseClient for authenticated writes to driver_locations.
 */
const FIVE_MINUTES_MS = 5 * 60 * 1000;

export default function AutoGpsTracker() {
  const { getToken } = useClerkAuth();
  const { userProfile } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const activeTripRef = useRef<{
    trip_id: string;
    origin_city: string;
    destination_city: string;
    vehicle_type: string;
    available_capacity_tonnes: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!userProfile || !mounted) return;

      const ut = userProfile.user_type;
      if (ut !== 'trucker' && ut !== 'shipper') return;

      // Get Clerk JWT for authenticated Supabase client
      const token = await getToken();
      if (!token || !mounted) return;

      const supabase = createClerkSupabaseClient(token);

      // Fetch active trip context for truckers (for map display)
      if (ut === 'trucker') {
        const { data: trip } = await supabase
          .from('trips')
          .select('id, origin_city, destination_city, vehicle_type, available_capacity_tonnes')
          .eq('trucker_id', userProfile.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (trip && mounted) {
          activeTripRef.current = {
            trip_id: trip.id,
            origin_city: trip.origin_city,
            destination_city: trip.destination_city,
            vehicle_type: trip.vehicle_type,
            available_capacity_tonnes: trip.available_capacity_tonnes,
          };
        }
      }

      // Start watching position
      if (!navigator.geolocation) return;

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          if (!mounted) return;

          const now = Date.now();
          // Throttle to every 5 minutes (free-tier optimized)
          if (now - lastUpdateRef.current < FIVE_MINUTES_MS) return;
          lastUpdateRef.current = now;

          const { latitude: lat, longitude: lng } = position.coords;
          const tripCtx = activeTripRef.current;

          // Refresh token if needed (Clerk tokens expire ~60s)
          const freshToken = await getToken();
          if (!freshToken) return;
          const client = createClerkSupabaseClient(freshToken);

          const { error } = await client.from('driver_locations').upsert(
            {
              driver_id: userProfile.id,
              user_type: ut,
              lat,
              lng,
              heading: position.coords.heading ?? null,
              speed: position.coords.speed ?? null,
              updated_at: new Date().toISOString(),
              last_seen_at: new Date().toISOString(),
              // Trip context for live map
              ...(tripCtx && {
                trip_id: tripCtx.trip_id,
                origin_city: tripCtx.origin_city,
                destination_city: tripCtx.destination_city,
                vehicle_type: tripCtx.vehicle_type,
                available_capacity_tonnes: tripCtx.available_capacity_tonnes,
                trip_status: 'active',
              }),
            },
            { onConflict: 'driver_id' }
          );

          if (error) {
            console.error('[AutoGpsTracker] Failed to update:', error.message);
          }
        },
        (err) => {
          // Silently ignore permission denied or timeout
          console.warn('[AutoGpsTracker] Geolocation error:', err.message);
        },
        {
          enableHighAccuracy: false,
          maximumAge: FIVE_MINUTES_MS,
          timeout: 60000,
        }
      );
    };

    init();

    return () => {
      mounted = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [userProfile, getToken]);

  // This component renders nothing
  return null;
}
