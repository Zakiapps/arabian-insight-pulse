
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface BatchAnalysisResult {
  article_id: string;
  success: boolean;
  sentiment?: string;
  emotion?: string;
  confidence?: number;
  quality_score?: number;
  content_source?: string;
  dialect?: string;
  error?: string;
  details?: string;
}

interface BatchAnalysisResponse {
  success: boolean;
  processed: number;
  errors: number;
  total: number;
  results: BatchAnalysisResult[];
  message: string;
}

export const useBatchAnalysis = (projectId: string) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isRTL } = useLanguage();

  const analyzeBatch = async (articleIds?: string[]): Promise<BatchAnalysisResponse | null> => {
    if (!user || !projectId) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يجب تسجيل الدخول أولاً" : "Please log in first",
        variant: "destructive",
      });
      return null;
    }

    setIsAnalyzing(true);
    setProgress({ current: 0, total: articleIds?.length || 0 });

    try {
      console.log('Starting batch analysis...', { projectId, articleIds });

      const { data, error } = await supabase.functions.invoke('analyze-batch-articles', {
        body: {
          project_id: projectId,
          user_id: user.id,
          article_ids: articleIds
        }
      });

      if (error) {
        console.error('Batch analysis error:', error);
        throw error;
      }

      console.log('Batch analysis result:', data);

      if (data.success) {
        toast({
          title: isRTL ? "تم التحليل بنجاح" : "Analysis Complete",
          description: data.message || 
            (isRTL 
              ? `تم تحليل ${data.processed} مقال بنجاح`
              : `Successfully analyzed ${data.processed} articles`),
        });
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return data as BatchAnalysisResponse;

    } catch (error: any) {
      console.error("Batch analysis error:", error);
      toast({
        title: isRTL ? "خطأ في التحليل" : "Analysis Error",
        description: error.message || (isRTL ? "فشل في تحليل المقالات" : "Failed to analyze articles"),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
      setProgress(null);
    }
  };

  const analyzeAllUnanalyzed = async (): Promise<BatchAnalysisResponse | null> => {
    return await analyzeBatch(); // No articleIds means analyze all unanalyzed
  };

  const analyzeSelected = async (articleIds: string[]): Promise<BatchAnalysisResponse | null> => {
    return await analyzeBatch(articleIds);
  };

  return {
    isAnalyzing,
    progress,
    analyzeBatch,
    analyzeAllUnanalyzed,
    analyzeSelected
  };
};
