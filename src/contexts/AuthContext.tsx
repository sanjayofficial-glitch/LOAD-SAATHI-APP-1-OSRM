"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser, useSession, useClerk } from '@clerk/clerk-react';
import { createClerkSupabaseClient } from '@/utils/supabaseClient';
import { User } from '@/types';
import { posthog } from '@/utils/posthog';

interface AuthContextType {
  user: ReturnType<typeof useUser>['user'];
  session: ReturnType<typeof useSession>['session'];
  userProfile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: User) => void;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { session } = useSession();
  const clerk = useClerk();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return null;
    }

    try {
      const supabaseToken = await session?.getToken({ template: 'supabase' });
      if (!supabaseToken) {
        console.warn('[AuthContext] No Supabase token returned from Clerk');
        setUserProfile(null);
        setLoading(false);
        return null;
      }

      const supabaseClient = createClerkSupabaseClient(supabaseToken);
      const { data, error } = await supabaseClient
        .from('users')
        .select('id, user_type, full_name, phone, rating, total_trips, is_verified, created_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Error fetching profile:', error);
        setUserProfile(null);
        setLoading(false);
        return null;
      }

      if (data) {
        const profile: User = {
          id: data.id,
          user_type: data.user_type || null,
          full_name: data.full_name || '',
          phone: data.phone || '',
          rating: data.rating || 0,
          total_trips: data.total_trips || 0,
          is_verified: data.is_verified || false,
          created_at: data.created_at || new Date().toISOString(),
        };
        setUserProfile(profile);
        setLoading(false);
        return profile;
      }

      setUserProfile(null);
      setLoading(false);
      return null;
    } catch (err) {
      console.error('[AuthContext] Error:', err);
      setUserProfile(null);
      setLoading(false);
      return null;
    }
  }, [user?.id, session]);

  useEffect(() => {
    if (!clerkLoaded) return;
    fetchProfile();
  }, [clerkLoaded, fetchProfile]);

  useEffect(() => {
    if (!user?.id) return;

    posthog.identify(user.id, {
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName,
      role: userProfile?.user_type || undefined,
    });
  }, [user?.id, user?.primaryEmailAddress?.emailAddress, user?.fullName, userProfile?.user_type]);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    await fetchProfile();
  }, [fetchProfile]);

  const setProfile = useCallback((profile: User) => {
    setUserProfile(profile);
    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    await clerk.signOut();
    posthog.reset();
    setUserProfile(null);
  }, [clerk]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await clerk.client?.signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      return { error: null };
    } catch (err) {
      console.error('[AuthContext] resetPassword error:', err);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, [clerk.client]);

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading: !clerkLoaded || loading,
    signOut,
    refreshProfile,
    setProfile,
    resetPassword,
    isLoaded: clerkLoaded,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
