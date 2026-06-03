"use client";

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { createClerkSupabaseClient } from '@/utils/supabaseClient';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Truck, 
  Clock, 
  TrendingUp, 
  IndianRupee, 
  PlusCircle, 
  Search, 
  ArrowRight,
  Package,
  Calendar,
  Star as StarIcon,
  WifiOff
} from 'lucide-react';
import { showError } from '@/utils/toast';

const TruckerDashboard = () => {
  const { userProfile } = useAuth();
  const { getToken } = useClerkAuth();
  const { isOnline } = useNetworkStatus();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeTrips: 0,
    pendingRequests: 0,
    completedTrips: 0,
    totalEarnings: 0
  });

  const fetchDashboardData = useCallback(async () => {
    if (!userProfile?.id) return;

    try {
      const supabaseToken = await getToken({ template: 'supabase' });
      if (!supabaseToken) throw new Error('No Supabase token');
      
      const supabase = createClerkSupabaseClient(supabaseToken);

      const { count: activeCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('trucker_id', userProfile.id)
        .eq('status', 'active');

      const { count: pendingBookingCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userProfile.id)
        .eq('status', 'pending');

      const { count: completedCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('trucker_id', userProfile.id)
        .eq('status', 'completed');

      const { data: bookingEarnings } = await supabase
        .from('requests')
        .select('weight_tonnes, trip:trips(price_per_tonne)')
        .eq('receiver_id', userProfile.id)
        .eq('status', 'accepted');

      const { data: offerEarnings } = await supabase
        .from('shipment_requests')
        .select('proposed_price_per_tonne, shipment:shipments(weight_tonnes)')
        .eq('trucker_id', userProfile.id)
        .eq('status', 'accepted');

      const totalEarnings = (
        (bookingEarnings?.reduce((sum, r: any) => sum + (r.weight_tonnes * (r.trip?.price_per_tonne || 0)), 0) || 0) +
        (offerEarnings?.reduce((sum, o: any) => sum + ((o.proposed_price_per_tonne || 0) * (o.shipment?.weight_tonnes || 0)), 0) || 0)
      );

      setStats({
        activeTrips: activeCount || 0,
        pendingRequests: pendingBookingCount || 0,
        completedTrips: completedCount || 0,
        totalEarnings
      });
    } catch (err: any) {
      console.error('[TruckerDashboard] Error:', err);
      showError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id, getToken]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Trucker Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Welcome, {userProfile?.full_name || 'Partner'}! {isOnline ? (
              <>You have <span className="text-orange-600 font-bold">{stats.activeTrips}</span> active trips.</>
            ) : (
              <span className="text-yellow-600">You are offline. Showing cached data.</span>
            )}
          </p>
        </div>
        <div className="bg-yellow-50 px-3 sm:px-4 py-2 rounded-2xl border border-yellow-100 flex items-center gap-2 self-start sm:self-auto">
          <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="text-sm font-black text-yellow-700">{userProfile?.rating?.toFixed(1) || '0.0'} Partner Rating</span>
        </div>
      </div>

      {!isOnline && (
        <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-yellow-800">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>You are offline. Data shown may be out of date.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="border-orange-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Trips</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.activeTrips}</div>}
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.pendingRequests}</div>}
          </CardContent>
        </Card>

        <Card className="border-green-50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.completedTrips}</div>}
          </CardContent>
        </Card>

        <Card className="border-green-50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Earnings</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-green-600">
                ₹{stats.totalEarnings.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
        <Card className="border-orange-200 shadow-md">
          <CardHeader className="bg-orange-50/50 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl font-black text-gray-900">Partner Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 px-4 sm:px-6">
            <Link to="/trucker/post-trip" className="block">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12 sm:h-14 text-base sm:text-lg font-bold shadow-sm" disabled={!isOnline}>
                <PlusCircle className="mr-2 h-5 w-5" /> Post New Trip
              </Button>
            </Link>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/trucker/browse-shipments">
                <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 h-10 sm:h-12 font-bold text-sm sm:text-base">
                  <Search className="mr-2 h-4 w-4" /> Find Loads
                </Button>
              </Link>
              <Link to="/trucker/my-trips">
                <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 h-10 sm:h-12 font-bold text-sm sm:text-base">
                  <Truck className="mr-2 h-4 w-4" /> Manage Trips
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl font-black text-gray-900">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-4 sm:px-6">
            <div className="space-y-3">
              <Link to="/trucker/my-trips?tab=incoming" className="flex items-center justify-between p-3 sm:p-4 hover:bg-orange-50 rounded-2xl transition-all group border border-transparent hover:border-orange-100">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="bg-orange-100 p-2 rounded-xl group-hover:bg-orange-600 transition-colors shrink-0"><Package className="h-5 w-5 text-orange-600 group-hover:text-white" /></div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm sm:text-base truncate">Booking Requests</p>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest truncate">Incoming from shippers</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-200 group-hover:text-orange-600 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
              <Link to="/trucker/history" className="flex items-center justify-between p-3 sm:p-4 hover:bg-orange-50 rounded-2xl transition-all group border border-transparent hover:border-orange-100">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-600 transition-colors shrink-0"><Calendar className="h-5 w-5 text-blue-600 group-hover:text-white" /></div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm sm:text-base truncate">Work History</p>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest truncate">Past trips and earnings</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-200 group-hover:text-orange-600 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TruckerDashboard;
