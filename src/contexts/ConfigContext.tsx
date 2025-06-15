
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

interface BrightDataConfig {
  id?: string;
  projectId: string;
  token: string;
  rules: {
    platforms: string[];
    keywords: string[];
    limit: number;
    [key: string]: any;
  };
  isActive: boolean;
  lastRunAt?: string;
}

interface ConfigContextType {
  brightDataConfig: BrightDataConfig | null;
  updateBrightDataConfig: (config: BrightDataConfig) => Promise<void>;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [brightDataConfig, setBrightDataConfig] = useState<BrightDataConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      // Load BrightData config
      const { data: brightDataData } = await supabase
        .from('brightdata_configs')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (brightDataData) {
        setBrightDataConfig({
          id: brightDataData.id,
          projectId: brightDataData.project_id,
          token: brightDataData.token,
          rules: typeof brightDataData.rules === 'object' && brightDataData.rules !== null 
            ? brightDataData.rules as any
            : { platforms: [], keywords: [], limit: 100 },
          isActive: brightDataData.is_active || false,
          lastRunAt: brightDataData.last_run_at || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBrightDataConfig = async (config: BrightDataConfig) => {
    try {
      const configData = {
        project_id: config.projectId,
        token: config.token,
        rules: config.rules,
        is_active: config.isActive,
      };

      if (config.id) {
        await supabase
          .from('brightdata_configs')
          .update(configData)
          .eq('id', config.id);
      } else {
        await supabase
          .from('brightdata_configs')
          .insert(configData);
      }

      setBrightDataConfig(config);
    } catch (error) {
      console.error('Error updating BrightData config:', error);
      throw error;
    }
  };

  const value = {
    brightDataConfig,
    updateBrightDataConfig,
    loading,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
