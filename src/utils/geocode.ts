export interface Coords { lat: number; lon: number; }

export async function geocodeCity(
  city: string,
  country = 'India'
): Promise<Coords | null> {
  try {
    const query = encodeURIComponent(`${city}, ${country}`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}
