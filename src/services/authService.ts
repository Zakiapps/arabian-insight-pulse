
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const authService = {
  async login(email: string, password: string) {
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
  },

  async register(email: string, password: string, fullName: string) {
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
  },

  async logout() {
    return await supabase.auth.signOut();
  },

  async getSession() {
    return await supabase.auth.getSession();
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
