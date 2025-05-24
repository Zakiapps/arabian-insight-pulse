
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPreferences {
  dashboard_layout: {
    theme: string;
    language: string;
  };
  notification_settings: {
    email: boolean;
    push: boolean;
    in_app: boolean;
  };
  analysis_preferences: {
    auto_save: boolean;
    real_time: boolean;
  };
}

export const useUserPreferences = () => {
  const { profile } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    dashboard_layout: { theme: 'default', language: 'ar' },
    notification_settings: { email: true, push: true, in_app: true },
    analysis_preferences: { auto_save: true, real_time: false }
  });
  const [loading, setLoading] = useState(false);

  const fetchPreferences = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          dashboard_layout: (data.dashboard_layout as any) || { theme: 'default', language: 'ar' },
          notification_settings: (data.notification_settings as any) || { email: true, push: true, in_app: true },
          analysis_preferences: (data.analysis_preferences as any) || { auto_save: true, real_time: false }
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!profile?.id) return;

    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: profile.id,
          dashboard_layout: updatedPreferences.dashboard_layout,
          notification_settings: updatedPreferences.notification_settings,
          analysis_preferences: updatedPreferences.analysis_preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Revert on error
      setPreferences(preferences);
      throw error;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [profile?.id]);

  return {
    preferences,
    updatePreferences,
    loading,
    refreshPreferences: fetchPreferences
  };
};
