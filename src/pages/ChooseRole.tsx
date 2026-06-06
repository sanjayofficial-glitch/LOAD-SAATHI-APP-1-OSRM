import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useSession } from '@clerk/clerk-react';
import { Loader2, User, Truck, CheckCircle2 } from 'lucide-react';
import { createClerkSupabaseClient } from '@/utils/supabaseClient';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

const ChooseRole = () => {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const { refreshProfile, userProfile, loading: profileLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stalled, setStalled] = useState(false);

  // If Clerk takes too long, show a fallback instead of infinite spinner
  useEffect(() => {
    if (isLoaded && user) {
      setStalled(false);
      return;
    }
    const timer = setTimeout(() => setStalled(true), 8000);
    return () => clearTimeout(timer);
  }, [isLoaded, user]);

  // Redirect if user already has a role
  useEffect(() => {
    if (userProfile?.user_type) {
      let targetPath = '/';
      if (userProfile.user_type === 'shipper') targetPath = '/shipper/dashboard';
      else if (userProfile.user_type === 'trucker') targetPath = '/trucker/dashboard';
      else if (userProfile.user_type === 'admin') targetPath = '/admin/monitoring';
      
      navigate(targetPath, { replace: true });
    }
  }, [userProfile, navigate]);

  const handleRoleSelection = async (role: 'shipper' | 'trucker') => {
    if (!user || !session) return;

    setLoading(true);
    setError(null);

    try {
      const supabaseToken = await session.getToken({ template: 'supabase' });
      if (!supabaseToken) throw new Error('No Supabase token available');

      const supabase = createClerkSupabaseClient(supabaseToken);

      const profile = {
        clerk_user_id: user.id,
        user_type: role,
        full_name: user.fullName || '',
        phone: user.primaryPhoneNumber?.phoneNumber || '',
        rating: 0,
        total_trips: 0,
      };

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      const genId = () => { try { return crypto.randomUUID(); } catch { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }); } };

      let result;
      if (existing) {
        result = await supabase.from('profiles').update(profile).eq('id', existing.id);
      } else {
        result = await supabase.from('profiles').insert({ id: genId(), ...profile, created_at: new Date().toISOString() });
      }

      if (result.error) throw result.error;

      // Crucial: Refresh the profile in our context so the app knows the new role immediately
      await refreshProfile();

      showSuccess(`Welcome ${role === 'shipper' ? 'Shipper' : 'Trucker'}!`);

      // Use a small delay to ensure state is updated before navigation
      setTimeout(() => {
        const targetPath = role === 'shipper' ? '/shipper/dashboard' : '/trucker/dashboard';
        navigate(targetPath, { replace: true });
      }, 100);
    } catch (err: any) {
      console.error('[ChooseRole] Error:', err);
      setError(err.message || 'Failed to set role');
      showError(err.message || 'Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  // Wait for profile to load before showing buttons (prevents flash-redirect)
  if (!isLoaded || !user || (profileLoading && !userProfile)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Verifying account...</p>
          {stalled && (
            <div className="mt-4 animate-in fade-in">
              <p className="text-xs text-gray-400 mb-3">This is taking longer than expected.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-orange-600 hover:text-orange-700 underline underline-offset-2"
              >
                Refresh the page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50 px-4">
      <div className="max-w-2xl w-full mx-auto">
        <div className="text-center mb-12">
          <div className="bg-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Truck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to LoadSaathi!</h1>
          <p className="text-lg text-gray-600 mb-4">How will you be using the platform today?</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-xl mx-auto">
          <button
            onClick={() => handleRoleSelection('shipper')}
            disabled={loading}
            className="group relative flex flex-col items-center text-center bg-white hover:border-orange-500 border-2 border-transparent transition-all p-8 rounded-2xl shadow-sm hover:shadow-xl disabled:opacity-50"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I am a Shipper</h2>
            <p className="text-sm text-gray-500 mt-2">
              I have goods to transport and want to find reliable trucks at the best prices.
            </p>
            <div className="mt-6 flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Select Shipper <CheckCircle2 className="ml-2 h-4 w-4" />
            </div>
          </button>

          <button
            onClick={() => handleRoleSelection('trucker')}
            disabled={loading}
            className="group relative flex flex-col items-center text-center bg-white hover:border-orange-500 border-2 border-transparent transition-all p-8 rounded-2xl shadow-sm hover:shadow-xl disabled:opacity-50"
          >
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Truck className="h-10 w-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I am a Trucker</h2>
            <p className="text-sm text-gray-500 mt-2">
              I have a truck and want to find loads to fill my empty space and earn more.
            </p>
            <div className="mt-6 flex items-center text-orange-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Select Trucker <CheckCircle2 className="ml-2 h-4 w-4" />
            </div>
          </button>
        </div>

        {loading && (
          <div className="mt-12 text-center animate-in fade-in">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Setting up your personalized dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseRole;