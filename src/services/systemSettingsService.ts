
import { supabase } from '@/integrations/supabase/client';

interface SystemSettings {
  [key: string]: any;
}

export const systemSettingsService = {
  async getSettings(settingKey: string): Promise<any> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', settingKey)
      .single();

    if (error) throw error;
    return data?.setting_value || {};
  },

  async updateSettings(settingKey: string, settingValue: any): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: settingKey,
        setting_value: settingValue,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  },

  async getAllSettings(): Promise<SystemSettings> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value');

    if (error) throw error;

    const settings: SystemSettings = {};
    data?.forEach(item => {
      settings[item.setting_key] = item.setting_value;
    });

    return settings;
  }
};
