
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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }
      
      return profile;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener first to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession) {
          // Use setTimeout to defer this work slightly and prevent blocking UI
          setTimeout(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const userProfile = await fetchUserProfile(user.id);
              if (userProfile) {
                setProfile(userProfile);
                setUser({ ...user, profile: userProfile });
              } else {
                setUser(user);
              }
              setLoading(false);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          setSession(session);
          
          // Get user with custom claims
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Fetch user profile
            const userProfile = await fetchUserProfile(user.id);
            if (userProfile) {
              setProfile(userProfile);
              setUser({ ...user, profile: userProfile });
            } else {
              setUser(user);
            }
          }
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

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';
  const isAuthenticated = !!user;

  // Login function - optimized with better error handling
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
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
