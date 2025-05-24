
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
    setSession: () => {} // This will be handled by useAuthState
  });

  // Enhanced admin check with proper fallback
  const isAdmin = React.useMemo(() => {
    // Primary check: admin email
    if (user?.email === 'admin@arabinsights.com') {
      return true;
    }
    
    // Secondary check: profile role (only if email matches)
    if (user?.email === 'admin@arabinsights.com' && profile?.role === 'admin') {
      return true;
    }
    
    return false;
  }, [user?.email, profile?.role]);
  
  // Enhanced authentication check
  const isAuthenticated = React.useMemo(() => {
    if (loading) return false;
    
    // Must have user and session
    if (!user || !session) return false;
    
    // For admin user, profile is optional but recommended
    if (user.email === 'admin@arabinsights.com') {
      return true;
    }
    
    // For regular users, profile is required
    return !!profile;
  }, [loading, user, session, profile]);

  console.log('Auth state check:', {
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
