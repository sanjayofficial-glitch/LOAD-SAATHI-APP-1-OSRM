import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useSession } from '@clerk/clerk-react';
import { Loader2, User, Truck, CheckCircle2 } from 'lucide-react';
import { createClerkSupabaseClient } from '@/utils/supabaseClient';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserType } from '@/types';

const ChooseRole = () => {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const { setProfile, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('users')
          .update({
            user_type: role,
            full_name: user.fullName || '',
          })
          .eq('id', user.id);
      } else {
        result = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            user_type: role,
            full_name: user.fullName || '',
            phone: user.primaryPhoneNumber?.phoneNumber || '',
            rating: 0,
            total_trips: 0,
          });
      }

      if (result.error) throw result.error;

      // Set profile synchronously in context before navigating
      // This ensures RoleProtectedRoute sees the role immediately
      const profileData: UserType = {
        id: user.id,
        user_type: role,
        full_name: user.fullName || '',
        phone: user.primaryPhoneNumber?.phoneNumber || '',
        rating: 0,
        total_trips: 0,
        is_verified: false,
        created_at: new Date().toISOString(),
      };
      setProfile(profileData);

      showSuccess(`Welcome ${role === 'shipper' ? 'Shipper' : 'Trucker'}!`);

      const targetPath = role === 'shipper' ? '/shipper/dashboard' : '/trucker/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to set role';
      console.error('[ChooseRole] Error:', err);
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Wait for Clerk to load
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="max-w-2xl w-full mx-auto animate-scale-in">
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30">
            <Truck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Welcome to LoadSaathi!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">How will you be using the platform today?</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-sm text-center animate-fade-in">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-xl mx-auto">
          <button
            onClick={() => handleRoleSelection('shipper')}
            disabled={loading}
            className="group relative flex flex-col items-center text-center bg-white dark:bg-gray-900 hover:border-blue-500 dark:hover:border-blue-500 border-2 border-gray-100 dark:border-gray-800 transition-all p-8 rounded-2xl shadow-sm hover:shadow-xl disabled:opacity-50 hover:-translate-y-1 duration-300"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <User className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">I am a Shipper</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              I have goods to transport and want to find reliable trucks at the best prices.
            </p>
            <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-all">
              Select Shipper <CheckCircle2 className="ml-2 h-4 w-4" />
            </div>
          </button>

          <button
            onClick={() => handleRoleSelection('trucker')}
            disabled={loading}
            className="group relative flex flex-col items-center text-center bg-white dark:bg-gray-900 hover:border-orange-500 dark:hover:border-orange-500 border-2 border-gray-100 dark:border-gray-800 transition-all p-8 rounded-2xl shadow-sm hover:shadow-xl disabled:opacity-50 hover:-translate-y-1 duration-300"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Truck className="h-10 w-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">I am a Trucker</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              I have a truck and want to find loads to fill my empty space and earn more.
            </p>
            <div className="mt-6 flex items-center text-orange-600 dark:text-orange-400 font-bold opacity-0 group-hover:opacity-100 transition-all">
              Select Trucker <CheckCircle2 className="ml-2 h-4 w-4" />
            </div>
          </button>
        </div>

        {loading && (
          <div className="mt-12 text-center animate-fade-in">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Setting up your personalized dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseRole;