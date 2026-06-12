export interface Coords { lat: number; lon: number; }

const geocodeCache = new Map<string, Coords | null>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function geocodeCity(
  city: string,
  country = 'India'
): Promise<Coords | null> {
  const cacheKey = `${city.toLowerCase().trim()},${country}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - (cached as Coords & { _ts: number })._ts < CACHE_TTL_MS) {
    return cached;
  }

  try {
    const query = encodeURIComponent(`${city}, ${country}`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      const result: Coords & { _ts: number } = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), _ts: Date.now() };
      geocodeCache.set(cacheKey, result);
      return result;
    }
    geocodeCache.set(cacheKey, null);
    return null;
  } catch {
    return null;
  }
}
