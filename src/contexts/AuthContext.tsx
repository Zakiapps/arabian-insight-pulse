
import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, profile, session, loading, setUser, setProfile } = useAuthState();
  const { login, register, updateUserProfile, logout } = useAuthActions({
    user,
    setUser,
    setProfile,
    setSession: () => {} // Session is managed by useAuthState
  });

  // Enhanced admin check
  const isAdmin = React.useMemo(() => {
    return user?.email === 'admin@arabinsights.com' || profile?.role === 'admin';
  }, [user?.email, profile?.role]);
  
  // Enhanced authentication check
  const isAuthenticated = React.useMemo(() => {
    if (loading) return false;
    
    // Must have user and session
    if (!user || !session) return false;
    
    // For admin user, profile is optional
    if (user.email === 'admin@arabinsights.com') {
      return true;
    }
    
    // For regular users, we'll be more lenient and allow authentication without profile
    // since profile creation might be delayed
    return true;
  }, [loading, user, session, profile]);

  console.log('Auth state:', {
    loading,
    hasUser: !!user,
    hasSession: !!session,
    hasProfile: !!profile,
    isAuthenticated,
    isAdmin,
    userEmail: user?.email,
    profileRole: profile?.role
  });

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
