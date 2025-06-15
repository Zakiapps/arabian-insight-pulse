
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const authService = {
  async login(email: string, password: string) {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful for:', email);
      return { data: data.session, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error: error as Error };
    }
  },

  async register(email: string, password: string, fullName: string) {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // User needs to confirm email
        return { 
          data: { user: data.user, session: null },
          error: null
        };
      }

      if (data.user && data.session) {
        // Create a profile for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            role: 'user',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here, as the user is already created
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        data: { user: null, session: null },
        error: error as Error
      };
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
    return { error: null };
  },

  async getSession() {
    return await supabase.auth.getSession();
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
