
import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

type UserWithProfile = User & {
  profile?: Profile | null;
};

type AuthContextType = {
  user: UserWithProfile | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setIsAdmin(data.role === "admin");
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    // First set up auth state listener to prevent missing auth events during initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          const currentUser = currentSession.user;
          setUser(currentUser);
          
          // Use setTimeout to prevent potential deadlocks with Supabase client
          setTimeout(() => {
            fetchProfile(currentUser.id);
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          const profileData = await fetchProfile(currentSession.user.id);
          
          if (profileData) {
            const userWithProfile = { 
              ...currentSession.user,
              profile: profileData
            };
            setUser(userWithProfile);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before logging in. Check your inbox for a confirmation link.");
        } else {
          toast.error(error.message || "Failed to sign in");
        }
        throw error;
      }
      
      toast.success("Login successful");
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Get the current origin for the redirect URL
      const redirectTo = window.location.origin + "/login?verified=true";
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          },
          emailRedirectTo: redirectTo
        }
      });

      if (error) throw error;
      
      if (data.user && !data.session) {
        toast.info("Please check your email to confirm your account");
      } else {
        toast.success("Registration successful");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.info("You have been logged out");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
      console.error("Error signing out:", error);
    }
  };
  
  // Update profile
  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) throw new Error("No user logged in");
      
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);
        
      if (error) throw error;
      
      // Refresh profile data
      await fetchProfile(user.id);
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
