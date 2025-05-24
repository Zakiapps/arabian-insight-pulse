
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
  const handleAuthStateChange = (event: string, newSession: Session | null) => {
    console.log('Auth state changed:', event, newSession?.user?.email);
    setSession(newSession);
    
    if (event === 'SIGNED_IN' && newSession?.user) {
      console.log('User signed in, setting user state...');
      setUser({ ...newSession.user, profile: null });
      
      // Fetch profile asynchronously without blocking
      setTimeout(() => {
        profileService.fetchUserProfile(newSession.user.id)
          .then(userProfile => {
            console.log('Profile fetched:', userProfile);
            setProfile(userProfile);
            setUser(prev => prev ? { ...prev, profile: userProfile } : null);
          })
          .catch(error => {
            console.error('Error fetching profile:', error);
            // For admin users, we can continue without profile
            if (newSession.user.email === 'admin@arabinsights.com') {
              setProfile(null);
            }
          });
      }, 0);
      
      setLoading(false);
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      setUser(null);
      setProfile(null);
      setLoading(false);
    } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
      console.log('Token refreshed');
      setUser(prev => prev ? { ...newSession.user, profile: prev.profile } : { ...newSession.user, profile: profile });
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = authService.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await authService.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('Initial session found for user:', session.user.email);
          setSession(session);
          setUser({ ...session.user, profile: null });
          
          // Fetch profile asynchronously
          try {
            const userProfile = await profileService.fetchUserProfile(session.user.id);
            if (mounted) {
              console.log('Initial profile fetched:', userProfile);
              setProfile(userProfile);
              setUser(prev => prev ? { ...prev, profile: userProfile } : null);
            }
          } catch (error) {
            console.error('Error fetching initial profile:', error);
            // For admin users, we can continue without profile
            if (session.user.email === 'admin@arabinsights.com' && mounted) {
              setProfile(null);
            }
          }
        } else {
          console.log('No initial session found');
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

    // Cleanup
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
