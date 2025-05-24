import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

type UserWithProfile = User & {
  profile?: Profile;
};

interface AuthContextType {
  user: UserWithProfile | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  updateUserProfile: (profileData: Partial<Profile>) => Promise<{
    error: Error | null;
    data: Profile | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile efficiently
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: null,
              role: 'user',
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }
          
          console.log('Created new profile:', newProfile);
          return newProfile;
        }
        return null;
      }
      
      console.log('Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  // Handle auth state changes
  const handleAuthStateChange = async (event: string, newSession: Session | null) => {
    console.log('Auth state changed:', event, newSession?.user?.email);
    setSession(newSession);
    
    if (event === 'SIGNED_IN' && newSession?.user) {
      const userProfile = await fetchUserProfile(newSession.user.id);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          console.log('Initial session found for user:', session.user.email);
          setSession(session);
          
          // Fetch user profile
          const userProfile = await fetchUserProfile(session.user.id);
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

  // Check if user is admin - prioritize email check for admin@arabinsights.com
  const isAdmin = user?.email === 'admin@arabinsights.com' || profile?.role === 'admin';
  const isAuthenticated = !!user && !!session && !!profile;

  // Login function - optimized with better error handling
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Login successful for:', email);
      return { data: data.session, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error: error as Error };
    }
  };

  // Register function
  const register = async (email: string, password: string, fullName: string) => {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            role: 'user',
          });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        data: { user: null, session: null },
        error: error as Error
      };
    }
  };

  // Update user profile - optimized
  const updateUserProfile = async (profileData: Partial<Profile>) => {
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProfile(data);
      setUser(prev => prev ? { ...prev, profile: data } : null);

      return { data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { data: null, error: error as Error };
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    navigate('/login');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const value = {
    user,
    profile,
    session,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout,
    register,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
