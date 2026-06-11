"use client";

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { createClerkSupabaseClient } from '@/utils/supabaseClient';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { 
  Package, 
  Search, 
  Clock, 
  TrendingUp, 
  PlusCircle, 
  DollarSign, 
  Calendar, 
  Truck,
  ArrowRight,
  WifiOff
} from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </CardHeader>
    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
      <Skeleton className="h-8 w-16 mt-1" />
    </CardContent>
  </Card>
);

const ShipperDashboard = () => {
  const { userProfile } = useAuth();
  const { getToken } = useClerkAuth();
  const { isOnline } = useNetworkStatus();
  const [stats, setStats] = useState({ 
    activeShipments: 0, 
    pendingRequests: 0, 
    completedShipments: 0,
    totalSpent: 0,
    upcomingShipments: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!userProfile?.id) return;
    try {
      const supabaseToken = await getToken({ template: 'supabase' });
      if (!supabaseToken) throw new Error('No Supabase token');
      const supabase = createClerkSupabaseClient(supabaseToken);

      const { count: activeCount } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('shipper_id', userProfile.id)
        .eq('status', 'pending');
      
      const { count: completedCount } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('shipper_id', userProfile.id)
        .eq('status', 'completed');
      
      const { count: pendingOffersCount } = await supabase
        .from('shipment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('shipper_id', userProfile.id)
        .eq('status', 'pending');

      const { data: requestSpent } = await supabase
        .from('requests')
        .select('weight_tonnes, trip:trips(price_per_tonne)')
        .eq('shipper_id', userProfile.id)
        .eq('status', 'accepted');

      const { data: offerSpent } = await supabase
        .from('shipment_requests')
        .select('proposed_price_per_tonne, shipment:shipments(weight_tonnes)')
        .eq('shipper_id', userProfile.id)
        .eq('status', 'accepted');

      const totalSpent = (
        (requestSpent?.reduce((sum, r: any) => sum + (r.weight_tonnes * (r.trip?.price_per_tonne || 0)), 0) || 0) +
        (offerSpent?.reduce((sum, o: any) => sum + ((o.proposed_price_per_tonne || 0) * (o.shipment?.weight_tonnes || 0)), 0) || 0)
      );

      const { data: upcoming } = await supabase
        .from('shipments')
        .select('id, origin_city, destination_city, goods_description, weight_tonnes, departure_date, status')
        .eq('shipper_id', userProfile.id)
        .eq('status', 'pending')
        .order('departure_date', { ascending: true })
        .limit(3);

      setStats({ 
        activeShipments: activeCount || 0, 
        pendingRequests: pendingOffersCount || 0, 
        completedShipments: completedCount || 0,
        totalSpent,
        upcomingShipments: upcoming || []
      });
    } catch (err: any) {
      console.error('[ShipperDashboard] Error:', err);
      showError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id, getToken]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleCancelShipment = async (shipmentId: string) => {
    if (!isOnline) {
      showError('You are offline. Cannot cancel shipment.');
      return;
    }
    try {
      const supabaseToken = await getToken({ template: 'supabase' });
      if (!supabaseToken) throw new Error('No Supabase token');
      const supabase = createClerkSupabaseClient(supabaseToken);
      
      const { error } = await supabase
        .from('shipments')
        .update({ status: 'cancelled' })
        .eq('id', shipmentId);
        
      if (error) throw error;
      showSuccess('Shipment cancelled successfully');
      loadStats();
    } catch (err: any) {
      showError('Failed to cancel shipment');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Shipper Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Welcome back, {userProfile?.full_name || 'Shipper'}! {isOnline ? 'Manage your loads and find the best trucks.' : <span className="text-yellow-600">You are offline. Showing cached data.</span>}
        </p>
      </div>

      {!isOnline && (
        <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-yellow-800">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>You are offline. Data shown may be out of date.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Loads</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.activeShipments}</div>
              </CardContent>
            </Card>
            <Card className="border-yellow-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Offers</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.pendingRequests}</div>
              </CardContent>
            </Card>
            <Card className="border-green-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.completedShipments}</div>
              </CardContent>
            </Card>
            <Card className="border-green-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-2xl sm:text-3xl font-black text-green-600">₹{stats.totalSpent.toLocaleString()}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12">
        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-blue-50/30 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl font-black text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 px-4 sm:px-6">
            <Link to="/shipper/post-shipment" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 sm:h-14 text-base sm:text-lg font-bold shadow-sm" disabled={!isOnline}>
                <PlusCircle className="mr-2 h-5 w-5" /> Post New Load
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/browse-trucks">
                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 h-10 sm:h-12 font-bold text-sm sm:text-base">
                  <Search className="mr-2 h-4 w-4" /> Find Trucks
                </Button>
              </Link>
              <Link to="/shipper/my-shipments">
                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 h-10 sm:h-12 font-bold text-sm sm:text-base">
                  <Package className="mr-2 h-4 w-4" /> My Loads
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl font-black text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-4 sm:px-6">
            <div className="space-y-4">
              <Link to="/shipper/my-shipments?tab=incoming" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-orange-100 p-2 rounded-lg shrink-0"><Clock className="h-4 w-4 text-orange-600" /></div>
                  <span className="font-bold text-gray-700 text-sm sm:text-base truncate">Check Incoming Offers</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 transition-colors shrink-0" />
              </Link>
              <Link to="/shipper/history" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-blue-100 p-2 rounded-lg shrink-0"><Calendar className="h-4 w-4 text-blue-600" /></div>
                  <span className="font-bold text-gray-700 text-sm sm:text-base truncate">View Activity History</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 transition-colors shrink-0" />
              </Link>
              <Link to="/profile" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-gray-100 p-2 rounded-lg shrink-0"><Truck className="h-4 w-4 text-gray-600" /></div>
                  <span className="font-bold text-gray-700 text-sm sm:text-base truncate">Update Profile Settings</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 transition-colors shrink-0" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {!loading && stats.upcomingShipments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Upcoming Shipments</h2>
          <div className="grid gap-4">
            {stats.upcomingShipments.map((shipment: any) => (
              <Card key={shipment.id} className="border-blue-100 hover:shadow-md transition-shadow group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-50 p-2 sm:p-3 rounded-2xl group-hover:bg-blue-100 transition-colors shrink-0">
                          <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg sm:text-xl font-black text-gray-900 truncate">
                            {shipment.origin_city} → {shipment.destination_city}
                          </h3>
                          <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(shipment.departure_date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {shipment.weight_tonnes}t load</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100/50">
                        {shipment.goods_description}
                      </p>
                    </div>
                    <div className="sm:w-48 bg-blue-50/30 p-4 sm:p-6 flex flex-row sm:flex-col justify-center gap-2 border-t sm:border-t-0 sm:border-l border-blue-50">
                      <Link to={`/shipper/shipments/${shipment.id}`} className="flex-1 sm:flex-none">
                        <Button className="w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm text-sm">
                          Details
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCancelShipment(shipment.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 text-sm"
                        disabled={!isOnline}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {!loading && stats.upcomingShipments.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 sm:p-12 text-center">
          <div className="bg-gray-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">No upcoming shipments</h3>
          <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-sm mx-auto">
            You don't have any active loads posted. Start by creating a new shipment request.
          </p>
          <Link to="/shipper/post-shipment" className="inline-block mt-6 sm:mt-8">
            <Button className="bg-orange-600 hover:bg-orange-700 shadow-md text-sm sm:text-base">
              Create My First Shipment
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ShipperDashboard;
