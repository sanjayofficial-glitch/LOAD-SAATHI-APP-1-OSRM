import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import TruckMarker, { type TruckLocation } from './TruckMarker';
import LoadMarker, { type LoadLocation } from './LoadMarker';
import RoutePolyline from './RoutePolyline';
import MapLegend from './MapLegend';
import { cn } from '@/lib/utils';

// ── Fix 0×0 map pane: invalidateSize on mount ──────────────────────────────
function MapSizeHandler() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// ── Auto-fit bounds ──────────────────────────────────────────────────────────
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 12);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] });
  }, [positions, map]);
  return null;
}

// ── Default center: India ────────────────────────────────────────────────────
const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

export interface LoadSaathiMapProps {
  trucks?: TruckLocation[];
  loads?: LoadLocation[];
  selectedTruckId?: string;
  selectedLoadId?: string;
  onTruckClick?: (truck: TruckLocation) => void;
  onLoadClick?: (load: LoadLocation) => void;
  showRouteFor?: {
    originLat: number;
    originLng: number;
    destLat: number;
    destLng: number;
    color?: string;
  };
  className?: string;
  height?: string;
  showLegend?: boolean;
  showClusters?: boolean;
  center?: [number, number];
  zoom?: number;
  onMapClick?: (e: L.LeafletMouseEvent) => void;
}

export default React.memo(function LoadSaathiMap({
  trucks = [],
  loads = [],
  selectedTruckId,
  selectedLoadId,
  onTruckClick,
  onLoadClick,
  showRouteFor,
  className = '',
  height = '500px',
  showLegend = true,
  showClusters = true,
  center = INDIA_CENTER,
  zoom = DEFAULT_ZOOM,
  onMapClick,
}: LoadSaathiMapProps) {
  // Compute all positions for bounds fitting
  const allPositions = useMemo(() => {
    const positions: [number, number][] = [];
    trucks.forEach((t) => {
      if (t.lat && t.lng) positions.push([t.lat, t.lng]);
    });
    loads.forEach((l) => {
      if (l.origin_lat && l.origin_lng) positions.push([l.origin_lat, l.origin_lng]);
    });
    if (showRouteFor) {
      positions.push([showRouteFor.originLat, showRouteFor.originLng]);
      positions.push([showRouteFor.destLat, showRouteFor.destLng]);
    }
    return positions;
  }, [trucks, loads, showRouteFor]);

  const markers = (
    <>
      {trucks.map((truck) => (
        <TruckMarker
          key={truck.driver_id}
          truck={truck}
          onClick={onTruckClick}
        />
      ))}
      {loads.map((load) => (
        <LoadMarker
          key={load.id}
          load={load}
          onClick={onLoadClick}
        />
      ))}
      {showRouteFor && (
        <RoutePolyline
          originLat={showRouteFor.originLat}
          originLng={showRouteFor.originLng}
          destLat={showRouteFor.destLat}
          destLng={showRouteFor.destLng}
          color={showRouteFor.color}
        />
      )}
    </>
  );

  return (
    <div
      className={cn('relative w-full rounded-lg overflow-hidden border', className)}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        click={onMapClick}
      >
        <MapSizeHandler />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allPositions.length > 0 && <FitBounds positions={allPositions} />}
        {showClusters ? (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
          >
            {markers}
          </MarkerClusterGroup>
        ) : (
          markers
        )}
      </MapContainer>
      {showLegend && (
        <MapLegend
          showTrucks={trucks.length > 0}
          showLoads={loads.length > 0}
        />
      )}
    </div>
  );
});
