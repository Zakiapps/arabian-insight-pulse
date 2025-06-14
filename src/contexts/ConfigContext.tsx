import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrightDataConfig {
  id: string;
  project_id: string;
  token: string;
  rules: {
    platforms: string[];
    keywords: string[];
    limit: number;
    [key: string]: any;
  };
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsConfig {
  id: string;
  project_id: string;
  api_key: string;
  sources: string[];
  keywords: string[];
  language: string;
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ConfigContextType {
  brightDataConfig: BrightDataConfig | null;
  newsConfig: NewsConfig | null;
  loading: boolean;
  error: string | null;
  fetchBrightDataConfig: (projectId?: string) => Promise<void>;
  fetchNewsConfig: (projectId?: string) => Promise<void>;
  saveBrightDataConfig: (config: Partial<BrightDataConfig>) => Promise<boolean>;
  saveNewsConfig: (config: Partial<NewsConfig>) => Promise<boolean>;
  runBrightDataScraper: (projectId: string) => Promise<boolean>;
  runNewsScraper: (projectId: string) => Promise<boolean>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [brightDataConfig, setBrightDataConfig] = useState<BrightDataConfig | null>(null);
  const [newsConfig, setNewsConfig] = useState<NewsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrightDataConfig = async (projectId?: string) => {
    if (!user) return;
    
    const targetProjectId = projectId || currentProject?.id;
    if (!targetProjectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('brightdata_configs')
        .select('*')
        .eq('project_id', targetProjectId)
        .maybeSingle();
      
      if (error) throw error;
      
      setBrightDataConfig(data);
    } catch (err: any) {
      console.error('Error fetching BrightData config:', err);
      setError(err.message || 'Failed to fetch BrightData configuration');
      // Don't show toast for not found errors
      if (!err.message.includes('No rows found')) {
        toast.error('Failed to fetch BrightData configuration');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsConfig = async (projectId?: string) => {
    if (!user) return;
    
    const targetProjectId = projectId || currentProject?.id;
    if (!targetProjectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('news_configs')
        .select('*')
        .eq('project_id', targetProjectId)
        .maybeSingle();
      
      if (error) throw error;
      
      setNewsConfig(data);
    } catch (err: any) {
      console.error('Error fetching NewsAPI config:', err);
      setError(err.message || 'Failed to fetch NewsAPI configuration');
      // Don't show toast for not found errors
      if (!err.message.includes('No rows found')) {
        toast.error('Failed to fetch NewsAPI configuration');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveBrightDataConfig = async (config: Partial<BrightDataConfig>): Promise<boolean> => {
    if (!user || !currentProject) return false;
    
    try {
      // Check if config exists
      if (brightDataConfig?.id) {
        // Update existing config
        const { error } = await supabase
          .from('brightdata_configs')
          .update({
            token: config.token || brightDataConfig.token,
            rules: config.rules || brightDataConfig.rules,
            is_active: config.is_active !== undefined ? config.is_active : brightDataConfig.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', brightDataConfig.id);
        
        if (error) throw error;
      } else {
        // Create new config
        const { error } = await supabase
          .from('brightdata_configs')
          .insert({
            project_id: currentProject.id,
            token: config.token || '',
            rules: config.rules || { platforms: [], keywords: [], limit: 100 },
            is_active: config.is_active !== undefined ? config.is_active : true
          });
        
        if (error) throw error;
      }
      
      toast.success('BrightData configuration saved successfully');
      await fetchBrightDataConfig(currentProject.id);
      return true;
    } catch (err: any) {
      console.error('Error saving BrightData config:', err);
      toast.error('Failed to save BrightData configuration');
      return false;
    }
  };

  const saveNewsConfig = async (config: Partial<NewsConfig>): Promise<boolean> => {
    if (!user || !currentProject) return false;
    
    try {
      // Check if config exists
      if (newsConfig?.id) {
        // Update existing config
        const { error } = await supabase
          .from('news_configs')
          .update({
            api_key: config.api_key || newsConfig.api_key,
            sources: config.sources || newsConfig.sources,
            keywords: config.keywords || newsConfig.keywords,
            language: config.language || newsConfig.language,
            is_active: config.is_active !== undefined ? config.is_active : newsConfig.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', newsConfig.id);
        
        if (error) throw error;
      } else {
        // Create new config
        const { error } = await supabase
          .from('news_configs')
          .insert({
            project_id: currentProject.id,
            api_key: config.api_key || import.meta.env.VITE_NEWS_API_KEY || '482cb9523dff462ebd58db6177d3af91',
            sources: config.sources || [],
            keywords: config.keywords || [],
            language: config.language || 'ar',
            is_active: config.is_active !== undefined ? config.is_active : true
          });
        
        if (error) throw error;
      }
      
      toast.success('NewsAPI configuration saved successfully');
      await fetchNewsConfig(currentProject.id);
      return true;
    } catch (err: any) {
      console.error('Error saving NewsAPI config:', err);
      toast.error('Failed to save NewsAPI configuration');
      return false;
    }
  };

  const runBrightDataScraper = async (projectId: string): Promise<boolean> => {
    if (!user || !projectId) return false;
    
    try {
      // This is a placeholder - in a real implementation, you would call your BrightData scraper function
      toast.info('BrightData scraper is not implemented in this demo');
      return true;
    } catch (err: any) {
      console.error('Error running BrightData scraper:', err);
      toast.error('Failed to run BrightData scraper');
      return false;
    }
  };

  const runNewsScraper = async (projectId: string): Promise<boolean> => {
    if (!user || !projectId) return false;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ project_id: projectId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run NewsAPI scraper');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Successfully scraped ${result.articles_count} articles`);
        return true;
      } else {
        throw new Error(result.message || 'Failed to run NewsAPI scraper');
      }
    } catch (err: any) {
      console.error('Error running NewsAPI scraper:', err);
      toast.error(err.message || 'Failed to run NewsAPI scraper');
      return false;
    }
  };

  // Fetch configs when current project changes
  useEffect(() => {
    if (currentProject) {
      fetchBrightDataConfig(currentProject.id);
      fetchNewsConfig(currentProject.id);
    } else {
      setBrightDataConfig(null);
      setNewsConfig(null);
    }
  }, [currentProject]);

  const value = {
    brightDataConfig,
    newsConfig,
    loading,
    error,
    fetchBrightDataConfig,
    fetchNewsConfig,
    saveBrightDataConfig,
    saveNewsConfig,
    runBrightDataScraper,
    runNewsScraper
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};