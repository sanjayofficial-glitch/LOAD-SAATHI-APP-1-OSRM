import type { Geometry } from 'geojson';

export interface RouteResult {
  distance_km: number;
  duration_min: number;
  geometry?: Geometry;
}

// --- In-memory cache to avoid repeated OSRM API calls ---
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const routeCache = new Map<string, { result: RouteResult | null; ts: number }>();

function cacheKey(
  oLng: number, oLat: number,
  dLng: number, dLat: number
): string {
  // Round to 4 decimal places (~11 m precision) to maximise cache hits
  return `${oLng.toFixed(4)},${oLat.toFixed(4)};${dLng.toFixed(4)},${dLat.toFixed(4)}`;
}

/**
 * Fetch a driving route from the public OSRM API.
 * Results are cached in-memory for 10 minutes.
 * Returns distance (km), duration (min), and GeoJSON geometry.
 */
export async function getRoute(
  originLng: number, originLat: number,
  destLng: number, destLat: number
): Promise<RouteResult | null> {
  const key = cacheKey(originLng, originLat, destLng, destLat);
  const cached = routeCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.result;
  }

  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${originLng},${originLat};${destLng},${destLat}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok') {
      // Don't cache non-Ok responses (may be transient/rate-limit)
      return null;
    }
    const route = data.routes[0];
    const result: RouteResult = {
      distance_km: Math.round(route.distance / 1000),
      duration_min: Math.round(route.duration / 60),
      geometry: route.geometry,
    };
    routeCache.set(key, { result, ts: Date.now() });
    return result;
  } catch {
    return null;
  }
}

