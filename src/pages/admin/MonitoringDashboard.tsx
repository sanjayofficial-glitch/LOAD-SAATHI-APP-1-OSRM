import { useEffect, useState, useCallback, useRef } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { 
  Activity, 
  BarChart3, 
  RefreshCw, 
  ShieldCheck,
  Briefcase,
  Terminal,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserActivityTable from './UserActivityTable';
import CommandCenterMap, { type UserLocation } from './CommandCenterMap';
import SystemMetricsPanel from './SystemMetricsPanel';
import BusinessMetricsPanel from './BusinessMetricsPanel';
import LiveEventFeed from './LiveEventFeed';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User, Trip, Shipment } from '@/types';

interface Event {
  id: string;
  type: 'trip' | 'booking' | 'user' | 'chat' | 'alert';
  message: string;
  time: string;
  raw_date?: string;
}

const MonitoringDashboard = () => {
  const { getAuthenticatedClient } = useSupabase();
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [metrics, setMetrics] = useState({ 
    active_connections: 0, 
    api_response_time: 0, 
    error_rate: 0,
    active_requests: 0 
  });
  const [businessMetrics, setBusinessMetrics] = useState({
    total_shipments: 0,
    total_trips: 0,
    pending_requests: 0,
    accepted_requests: 0,
    estimated_revenue: 0,
    success_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const channelRef = useRef<ReturnType<SupabaseClient['channel']> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const queryTimes: number[] = [];
      const supabaseClient = await getAuthenticatedClient();
      supabaseRef.current = supabaseClient;

      // Fetch active users
      let qs = performance.now();
      const { data: userData } = await supabaseClient
        .from('users')
        .select('id, user_type, full_name, rating, total_trips, is_verified, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      queryTimes.push(performance.now() - qs);
      
      if (userData) setUsers(userData as unknown as User[]);

      // Fetch trips with trucker info
      qs = performance.now();
      const { data: tripData } = await supabaseClient
        .from('trips')
        .select('*, trucker:users!trips_trucker_id_fkey(full_name)')
        .order('created_at', { ascending: false });
      queryTimes.push(performance.now() - qs);
      
      if (tripData) setTrips(tripData);

      // Fetch shipments with shipper info
      qs = performance.now();
      const { data: shipmentData } = await supabaseClient
        .from('shipments')
        .select('*, shipper:users!shipments_shipper_id_fkey(full_name)')
        .order('created_at', { ascending: false });
      queryTimes.push(performance.now() - qs);
      
      if (shipmentData) setShipments(shipmentData);

      // Fetch live driver locations with user info
      qs = performance.now();
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: locationData } = await supabaseClient
        .from('driver_locations' as any)
        .select('driver_id, user_type, lat, lng, heading, speed, updated_at')
        .gte('updated_at', fiveMinAgo)
        .order('updated_at', { ascending: false });
      queryTimes.push(performance.now() - qs);

      // Enrich locations with user names from the users table
      if (locationData && locationData.length > 0) {
        const driverIds = locationData.map((l: any) => l.driver_id);
        const { data: locationUsers } = await supabaseClient
          .from('users')
          .select('id, full_name')
          .in('id', driverIds);

        const userNameMap = new Map<string, string>();
        locationUsers?.forEach((u: any) => userNameMap.set(u.id, u.full_name));

        const enrichedLocations: UserLocation[] = locationData.map((loc: any) => ({
          driver_id: loc.driver_id,
          user_type: loc.user_type || 'trucker',
          lat: loc.lat,
          lng: loc.lng,
          heading: loc.heading,
          speed: loc.speed,
          updated_at: loc.updated_at,
          full_name: userNameMap.get(loc.driver_id) || 'Unknown',
        }));

        // Cross-reference with active trips/shipments for on-trip status
        const activeTripTruckers = new Map<string, { origin_city: string; destination_city: string }>();
        trips.forEach(t => { if (t.trucker_id) activeTripTruckers.set(t.trucker_id, { origin_city: t.origin_city, destination_city: t.destination_city }); });
        const activeShipShippers = new Map<string, { origin_city: string; destination_city: string }>();
        if (shipmentData) shipmentData.forEach(s => { if (s.shipper_id) activeShipShippers.set(s.shipper_id, { origin_city: s.origin_city, destination_city: s.destination_city }); });

        enrichedLocations.forEach(loc => {
          if (loc.user_type === 'trucker' && activeTripTruckers.has(loc.driver_id)) {
            const trip = activeTripTruckers.get(loc.driver_id)!;
            loc.trip_id = 'active';
            loc.origin_city = trip.origin_city;
            loc.destination_city = trip.destination_city;
          } else if (loc.user_type === 'shipper' && activeShipShippers.has(loc.driver_id)) {
            const ship = activeShipShippers.get(loc.driver_id)!;
            loc.trip_id = 'active';
            loc.origin_city = ship.origin_city;
            loc.destination_city = ship.destination_city;
          }
        });

        setLocations(enrichedLocations);
      } else {
        setLocations([]);
      }

      // Calculate Business Metrics
      qs = performance.now();
      const { data: requests } = await supabaseClient.from('requests').select('status, weight_tonnes, trip:trips(price_per_tonne)');
      queryTimes.push(performance.now() - qs);
      
      const pending = requests?.filter(r => r.status === 'pending').length || 0;
      const accepted = requests?.filter(r => r.status === 'accepted') || [];
      const revenue = accepted.reduce((sum: number, r: { weight_tonnes: number; trip?: { price_per_tonne: number }[] | { price_per_tonne: number } }) => {
        const tripPrice = Array.isArray(r.trip) ? r.trip[0]?.price_per_tonne : (r.trip as { price_per_tonne?: number })?.price_per_tonne;
        return sum + (r.weight_tonnes * (tripPrice || 0));
      }, 0);
      const successRate = requests?.length ? Math.round((accepted.length / requests.length) * 100) : 0;

      setBusinessMetrics({
        total_shipments: shipmentData?.length || 0,
        total_trips: tripData?.length || 0,
        pending_requests: pending,
        accepted_requests: accepted.length,
        estimated_revenue: revenue,
        success_rate: successRate
      });

      // Compute system metrics from real data
      const avgLatency = queryTimes.length ? Math.round(queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length) : 0;
      const cancelledTrips = tripData?.filter(t => t.status === 'cancelled').length || 0;
      const totalTrips = tripData?.length || 0;
      const errorRate = totalTrips ? Math.round((cancelledTrips / totalTrips) * 100) : 0;
      const activeUsers = userData?.length || 0;

      setMetrics({
        active_connections: activeUsers,
        api_response_time: avgLatency,
        error_rate: errorRate,
        active_requests: pending
      });

      // Fetch historical events (more items, more types)
      const [{ data: hTrips }, { data: hShips }, { data: hRequests }] = await Promise.all([
        supabaseClient.from('trips').select('id, origin_city, destination_city, created_at').limit(10),
        supabaseClient.from('shipments').select('id, origin_city, created_at').limit(10),
        supabaseClient.from('requests').select('id, created_at, status').limit(10)
      ]);

      const formattedHist: Event[] = [
        ...(hTrips || []).map(t => ({
          id: `t-${t.id}`,
          type: 'trip' as const,
          message: `Trip activity: ${t.origin_city} → ${t.destination_city}`,
          time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          raw_date: t.created_at
        })),
        ...(hShips || []).map(s => ({
          id: `s-${s.id}`,
          type: 'booking' as const,
          message: `New load detected at ${s.origin_city}`,
          time: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          raw_date: s.created_at
        })),
        ...(hRequests || []).map(r => ({
          id: `r-${r.id}`,
          type: (r.status === 'accepted' ? 'booking' : r.status === 'pending' ? 'alert' : 'chat') as Event['type'],
          message: `Request ${r.status}: ${r.id.slice(0, 8)}...`,
          time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          raw_date: r.created_at
        }))
      ]
      .sort((a, b) => new Date(b.raw_date || '').getTime() - new Date(a.raw_date || '').getTime())
      .slice(0, 20);

      setEvents(formattedHist);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[Monitoring] Fetch error:', err);
      setError('Failed to fetch monitoring data. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [getAuthenticatedClient]);

  useEffect(() => {
    fetchData().then(() => {
      const client = supabaseRef.current;
      if (!client || channelRef.current) return;
      channelRef.current = client.channel('admin-monitoring')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_locations' as any }, () => fetchData())
        .subscribe();
    });

    const interval = setInterval(fetchData, 30000);

    return () => {
      clearInterval(interval);
      if (channelRef.current) {
        const client = supabaseRef.current;
        if (client) client.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchData]);

  return (
    <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-50 overflow-hidden">
      <header className="h-12 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-1 rounded-lg">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight uppercase">Command Center</h1>
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">System Live</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <span className="text-[9px] text-red-400 font-mono">{error}</span>
          )}
          <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">
            {lastUpdated.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={loading}
            className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[9px] uppercase tracking-widest h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="flex-grow overflow-hidden" style={{ minHeight: 0 }}>
        <ResizablePanelGroup direction="vertical" className="h-full" style={{ minHeight: 0 }}>
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="relative bg-slate-900" style={{ minHeight: 0, height: '100%' }}>
              <CommandCenterMap
                locations={locations}
                trips={trips}
                shipments={shipments}
                loading={loading}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-slate-800" />

          <ResizablePanel defaultSize={55}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={20} minSize={15}>
                <div className="h-full flex flex-col border-r border-slate-800 p-4 bg-slate-950/50">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">System</h2>
                  </div>
                  <ScrollArea className="flex-grow">
                    <SystemMetricsPanel metrics={metrics} />
                  </ScrollArea>
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle className="bg-slate-800" />

              <ResizablePanel defaultSize={20} minSize={15}>
                <div className="h-full flex flex-col border-r border-slate-800 p-4 bg-slate-950/50">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <Briefcase className="h-4 w-4 text-purple-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business</h2>
                  </div>
                  <ScrollArea className="flex-grow">
                    <BusinessMetricsPanel metrics={businessMetrics} />
                  </ScrollArea>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-slate-800" />

              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full flex flex-col border-r border-slate-800 p-4 bg-slate-950/50">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <Terminal className="h-4 w-4 text-green-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Console</h2>
                  </div>
                  <LiveEventFeed events={events} />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-slate-800" />

              <ResizablePanel defaultSize={30} minSize={25}>
                <div className="h-full flex flex-col p-4 bg-slate-950/50">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-400" />
                      <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Online Now</h2>
                    </div>
                    <Badge variant="outline" className="border-green-800 bg-green-900/20 text-green-400 font-mono text-[9px] px-1.5 py-0 flex items-center gap-1">
                      <Navigation className="h-2.5 w-2.5" />
                      {locations.length} LIVE
                    </Badge>
                  </div>
                  <UserActivityTable users={users} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default MonitoringDashboard;
