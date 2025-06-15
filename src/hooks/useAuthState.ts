
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserWithProfile, Profile } from '@/types/auth';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';

// Custom hook for Supabase auth state with profile loading and robust loading management
export const useAuthState = () => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const finishLoading = () => { if (mounted) setLoading(false); };

    // Set up auth state listener first
    const { data: { subscription } } = authService.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && newSession?.user) {
        setSession(newSession);
        if (newSession.user.email === 'admin@arabinsights.com') {
          setUser({ ...newSession.user, profile: null });
          setProfile(null);
          finishLoading();
        } else {
          try {
            const userProfile = await profileService.fetchUserProfile(newSession.user.id);
            if (mounted) {
              setProfile(userProfile);
              setUser({ ...newSession.user, profile: userProfile });
              finishLoading();
            }
          } catch (error) {
            if (mounted) {
              setUser({ ...newSession.user, profile: null });
              setProfile(null);
              finishLoading();
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSession(null);
        finishLoading();
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        setSession(newSession);
        if (user) {
          setUser({ ...newSession.user, profile: user.profile });
        }
      }
    });

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await authService.getSession();
        if (error) throw error;
        if (!mounted) return;
        if (session?.user) {
          setSession(session);
          if (session.user.email === 'admin@arabinsights.com') {
            setUser({ ...session.user, profile: null });
            setProfile(null);
          } else {
            try {
              const userProfile = await profileService.fetchUserProfile(session.user.id);
              if (mounted) {
                setProfile(userProfile);
                setUser({ ...session.user, profile: userProfile });
              }
            } catch (profileError) {
              if (mounted) {
                setUser({ ...session.user, profile: null });
                setProfile(null);
              }
            }
          }
        }
      } catch (error) {
        // On full failure, zero everything and stop loading
        setUser(null);
        setProfile(null);
        setSession(null);
      } finally {
        finishLoading();
      }
    };

    initAuth();

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
