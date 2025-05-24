
import { supabase } from '@/integrations/supabase/client';

interface AnalysisSettings {
  sentiment_threshold: number;
  dialect_detection_enabled: boolean;
  auto_categorization: boolean;
  email_notifications: boolean;
  accuracy_level: string;
  language_preference: string;
  enable_advanced_analytics: boolean;
}

export const analysisSettingsService = {
  async getUserSettings(userId: string): Promise<AnalysisSettings | null> {
    const { data, error } = await supabase
      .from('analysis_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async createOrUpdateSettings(userId: string, settings: Partial<AnalysisSettings>): Promise<void> {
    const { error } = await supabase
      .from('analysis_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }
};
