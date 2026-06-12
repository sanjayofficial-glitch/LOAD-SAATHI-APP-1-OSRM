"use client";

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Package, CheckCircle, ArrowRight, Calendar, IndianRupee, Star, Shield, Zap } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import IndexSkeleton from '@/components/IndexSkeleton';
import OfflineBanner from '@/components/OfflineBanner';
import ThemeToggle from '@/components/ThemeToggle';
import { Trip } from '@/types';

const Index = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [tripsLoaded, setTripsLoaded] = useState(false);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);


  useEffect(() => {
    const fetchRecentTrips = async () => {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('id, origin_city, destination_city, departure_date, price_per_tonne, status, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (!error && data) {
          setRecentTrips(data as unknown as Trip[]);
        }
      } catch (err) {
        console.error("Error fetching trips for landing page:", err);
      } finally {
        setTripsLoaded(true);
      }
    };

    fetchRecentTrips();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      navigate('/auth-sync', { replace: true });
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  if (!tripsLoaded || !isLoaded) {
    return <IndexSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <OfflineBanner />
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl shadow-md">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">LoadSaathi</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link to="/login" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-3 sm:px-5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Login</Link>
              <Link to="/register" className="text-sm sm:text-base bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all font-medium shadow-md hover:shadow-lg whitespace-nowrap">
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" />
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #f97316 0%, transparent 50%), radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`
          }} />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="py-16 sm:py-20 md:py-28 max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6 sm:mb-8 animate-fade-in">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                India's First Truck Space Marketplace
              </div>
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6 leading-[1.1] tracking-tight text-balance animate-fade-in-up">
                India's Truck Space
                <span className="block mt-2 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Marketplace</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                Connect directly with truckers and shippers. Fill empty truck space, save on freight costs — no middlemen, no commission.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <Link to="/register?type=shipper" className="group bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  Find Trucks <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/register?type=trucker" className="group bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border-2 border-orange-600 dark:border-orange-500 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-orange-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                  Earn Extra <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="mt-8 sm:mt-12 flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-400 dark:text-gray-500 animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center gap-1.5"><Shield className="h-3 w-3 sm:h-4 sm:w-4" /> Verified Partners</div>
                <div className="flex items-center gap-1.5"><Star className="h-3 w-3 sm:h-4 sm:w-4" /> 10K+ Trips Completed</div>
                <div className="flex items-center gap-1.5"><IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" /> No Commission</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 dark:from-orange-800 dark:via-orange-700 dark:to-orange-800">
          <div className="container mx-auto px-4 py-10 sm:py-14">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 text-center">
              {[
                { value: "12M+", label: "Trucks in India" },
                { value: "30%", label: "Empty Return Rate" },
                { value: "₹15K", label: "Extra Earnings/Trip" },
                { value: "50%", label: "Cost Savings" },
              ].map((stat, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-sm">{stat.value}</div>
                  <div className="text-orange-100 font-semibold uppercase tracking-widest text-[10px] sm:text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Trips */}
        {recentTrips.length > 0 && (
          <section className="container mx-auto px-4 py-16 sm:py-20">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">Recently Posted Trips</h2>
              <p className="text-gray-500 dark:text-gray-400">Available space on trucks heading your way</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {recentTrips.map((trip, i) => (
                <div key={trip.id} className="group bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 p-2.5 sm:p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                          {trip.origin_city} → {trip.destination_city}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{trip.vehicle_type || 'Available Truck'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 dark:text-orange-400 shrink-0" /> 
                      <span>{new Date(trip.departure_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600 dark:text-blue-400 shrink-0" /> 
                      Available space
                    </div>
                    <div className="flex items-center font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                      <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 mr-1 shrink-0" /> {trip.price_per_tonne.toLocaleString()} /tonne
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="bg-gray-50 dark:bg-gray-900/50 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">How LoadSaathi Works</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">A simple, transparent marketplace for India's logistics ecosystem.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
              <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-700 transition-all hover:shadow-lg">
                <div className="flex items-center mb-6 sm:mb-8">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl mr-4 sm:mr-5">
                    <Truck className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">For Truckers</h3>
                </div>
                <ul className="space-y-3 sm:space-y-5">
                  {['Post your trip with available space', 'Set your price per tonne', 'Receive booking requests instantly', 'Accept or decline as you prefer', "Get shipper's contact after acceptance", 'Earn extra on empty return trips'].map((item, idx) => (
                    <li key={idx} className="flex items-start animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3 sm:mr-4 mt-0.5 shrink-0">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 transition-all hover:shadow-lg">
                <div className="flex items-center mb-6 sm:mb-8">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl mr-4 sm:mr-5">
                    <Package className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">For Shippers</h3>
                </div>
                <ul className="space-y-3 sm:space-y-5">
                  {['Search available trucks by route', 'Filter by date, capacity, price', 'View trucker ratings and details', 'Send booking requests with one click', 'Pay only for space you need', 'Save up to 50% vs full truck'].map((item, idx) => (
                    <li key={idx} className="flex items-start animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3 sm:mr-4 mt-0.5 shrink-0">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-8 sm:pb-12 mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-6 sm:mb-8 md:mb-0">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white">LoadSaathi</span>
            </div>
            <div className="flex gap-6 sm:gap-8 text-sm sm:text-base text-gray-400 font-medium">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} LoadSaathi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
