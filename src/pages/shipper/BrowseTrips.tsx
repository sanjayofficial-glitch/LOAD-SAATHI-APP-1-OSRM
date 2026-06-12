import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { createClerkSupabaseClient } from '@/utils/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Calendar, 
  ArrowRight, 
  IndianRupee,
  Filter,
  Truck,
  MapPin,
  Package as PackageIcon,
  AlertCircle,
  Plus,
  Clock
} from 'lucide-react';


import { calculateMatchScore, getMatchLabel } from '@/utils/matching';
import { formatDuration } from '@/utils/format';
import type { Trip } from '@/types';

const TripList = () => {
  const { userProfile } = useAuth();
  const { getToken } = useClerkAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    minCapacity: '',
    maxPrice: ''
  });

  // Fetch current shipper's pending shipment for match scoring
  const { data: myShipment } = useQuery({
    queryKey: ['myShipment', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id || userProfile.user_type !== 'shipper') return null;
      const token = await getToken({ template: 'supabase' });
      if (!token) return null;
      const supabase = createClerkSupabaseClient(token);
      const { data } = await supabase
        .from('shipments')
        .select('id, origin_city, destination_city, weight_tonnes, origin_state, destination_state, origin_lat, origin_lng, destination_lat, destination_lng, budget_per_tonne, departure_date, status')
        .eq('shipper_id', userProfile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data || null;
    },
    enabled: !!userProfile?.id && userProfile.user_type === 'shipper',
    staleTime: 30_000,
  });

  // Fetch active trips with React Query caching
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['activeTrips', filters.origin, filters.destination, filters.minCapacity, filters.maxPrice],
    queryFn: async () => {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('Authentication required');
      const supabase = createClerkSupabaseClient(token);

      let query = supabase
        .from('trips')
        .select(`
          id, origin_city, destination_city, origin_state, destination_state, origin_lat, origin_lng, destination_lat, destination_lng, available_capacity_tonnes, price_per_tonne, departure_date, created_at, trucker_id, status, estimated_distance_km, estimated_duration_min,
          trucker:users!trips_trucker_id_fkey(
            full_name,
            rating,
            total_trips
          )
        `)
        .eq('status', 'active')
        .order('departure_date', { ascending: true })
        .limit(50);

      if (filters.origin) {
        query = query.ilike('origin_city', `%${filters.origin}%`);
      }
      if (filters.destination) {
        query = query.ilike('destination_city', `%${filters.destination}%`);
      }
      if (filters.minCapacity) {
        query = query.gte('available_capacity_tonnes', parseFloat(filters.minCapacity));
      }
      if (filters.maxPrice) {
        query = query.lte('price_per_tonne', parseFloat(filters.maxPrice));
      }

      const { data, error } = await query;
      if (error) throw error;
      const mapped = (data || []).map((t: Record<string, unknown>) => ({
        ...t,
        trucker: Array.isArray(t.trucker) ? (t.trucker as Record<string, unknown>[])[0] : t.trucker
      }));
      return mapped as Trip[];
    },
    enabled: !!userProfile?.id,
    staleTime: 15_000,
  });

  const filteredTrips = useMemo(() => {
    return trips
      .filter(t => {
        const matchesSearch = !searchTerm || 
          t.origin_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.destination_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.trucker?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      })
      .map(t => ({
        ...t,
        _matchScore: myShipment ? calculateMatchScore({
          shipmentOriginCity: myShipment.origin_city,
          shipmentDestCity: myShipment.destination_city,
          tripOriginCity: t.origin_city,
          tripDestCity: t.destination_city,
          shipmentWeightTonnes: myShipment.weight_tonnes,
          tripCapacityTonnes: t.available_capacity_tonnes,
          shipmentOriginState: myShipment.origin_state,
          shipmentDestState: myShipment.destination_state,
          tripOriginState: t.origin_state,
          tripDestState: t.destination_state,
          shipmentOriginLat: myShipment.origin_lat,
          shipmentOriginLng: myShipment.origin_lng,
          tripOriginLat: t.origin_lat,
          tripOriginLng: t.origin_lng,
          shipmentDestLat: myShipment.destination_lat,
          shipmentDestLng: myShipment.destination_lng,
          tripDestLat: t.destination_lat,
          tripDestLng: t.destination_lng,
          shipmentBudgetPerTonne: myShipment.budget_per_tonne,
          tripPricePerTonne: t.price_per_tonne,
          shipmentDate: myShipment.departure_date,
          tripDate: t.departure_date,
          truckerRating: t.trucker?.rating,
        }) : 0
      }))
      .sort((a, b) => b._matchScore - a._matchScore);
  }, [trips, searchTerm, myShipment]);

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-orange-600 mb-4" />
        <p className="text-lg font-medium text-gray-900">Please log in to browse trucks</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 py-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-orange-100">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasActiveFilters = filters.origin || filters.destination || filters.minCapacity || filters.maxPrice;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Filters */}
      <Card className="border-orange-100 dark:border-orange-800 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-400" />
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search by city, trucker name..."
                className="pl-10 border-orange-100 dark:border-orange-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({ origin: '', destination: '', minCapacity: '', maxPrice: '' });
                  setSearchTerm('');
                }}
                className="border-gray-200 dark:border-gray-700"
              >
                Clear
              </Button>
              <Button 
                variant="outline" 
                className={`${hasActiveFilters ? 'border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {hasActiveFilters ? 'Applied' : ''}
              </Button>
            </div>
          </div>

          {/* Filter inputs collapsible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Origin</Label>
              <Input
                placeholder="e.g. Mumbai"
                value={filters.origin}
                onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
                className="border-orange-100 dark:border-orange-800"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Destination</Label>
              <Input
                placeholder="e.g. Delhi"
                value={filters.destination}
                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                className="border-orange-100 dark:border-orange-800"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Min Capacity</Label>
              <Input
                type="number"
                placeholder="e.g. 5"
                value={filters.minCapacity}
                onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })}
                className="border-orange-100 dark:border-orange-800"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Max Price</Label>
              <Input
                type="number"
                placeholder="e.g. 2000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="border-orange-100 dark:border-orange-800"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4">
        {filteredTrips.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="py-20 text-center">
              <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No trucks found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ origin: '', destination: '', minCapacity: '', maxPrice: '' })}
                  className="border-gray-200 dark:border-gray-700"
                >
                  Clear All Filters
                </Button>
                <Link to="/trucker/post-trip">
                  <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-md">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your Own Trip
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTrips.map((trip, i) => (
              <Card 
                key={trip.id} 
                className="border-orange-100 dark:border-orange-800 hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className="flex items-center text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                          <MapPin className="h-5 w-5 text-orange-500 mr-1.5 shrink-0" />
                          {trip.origin_city}
                          <ArrowRight className="h-4 w-4 mx-2 text-gray-300 dark:text-gray-600" />
                          {trip.destination_city}
                        </div>
                        <Badge 
                          variant={trip.status === 'active' ? 'default' : 'secondary'}
                          className="text-[10px] font-bold uppercase tracking-wider"
                        >
                          {trip.status}
                        </Badge>
                        {trip._matchScore > 0 && (() => {
                          const { label, color } = getMatchLabel(trip._matchScore);
                          return <Badge className={`${color} text-[10px] font-bold`}>{label}</Badge>;
                        })()}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2 text-orange-500 shrink-0" />
                          <span className="truncate">{new Date(trip.departure_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <PackageIcon className="h-4 w-4 mr-2 text-purple-500 shrink-0" />
                          <span>{trip.available_capacity_tonnes}t available</span>
                        </div>
                        <div className="flex items-center font-bold text-gray-900 dark:text-white">
                          <IndianRupee className="h-4 w-4 mr-1 text-green-500 shrink-0" />
                          ₹{trip.price_per_tonne.toLocaleString()} /t
                        </div>
                        {trip.estimated_distance_km && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <MapPin className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                            <span>{trip.estimated_distance_km.toLocaleString()} km</span>
                          </div>
                        )}
                        {trip.estimated_duration_min && !trip.estimated_distance_km && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                            <span>{formatDuration(trip.estimated_duration_min)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="bg-orange-100 dark:bg-orange-900/30 w-7 h-7 rounded-full flex items-center justify-center mr-2">
                          <Truck className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {trip.trucker?.full_name || 'Verified Trucker'}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                          {trip.trucker?.rating ? `⭐ ${trip.trucker.rating.toFixed(1)}` : 'New'}
                        </span>
                      </div>
                    </div>

                    <div className="md:w-44 flex flex-row md:flex-col gap-2">
                      <Button 
                        className="flex-1 md:w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trips/${trip.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripList;