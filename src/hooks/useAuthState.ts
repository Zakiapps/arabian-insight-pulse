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

  // Set up auth state listener FIRST; on every auth event, quickly update session/user
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

    // Dev fallback
    const timeout = setTimeout(() => {
      console.warn("[useAuthState] Forcibly finishing loading state after 8s timeout");
      finishLoading("timeout");
    }, 8000);

    // Set up auth change listener - update user and session synchronously
    const { data: { subscription } } = authService.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      console.log("[useAuthState] Auth state change event:", event, !!newSession, newSession?.user?.email);
      setSession(newSession);
      if (newSession?.user) {
        setUser({ ...newSession.user, profile: null }); // Profile fetched below
      } else {
        setUser(null);
        setProfile(null);
      }
      if (event === "SIGNED_OUT") {
        finishLoading("SIGNED_OUT");
      }
      // Don't finish loading for SIGNED_IN here, profile is fetched in effect below
    });

    // Get initial session (also sets user quickly)
    const initAuth = async () => {
      try {
        console.log("[useAuthState] Checking initial session...");
        const { data: { session } } = await authService.getSession();
        if (!mounted) return;
        setSession(session);
        if (session?.user) {
          setUser({ ...session.user, profile: null });
        } else {
          setUser(null);
          setProfile(null);
        }
        finishLoading("init:session_checked");
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

  // Whenever user changes AND is non-admin, fetch profile
  useEffect(() => {
    let active = true;
    const fetchAndAttachProfile = async () => {
      if (!user || user.email === 'admin@arabinsights.com') {
        setProfile(null);
        if (user && user.email === 'admin@arabinsights.com') {
          setUser(prev => prev ? { ...prev, profile: null } : null);
        }
        return;
      }
      try {
        const userProfile = await profileService.fetchUserProfile(user.id);
        if (!active) return;
        if (!userProfile) {
          setProfile(null);
          setUser(prev => prev ? { ...prev, profile: null } : null);
        } else {
          setProfile(userProfile);
          setUser(prev => prev ? { ...prev, profile: userProfile } : null);
        }
      } catch (error) {
        console.error("[useAuthState] Error fetching profile (effect)", error);
        setProfile(null);
        setUser(prev => prev ? { ...prev, profile: null } : null);
      }
    };
    fetchAndAttachProfile();
    return () => { active = false; };
  }, [user?.id, user?.email]);
  
  return {
    user,
    profile,
    session,
    loading,
    setUser,
    setProfile
  };
};
