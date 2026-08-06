import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import TruckMarker, { type TruckLocation } from './TruckMarker';
import LoadMarker, { type LoadLocation } from './LoadMarker';
import RoutePolyline from './RoutePolyline';
import MapLegend from './MapLegend';
import ZoomControls, { fitPositionsToBounds } from './ZoomControls';
import { useMapUserInteraction } from './useMapUserInteraction';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme/theme';

// ── Map click events (react-leaflet has no eventHandlers on MapContainer) ────
function MapClickHandler({ onClick }: { onClick?: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: (e) => onClick?.(e),
  });
  return null;
}

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
// Only refits when the *set* of trucks/loads changes (boundsKey) so live GPS
// pings that move existing trucks don't re-zoom the map on every update.
// Once the user interacts with the map (drag, wheel, pinch, double-click or
// the zoom buttons) auto-fit hands over control so manual zooming sticks.
function FitBounds({
  positions,
  boundsKey,
}: {
  positions: [number, number][];
  boundsKey: string;
}) {
  const map = useMap();
  const userInteracted = useMapUserInteraction(map);

  useEffect(() => {
    if (positions.length === 0 || userInteracted.current) return;
    fitPositionsToBounds(map, positions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundsKey, map]);
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
  const { isDark } = useTheme();

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Compute all positions for bounds fitting (route endpoints are excluded so
  // selecting a truck doesn't re-zoom the map to fit the whole route).
  const allPositions = useMemo(() => {
    const positions: [number, number][] = [];
    trucks.forEach((t) => {
      if (t.lat && t.lng) positions.push([t.lat, t.lng]);
    });
    loads.forEach((l) => {
      if (l.origin_lat && l.origin_lng) positions.push([l.origin_lat, l.origin_lng]);
    });
    return positions;
  }, [trucks, loads]);

  // Stable key for auto-fit: only the *set* of trucks/loads (ids), so moving
  // markers don't trigger re-fits on every realtime update.
  const boundsKey = useMemo(() => {
    const truckIds = trucks.map((t) => t.driver_id).sort().join(',');
    const loadIds = loads.map((l) => l.id).sort().join(',');
    return `${truckIds}|${loadIds}`;
  }, [trucks, loads]);

  const markers = (
    <>
      {trucks.map((truck) => (
        <TruckMarker
          key={truck.driver_id}
          truck={truck}
          selected={truck.driver_id === selectedTruckId}
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
        style={{ height: '100%', width: '100%', position: 'relative' }}
        scrollWheelZoom
        touchZoom
        zoomControl={false}
      >
        <MapSizeHandler />
        <MapClickHandler onClick={onMapClick} />
        <ZoomControls positions={allPositions} />
        <TileLayer
          attribution={isDark
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
          url={tileUrl}
        />
        {allPositions.length > 0 && <FitBounds positions={allPositions} boundsKey={boundsKey} />}
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
