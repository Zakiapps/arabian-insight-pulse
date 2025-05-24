
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<Profile | null> {
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
  },

  async updateProfile(userId: string, profileData: Partial<Profile>): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }
};
