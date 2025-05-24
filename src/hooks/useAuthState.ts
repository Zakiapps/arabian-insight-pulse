import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserWithProfile, Profile } from '@/types/auth';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';

export const useAuthState = () => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle auth state changes
  const handleAuthStateChange = async (event: string, newSession: Session | null) => {
    console.log('Auth state changed:', event, newSession?.user?.email);
    setSession(newSession);
    
    if (event === 'SIGNED_IN' && newSession?.user) {
      const userProfile = await profileService.fetchUserProfile(newSession.user.id);
      setProfile(userProfile);
      setUser({ ...newSession.user, profile: userProfile });
      setLoading(false);
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
      setProfile(null);
      setLoading(false);
    } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
      // Keep existing profile during token refresh
      setUser(prev => prev ? { ...newSession.user, profile: prev.profile } : { ...newSession.user, profile: profile });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await authService.getSession();
        if (error) throw error;
        
        if (session?.user) {
          console.log('Initial session found for user:', session.user.email);
          setSession(session);
          
          // Fetch user profile
          const userProfile = await profileService.fetchUserProfile(session.user.id);
          setProfile(userProfile);
          setUser({ ...session.user, profile: userProfile });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    session,
    loading,
    setUser,
    setProfile
  };
};
