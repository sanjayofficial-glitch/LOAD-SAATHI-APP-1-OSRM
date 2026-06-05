export interface RouteResult {
  distance_km: number;
  duration_min: number;
  geometry?: any;
}

export async function getRoute(
  originLng: number, originLat: number,
  destLng: number, destLat: number
): Promise<RouteResult | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${originLng},${originLat};${destLng},${destLat}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok') return null;
    const route = data.routes[0];
    return {
      distance_km: Math.round(route.distance / 1000),
      duration_min: Math.round(route.duration / 60),
      geometry: route.geometry,
    };
  } catch {
    return null;
  }
}
