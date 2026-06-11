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
  Loader2, 
  IndianRupee,
  Filter,
  Truck,
  MapPin,
  Package as PackageIcon,
  AlertCircle,
  Plus,
  Clock
} from 'lucide-react';
import { showError } from '@/utils/toast';
import { calculateMatchScore, getMatchLabel } from '@/utils/matching';
import { formatDuration } from '@/utils/format';

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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="border-orange-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by city, trucker name..."
                className="pl-10 border-orange-100"
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
                className="border-gray-200"
              >
                Clear
              </Button>
              <Button 
                variant="outline" 
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                disabled
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters Applied
              </Button>
            </div>
          </div>

          {/* Filter inputs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Origin</Label>
              <Input
                placeholder="e.g. Mumbai"
                value={filters.origin}
                onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
                className="border-orange-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Destination</Label>
              <Input
                placeholder="e.g. Delhi"
                value={filters.destination}
                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                className="border-orange-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Min Capacity</Label>
              <Input
                type="number"
                placeholder="e.g. 5"
                value={filters.minCapacity}
                onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })}
                className="border-orange-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Max Price</Label>
              <Input
                type="number"
                placeholder="e.g. 2000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="border-orange-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4">
        {filteredTrips.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-20 text-center">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trucks found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ origin: '', destination: '', minCapacity: '', maxPrice: '' })}
                  className="border-gray-200"
                >
                  Clear All Filters
                </Button>
                <Link to="/trucker/post-trip">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your Own Trip
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTrips.map((trip) => (
              <Card 
                key={trip.id} 
                className="border-orange-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center text-xl font-bold text-gray-900">
                          <MapPin className="h-5 w-5 text-orange-600 mr-2" />
                          {trip.origin_city}
                          <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                          {trip.destination_city}
                        </div>
                        <Badge 
                          variant={trip.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs font-semibold"
                        >
                          {trip.status.toUpperCase()}
                        </Badge>
                        {trip._matchScore > 0 && (() => {
                          const { label, color } = getMatchLabel(trip._matchScore);
                          return <Badge className={`${color} text-xs font-semibold ml-1`}>{label}</Badge>;
                        })()}
                      </div>                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                          <span>{new Date(trip.departure_date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center">
                          <PackageIcon className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{trip.available_capacity_tonnes}t</span>
                        </div>
                        <div className="flex items-center">
                          <IndianRupee className="h-4 w-4 mr-1 text-green-600" />
                          <span className="font-semibold">₹{trip.price_per_tonne.toLocaleString()} /t</span>
                        </div>
                        {trip.estimated_distance_km && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm text-gray-600">{trip.estimated_distance_km.toLocaleString()} km</span>
                          </div>
                        )}
                        {trip.estimated_duration_min && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm text-gray-600">
                              {formatDuration(trip.estimated_duration_min)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center md:col-span-4">
                          <Truck className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {trip.trucker?.full_name || 'Verified Trucker'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {trip.trucker?.rating ? `⭐ ${trip.trucker.rating.toFixed(1)} Rating` : 'No ratings yet'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-48 flex flex-col gap-2">
                      <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700"
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