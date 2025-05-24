
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

  // Check if user is admin - prioritize email check for admin@arabinsights.com
  const isAdmin = user?.email === 'admin@arabinsights.com' || profile?.role === 'admin';
  const isAuthenticated = !!user && !!session && !!profile;

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
