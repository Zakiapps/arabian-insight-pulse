
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface SavedNewsArticle {
  id: string;
  article_id: string;
  title: string;
  description?: string;
  content?: string;
  source_name?: string;
  source_icon?: string;
  image_url?: string;
  link?: string;
  pub_date?: string;
  language: string;
  category?: string[];
  keywords?: string[];
  sentiment?: string;
  emotion?: string;
  dialect?: string;
  dialect_confidence?: number;
  dialect_indicators?: string[];
  emotional_markers?: string[];
  is_analyzed: boolean;
  created_at: string;
}

// Utility to bound numeric values for database insertion
function boundValue(value: number | undefined, min: number, max: number, defaultValue: number): number {
  if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return Math.max(min, Math.min(max, value));
}

export const useNewsAnalysis = (projectId: string, onAnalysisComplete?: () => void) => {
  const [analyzingArticles, setAnalyzingArticles] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const { isRTL } = useLanguage();

  const analyzeArticle = async (article: SavedNewsArticle) => {
    if (!user) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يجب تسجيل الدخول أولاً" : "Please log in first",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting analysis for article:', article.id, article.title);
    setAnalyzingArticles(prev => ({ ...prev, [article.id]: true }));

    try {
      // Enhanced content analysis - prioritize title + description
      console.log('Calling analyze-text with title and description...');
      
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: {
          title: article.title,
          description: article.description
        }
      });

      if (error) {
        console.error('Analysis function error:', error);
        throw error;
      }

      console.log('Analysis result received:', data);

      // Validate analysis result
      if (!data || !data.sentiment) {
        throw new Error('Invalid analysis result received');
      }

      // Bound all numeric values to prevent database overflow
      const boundedConfidence = boundValue(data.confidence, 0, 1, 0.5);
      const boundedDialectConfidence = boundValue(data.dialect_confidence, 0, 100, 0);

      // Store the analysis in text_analyses table with bounded values
      const { error: insertError } = await supabase
        .from('text_analyses')
        .insert({
          project_id: projectId,
          input_text: data.analyzedText || `${article.title}. ${article.description || ''}`.substring(0, 500),
          sentiment: data.sentiment || 'neutral',
          sentiment_score: boundedConfidence,
          emotion: data.emotion || 'محايد',
          language: article.language || 'ar',
          dialect: data.dialect === 'Jordanian' ? 'jordanian' : 'other',
          dialect_confidence: boundedDialectConfidence,
          dialect_indicators: data.dialect_indicators || [],
          emotional_markers: data.emotional_markers || [],
          model_response: {
            ...data,
            content_source: data.contentSource || 'title_description'
          },
          user_id: user.id
        });

      if (insertError) {
        console.error('Error inserting analysis:', insertError);
        throw insertError;
      }

      // Update the article with bounded analysis results
      const { error: updateError } = await supabase
        .from('scraped_news')
        .update({ 
          is_analyzed: true, 
          sentiment: data.sentiment || 'neutral',
          emotion: data.emotion || 'محايد',
          dialect: data.dialect === 'Jordanian' ? 'jordanian' : 'other',
          dialect_confidence: boundedDialectConfidence,
          dialect_indicators: data.dialect_indicators || [],
          emotional_markers: data.emotional_markers || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (updateError) {
        console.error('Error updating article:', updateError);
        throw updateError;
      }

      console.log('Analysis completed successfully for article:', article.id, 'using', data.contentSource);

      // Trigger refresh in parent component
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }

      const sourceDisplay = data.contentSource === 'title_description' ? 'العنوان والوصف' : 
                           data.contentSource === 'title_only' ? 'العنوان فقط' : 
                           data.contentSource === 'description_only' ? 'الوصف فقط' : 'النص المباشر';

      toast({
        title: isRTL ? "تم التحليل بنجاح" : "Analysis Complete",
        description: isRTL 
          ? `المشاعر: ${data.sentiment === 'positive' ? 'إيجابي' : data.sentiment === 'negative' ? 'سلبي' : 'محايد'} | العاطفة: ${data.emotion || 'محايد'} | المصدر: ${sourceDisplay}`
          : `Sentiment: ${data.sentiment || 'neutral'} | Emotion: ${data.emotion || 'neutral'} | Source: ${sourceDisplay}`,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: isRTL ? "خطأ في التحليل" : "Analysis Error",
        description: error.message || (isRTL ? "فشل في تحليل المقال" : "Failed to analyze article"),
        variant: "destructive",
      });
    } finally {
      setAnalyzingArticles(prev => ({ ...prev, [article.id]: false }));
    }
  };

  return {
    analyzingArticles,
    analyzeArticle
  };
};
