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

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await authService.getSession();
        if (error) throw error;
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log('Initial session found for user:', session.user.email);
          setSession(session);
          
          // For admin users, we can continue without profile
          if (session.user.email === 'admin@arabinsights.com') {
            setUser({ ...session.user, profile: null });
            setProfile(null);
          } else {
            // For regular users, try to fetch profile
            try {
              const userProfile = await profileService.fetchUserProfile(session.user.id);
              if (mounted) {
                setProfile(userProfile);
                setUser({ ...session.user, profile: userProfile });
              }
            } catch (profileError) {
              console.error('Error fetching profile:', profileError);
              if (mounted) {
                setUser({ ...session.user, profile: null });
                setProfile(null);
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, newSession?.user?.email);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        setSession(newSession);
        
        // For admin users, we can continue without profile
        if (newSession.user.email === 'admin@arabinsights.com') {
          setUser({ ...newSession.user, profile: null });
          setProfile(null);
          setLoading(false);
        } else {
          // For regular users, try to fetch profile
          profileService.fetchUserProfile(newSession.user.id)
            .then((userProfile) => {
              if (mounted) {
                setProfile(userProfile);
                setUser({ ...newSession.user, profile: userProfile });
                setLoading(false);
              }
            })
            .catch((error) => {
              console.error('Error fetching profile after sign in:', error);
              if (mounted) {
                setUser({ ...newSession.user, profile: null });
                setProfile(null);
                setLoading(false);
              }
            });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSession(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        setSession(newSession);
        // Keep existing user and profile during token refresh
        if (user) {
          setUser({ ...newSession.user, profile: user.profile });
        }
      }
    });

    return () => {
      mounted = false;
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
