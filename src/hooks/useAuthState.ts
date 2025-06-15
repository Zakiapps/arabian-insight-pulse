
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
    let finished = false;

    const finishLoading = (source = "unknown") => {
      if (!finished && mounted) {
        finished = true;
        setLoading(false);
        console.log(`[useAuthState] Loading finished (${source})`);
      }
    };

    // Development fallback: Prevent infinite spinner
    const timeout = setTimeout(() => {
      console.warn("[useAuthState] Forcibly finishing loading state after 8s timeout");
      finishLoading("timeout");
    }, 8000);

    // Set up auth state listener first
    const { data: { subscription } } = authService.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      try {
        console.log("[useAuthState] Auth state change event:", event, !!newSession, newSession?.user?.email);
        if (event === 'SIGNED_IN' && newSession?.user) {
          setSession(newSession);
          if (newSession.user.email === 'admin@arabinsights.com') {
            setUser({ ...newSession.user, profile: null });
            setProfile(null);
            finishLoading("SIGNED_IN:admin");
          } else {
            try {
              const userProfile = await profileService.fetchUserProfile(newSession.user.id);
              if (!mounted) return;
              // If the profile is not found, treat as not fatal (user can still proceed)
              if (!userProfile) {
                setProfile(null);
                setUser({ ...newSession.user, profile: null });
                finishLoading("SIGNED_IN:user+no_profile_found");
              } else {
                setProfile(userProfile);
                setUser({ ...newSession.user, profile: userProfile });
                finishLoading("SIGNED_IN:user+profile");
              }
            } catch (error) {
              console.error("[useAuthState] Error fetching profile on SIGNED_IN", error);
              if (mounted) {
                setUser({ ...newSession.user, profile: null });
                setProfile(null);
                finishLoading("SIGNED_IN:user+no_profile_error");
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSession(null);
          finishLoading("SIGNED_OUT");
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          setSession(newSession);
          if (user) {
            setUser({ ...newSession.user, profile: user.profile });
          }
          finishLoading("TOKEN_REFRESHED");
        }
      } catch (err) {
        console.error("[useAuthState] Auth event handler error:", err);
        finishLoading("auth_event_error");
      }
    });

    // Get initial session
    const initAuth = async () => {
      try {
        console.log("[useAuthState] Checking initial session...");
        const { data: { session }, error } = await authService.getSession();
        if (error) throw error;
        if (!mounted) return;
        if (session?.user) {
          setSession(session);
          if (session.user.email === 'admin@arabinsights.com') {
            setUser({ ...session.user, profile: null });
            setProfile(null);
            finishLoading("init:admin");
          } else {
            try {
              const userProfile = await profileService.fetchUserProfile(session.user.id);
              if (!mounted) return;
              if (!userProfile) {
                setProfile(null);
                setUser({ ...session.user, profile: null });
                finishLoading("init:user+no_profile_found");
              } else {
                setProfile(userProfile);
                setUser({ ...session.user, profile: userProfile });
                finishLoading("init:user+profile");
              }
            } catch (profileError) {
              console.error("[useAuthState] Error fetching profile on INIT", profileError);
              if (mounted) {
                setUser({ ...session.user, profile: null });
                setProfile(null);
                finishLoading("init:user+no_profile_error");
              }
            }
          }
        } else {
          finishLoading("init:no_session");
        }
      } catch (error) {
        console.error("[useAuthState] INIT error:", error);
        setUser(null);
        setProfile(null);
        setSession(null);
        finishLoading("init:error");
      }
    };

    initAuth();

    return () => {
      mounted = false;
      clearTimeout(timeout);
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
