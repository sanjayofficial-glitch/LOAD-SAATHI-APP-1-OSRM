import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { truckerIcon, onTripIcon } from './icons';

export interface TruckLocation {
  driver_id: string;
  driver_name?: string;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  trip_id: string | null;
  origin_city: string | null;
  destination_city: string | null;
  vehicle_type: string | null;
  available_capacity_tonnes: number | null;
  trip_status: string | null;
  last_seen_at: string;
}

interface TruckMarkerProps {
  truck: TruckLocation;
  onClick?: (truck: TruckLocation) => void;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--';
  }
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default React.memo(function TruckMarker({ truck, onClick }: TruckMarkerProps) {
  const isInTransit = truck.trip_status === 'in_transit' || (truck.trip_id != null && truck.origin_city != null);
  const icon = isInTransit ? onTripIcon : truckerIcon;

  return (
    <Marker
      position={[truck.lat, truck.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(truck),
      }}
    >
      <Popup>
        <div className="min-w-[180px]">
          <p className="font-semibold text-sm">
            {truck.driver_name || 'Truck'}
          </p>
          {truck.vehicle_type && (
            <p className="text-xs text-muted-foreground">
              {truck.vehicle_type}
              {truck.available_capacity_tonnes != null && ` • ${truck.available_capacity_tonnes}T`}
            </p>
          )}
          {truck.origin_city && truck.destination_city && (
            <p className="text-xs text-muted-foreground mt-1">
              📍 {truck.origin_city} → {truck.destination_city}
            </p>
          )}
          {truck.speed != null && truck.speed > 0 && (
            <p className="text-xs text-muted-foreground">
              🏎️ {Math.round(truck.speed * 3.6)} km/h
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            🕐 Updated {formatTimeAgo(truck.last_seen_at)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
});
