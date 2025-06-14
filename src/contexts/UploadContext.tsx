import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Upload {
  id: string;
  project_id: string;
  source: string;
  file_url: string | null;
  raw_text: string;
  metadata: any;
  processed: boolean;
  created_at: string;
}

interface Analysis {
  id: string;
  upload_id: string;
  sentiment: string;
  sentiment_score: number;
  dialect: string | null;
  dialect_confidence: number | null;
  model_response: any;
  created_at: string;
}

interface Summary {
  id: string;
  analysis_id: string;
  summary_text: string;
  model_used: string | null;
  created_at: string;
}

interface Forecast {
  id: string;
  analysis_id: string;
  forecast_json: any;
  forecast_period: string | null;
  created_at: string;
}

interface UploadContextType {
  uploads: Upload[];
  analyses: Analysis[];
  summaries: Summary[];
  forecasts: Forecast[];
  loading: boolean;
  error: string | null;
  fetchUploads: (projectId?: string) => Promise<void>;
  fetchAnalyses: (uploadId?: string) => Promise<void>;
  fetchSummaries: (analysisId?: string) => Promise<void>;
  fetchForecasts: (analysisId?: string) => Promise<void>;
  uploadText: (projectId: string, text: string, source?: string, metadata?: any) => Promise<string | null>;
  processUpload: (uploadId: string) => Promise<boolean>;
  deleteUpload: (uploadId: string) => Promise<boolean>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUploads = async (projectId?: string) => {
    if (!user) return;
    
    const targetProjectId = projectId || currentProject?.id;
    if (!targetProjectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('project_id', targetProjectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUploads(data || []);
    } catch (err: any) {
      console.error('Error fetching uploads:', err);
      setError(err.message || 'Failed to fetch uploads');
      toast.error('Failed to fetch uploads');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyses = async (uploadId?: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (uploadId) {
        query = query.eq('upload_id', uploadId);
      } else if (currentProject) {
        // If no uploadId is specified but we have a current project,
        // fetch analyses for all uploads in the current project
        const uploadIds = uploads.map(u => u.id);
        if (uploadIds.length > 0) {
          query = query.in('upload_id', uploadIds);
        } else {
          // No uploads to fetch analyses for
          setAnalyses([]);
          setLoading(false);
          return;
        }
      } else {
        // No current project and no uploadId
        setAnalyses([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setAnalyses(data || []);
    } catch (err: any) {
      console.error('Error fetching analyses:', err);
      setError(err.message || 'Failed to fetch analyses');
      toast.error('Failed to fetch analyses');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaries = async (analysisId?: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('summaries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (analysisId) {
        query = query.eq('analysis_id', analysisId);
      } else if (analyses.length > 0) {
        // If no analysisId is specified but we have analyses,
        // fetch summaries for all analyses
        const analysisIds = analyses.map(a => a.id);
        query = query.in('analysis_id', analysisIds);
      } else {
        // No analyses to fetch summaries for
        setSummaries([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setSummaries(data || []);
    } catch (err: any) {
      console.error('Error fetching summaries:', err);
      setError(err.message || 'Failed to fetch summaries');
      toast.error('Failed to fetch summaries');
    } finally {
      setLoading(false);
    }
  };

  const fetchForecasts = async (analysisId?: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('forecasts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (analysisId) {
        query = query.eq('analysis_id', analysisId);
      } else if (analyses.length > 0) {
        // If no analysisId is specified but we have analyses,
        // fetch forecasts for all analyses
        const analysisIds = analyses.map(a => a.id);
        query = query.in('analysis_id', analysisIds);
      } else {
        // No analyses to fetch forecasts for
        setForecasts([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setForecasts(data || []);
    } catch (err: any) {
      console.error('Error fetching forecasts:', err);
      setError(err.message || 'Failed to fetch forecasts');
      toast.error('Failed to fetch forecasts');
    } finally {
      setLoading(false);
    }
  };

  const uploadText = async (
    projectId: string, 
    text: string, 
    source: string = 'manual', 
    metadata: any = {}
  ): Promise<string | null> => {
    if (!user || !projectId || !text.trim()) return null;
    
    try {
      const { data, error } = await supabase
        .from('uploads')
        .insert({
          project_id: projectId,
          source,
          raw_text: text,
          metadata,
          processed: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Text uploaded successfully');
      await fetchUploads(projectId);
      return data.id;
    } catch (err: any) {
      console.error('Error uploading text:', err);
      toast.error('Failed to upload text');
      return null;
    }
  };

  const processUpload = async (uploadId: string): Promise<boolean> => {
    if (!user || !uploadId) return false;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ upload_id: uploadId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process upload');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Upload processed successfully');
        
        // Refresh data
        const uploadProjectId = uploads.find(u => u.id === uploadId)?.project_id;
        if (uploadProjectId) {
          await fetchUploads(uploadProjectId);
        }
        await fetchAnalyses(uploadId);
        
        // If we have an analysis_id, fetch summaries and forecasts
        if (result.analysis_id) {
          await fetchSummaries(result.analysis_id);
          await fetchForecasts(result.analysis_id);
        }
        
        return true;
      } else {
        throw new Error(result.message || 'Failed to process upload');
      }
    } catch (err: any) {
      console.error('Error processing upload:', err);
      toast.error(err.message || 'Failed to process upload');
      return false;
    }
  };

  const deleteUpload = async (uploadId: string): Promise<boolean> => {
    if (!user || !uploadId) return false;
    
    try {
      const { error } = await supabase
        .from('uploads')
        .delete()
        .eq('id', uploadId);
      
      if (error) throw error;
      
      toast.success('Upload deleted successfully');
      
      // Refresh uploads for the current project
      if (currentProject) {
        await fetchUploads(currentProject.id);
      }
      
      return true;
    } catch (err: any) {
      console.error('Error deleting upload:', err);
      toast.error('Failed to delete upload');
      return false;
    }
  };

  // Fetch uploads when current project changes
  useEffect(() => {
    if (currentProject) {
      fetchUploads(currentProject.id);
    } else {
      setUploads([]);
      setAnalyses([]);
      setSummaries([]);
      setForecasts([]);
    }
  }, [currentProject]);

  // Fetch analyses when uploads change
  useEffect(() => {
    if (uploads.length > 0) {
      fetchAnalyses();
    } else {
      setAnalyses([]);
      setSummaries([]);
      setForecasts([]);
    }
  }, [uploads]);

  // Fetch summaries and forecasts when analyses change
  useEffect(() => {
    if (analyses.length > 0) {
      fetchSummaries();
      fetchForecasts();
    } else {
      setSummaries([]);
      setForecasts([]);
    }
  }, [analyses]);

  const value = {
    uploads,
    analyses,
    summaries,
    forecasts,
    loading,
    error,
    fetchUploads,
    fetchAnalyses,
    fetchSummaries,
    fetchForecasts,
    uploadText,
    processUpload,
    deleteUpload
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};