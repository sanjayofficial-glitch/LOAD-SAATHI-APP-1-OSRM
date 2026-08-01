// Lightweight OSRM distance fetcher for Supabase Edge Functions
// Uses the free public OSRM API with in-memory caching

const osrmCache = new Map<string, number>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

export async function fetchOsrmDistance(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
): Promise<number | null> {
  const key = `${originLng.toFixed(4)},${originLat.toFixed(4)};${destLng.toFixed(4)},${destLat.toFixed(4)}`;

  const cached = osrmCache.get(key);
  const ts = cacheTimestamps.get(key) ?? 0;
  if (cached !== undefined && Date.now() - ts < CACHE_TTL_MS) {
    return cached;
  }

  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${originLng},${originLat};${destLng},${destLat}` +
      `?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok") return null;
    const km = Math.round(data.routes[0].distance / 1000);
    osrmCache.set(key, km);
    cacheTimestamps.set(key, Date.now());
    return km;
  } catch {
    return null;
  }
}
