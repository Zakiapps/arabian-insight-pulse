
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Upload {
  id: string;
  projectId: string;
  rawText: string;
  source: string;
  title?: string;
  fileUrl?: string;
  processed: boolean;
  metadata?: any;
  createdAt: string;
}

interface Analysis {
  id: string;
  uploadId: string;
  sentiment: string;
  sentimentScore: number;
  dialect?: string;
  dialectConfidence?: number;
  modelResponse?: any;
  createdAt: string;
}

interface Summary {
  id: string;
  analysisId: string;
  summaryText: string;
  language: string;
  modelUsed?: string;
  createdAt: string;
}

interface Forecast {
  id: string;
  analysisId: string;
  forecastData: any;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface UploadContextType {
  uploads: Upload[];
  analyses: Analysis[];
  summaries: Summary[];
  forecasts: Forecast[];
  loading: boolean;
  uploadText: (projectId: string, text: string, source: string, title?: string) => Promise<Upload>;
  analyzeUpload: (uploadId: string) => Promise<Analysis>;
  generateSummary: (analysisId: string, language?: string) => Promise<Summary>;
  generateForecast: (analysisId: string, days?: number) => Promise<Forecast>;
  loadUploads: (projectId: string) => Promise<void>;
  loadAnalyses: (projectId: string) => Promise<void>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const uploadText = async (projectId: string, text: string, source: string, title?: string): Promise<Upload> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('uploads')
        .insert({
          project_id: projectId,
          raw_text: text,
          source,
          title,
          processed: false,
        })
        .select()
        .single();

      if (error) throw error;

      const upload: Upload = {
        id: data.id,
        projectId: data.project_id,
        rawText: data.raw_text,
        source: data.source,
        title: data.title,
        fileUrl: data.file_url,
        processed: data.processed,
        metadata: data.metadata,
        createdAt: data.created_at,
      };

      setUploads(prev => [upload, ...prev]);
      return upload;
    } catch (error) {
      console.error('Error uploading text:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const analyzeUpload = async (uploadId: string): Promise<Analysis> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      
      // Call the analyze-text edge function
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { uploadId },
      });

      if (error) throw error;

      // Fetch the created analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .select('*')
        .eq('upload_id', uploadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (analysisError) throw analysisError;

      const analysis: Analysis = {
        id: analysisData.id,
        uploadId: analysisData.upload_id,
        sentiment: analysisData.sentiment,
        sentimentScore: analysisData.sentiment_score,
        dialect: analysisData.dialect,
        dialectConfidence: analysisData.dialect_confidence,
        modelResponse: analysisData.model_response,
        createdAt: analysisData.created_at,
      };

      setAnalyses(prev => [analysis, ...prev]);
      return analysis;
    } catch (error) {
      console.error('Error analyzing upload:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (analysisId: string, language = 'ar'): Promise<Summary> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { analysisId, language },
      });

      if (error) throw error;

      const { data: summaryData, error: summaryError } = await supabase
        .from('summaries')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (summaryError) throw summaryError;

      const summary: Summary = {
        id: summaryData.id,
        analysisId: summaryData.analysis_id,
        summaryText: summaryData.summary_text,
        language: summaryData.language,
        modelUsed: summaryData.model_used,
        createdAt: summaryData.created_at,
      };

      setSummaries(prev => [summary, ...prev]);
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async (analysisId: string, days = 30): Promise<Forecast> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-forecast', {
        body: { analysisId, days },
      });

      if (error) throw error;

      const { data: forecastData, error: forecastError } = await supabase
        .from('forecasts')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (forecastError) throw forecastError;

      const forecast: Forecast = {
        id: forecastData.id,
        analysisId: forecastData.analysis_id,
        forecastData: forecastData.forecast_json,
        startDate: forecastData.start_date,
        endDate: forecastData.end_date,
        createdAt: forecastData.created_at,
      };

      setForecasts(prev => [forecast, ...prev]);
      return forecast;
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadUploads = async (projectId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUploads: Upload[] = (data || []).map(upload => ({
        id: upload.id,
        projectId: upload.project_id,
        rawText: upload.raw_text,
        source: upload.source,
        title: upload.title,
        fileUrl: upload.file_url,
        processed: upload.processed,
        metadata: upload.metadata,
        createdAt: upload.created_at,
      }));

      setUploads(formattedUploads);
    } catch (error) {
      console.error('Error loading uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyses = async (projectId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_project_analyses', {
        project_id_param: projectId,
      });

      if (error) throw error;

      const formattedAnalyses: Analysis[] = (data || []).map((analysis: any) => ({
        id: analysis.id,
        uploadId: analysis.upload_id,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentiment_score,
        dialect: analysis.dialect,
        dialectConfidence: analysis.dialect_confidence,
        modelResponse: analysis.model_response,
        createdAt: analysis.created_at,
      }));

      setAnalyses(formattedAnalyses);

      // Load summaries and forecasts for these analyses
      const analysisIds = formattedAnalyses.map(a => a.id);
      
      if (analysisIds.length > 0) {
        const { data: summariesData } = await supabase
          .from('summaries')
          .select('*')
          .in('analysis_id', analysisIds);

        const { data: forecastsData } = await supabase
          .from('forecasts')
          .select('*')
          .in('analysis_id', analysisIds);

        if (summariesData) {
          const formattedSummaries: Summary[] = summariesData.map(summary => ({
            id: summary.id,
            analysisId: summary.analysis_id,
            summaryText: summary.summary_text,
            language: summary.language,
            modelUsed: summary.model_used,
            createdAt: summary.created_at,
          }));
          setSummaries(formattedSummaries);
        }

        if (forecastsData) {
          const formattedForecasts: Forecast[] = forecastsData.map(forecast => ({
            id: forecast.id,
            analysisId: forecast.analysis_id,
            forecastData: forecast.forecast_json,
            startDate: forecast.start_date,
            endDate: forecast.end_date,
            createdAt: forecast.created_at,
          }));
          setForecasts(formattedForecasts);
        }
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  const value = {
    uploads,
    analyses,
    summaries,
    forecasts,
    loading,
    uploadText,
    analyzeUpload,
    generateSummary,
    generateForecast,
    loadUploads,
    loadAnalyses,
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
}

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};
