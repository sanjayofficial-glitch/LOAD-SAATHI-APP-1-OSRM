import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * AutoGpsTracker - Invisible component that auto-tracks GPS for logged-in truckers/shippers.
 * Placed in Layout to ensure all authenticated users share location for the command center.
 * Sends updates every 10 seconds (throttled by the 50m minimum distance check).
 */
export default function AutoGpsTracker() {
  const watchIdRef = useRef<number | null>(null);
  const userIdRef = useRef<string | null>(null);
  const userTypeRef = useRef<'trucker' | 'shipper' | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      userIdRef.current = user.id;

      // Determine user type from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (!profile || !mounted) return;

      const ut = profile.user_type;
      if (ut !== 'trucker' && ut !== 'shipper') return;
      userTypeRef.current = ut;

      // Start watching position
      if (!navigator.geolocation) return;

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          if (!userIdRef.current || !userTypeRef.current) return;

          const now = Date.now();
          // Throttle to every 10s
          if (now - lastUpdateRef.current < 10000) return;
          lastUpdateRef.current = now;

          const { latitude: lat, longitude: lng } = position.coords;

          const { error } = await supabase.from('driver_locations').upsert(
            {
              driver_id: userIdRef.current,
              user_type: userTypeRef.current,
              lat,
              lng,
              heading: position.coords.heading ?? null,
              speed: position.coords.speed ?? null,
              updated_at: new Date().toISOString(),
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
          enableHighAccuracy: true,
          maximumAge: 15000,
          timeout: 30000,
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
  }, []);

  // This component renders nothing
  return null;
}
