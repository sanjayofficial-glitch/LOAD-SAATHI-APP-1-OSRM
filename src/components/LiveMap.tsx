import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Fix 0×0 map pane: invalidateSize on mount
function MapSizeHandler() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export interface TruckLocation {
  id: string;
  driverId: string;
  driverName: string;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  tripId: string | null;
  originCity: string | null;
  destinationCity: string | null;
  lastUpdated: string;
}

interface LiveMapProps {
  trucks: TruckLocation[];
  className?: string;
}

function FitBounds({ trucks }: { trucks: TruckLocation[] }) {
  const map = useMap();
  useEffect(() => {
    if (trucks.length === 0) return;
    if (trucks.length === 1) {
      const truck = trucks[0];
      if (!truck) return;
      map.setView([truck.lat, truck.lng], 12);
      return;
    }
    const coords: [number, number][] = trucks.map((t) => [t.lat, t.lng]);
    map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
  }, [trucks, map]);
  return null;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--";
  }
}

export default React.memo(function LiveMap({ trucks, className = "" }: LiveMapProps) {
  return (
    <div
      className={`relative w-full rounded-lg overflow-hidden border ${className}`}
      style={{ height: "500px" }}
    >
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <MapSizeHandler />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds trucks={trucks} />
        {trucks.map((truck) => (
          <Marker key={truck.id} position={[truck.lat, truck.lng]}>
            <Popup>
              <div>
                <p className="font-semibold">{truck.driverName}</p>
                {truck.originCity && truck.destinationCity && (
                  <p className="text-sm text-gray-600">
                    {truck.originCity} to {truck.destinationCity}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Updated: {formatTime(truck.lastUpdated)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
});
