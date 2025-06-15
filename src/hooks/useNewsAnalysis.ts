
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

    console.log('Starting analysis for article:', article.id);
    setAnalyzingArticles(prev => ({ ...prev, [article.id]: true }));

    try {
      // Prioritize content, then description, then title for analysis
      const textToAnalyze = article.content || article.description || article.title;
      
      if (!textToAnalyze || textToAnalyze.trim().length < 3) {
        throw new Error(isRTL ? "النص فارغ أو قصير جداً" : "Text is empty or too short");
      }

      console.log('Analyzing text:', textToAnalyze.substring(0, 100) + '...');
      
      // Call our enhanced MARBERT analysis function
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: {
          text: textToAnalyze
        }
      });

      if (error) {
        console.error('Analysis function error:', error);
        throw error;
      }

      console.log('Analysis result received:', data);

      // Store the analysis in text_analyses table for the recent analyses section
      const { error: insertError } = await supabase
        .from('text_analyses')
        .insert({
          project_id: projectId,
          input_text: textToAnalyze,
          sentiment: data.sentiment || 'neutral',
          sentiment_score: data.confidence || 0.5,
          emotion: data.emotion || 'محايد',
          language: article.language || 'ar',
          dialect: data.dialect === 'Jordanian' ? 'jordanian' : 'other',
          dialect_confidence: data.dialect_confidence || 0,
          dialect_indicators: data.dialect_indicators || [],
          emotional_markers: data.emotional_markers || [],
          model_response: data,
          user_id: user.id
        });

      if (insertError) {
        console.error('Error inserting analysis:', insertError);
        throw insertError;
      }

      // Update the article with enhanced analysis results
      const { error: updateError } = await supabase
        .from('scraped_news')
        .update({ 
          is_analyzed: true, 
          sentiment: data.sentiment || 'neutral',
          emotion: data.emotion || 'محايد',
          dialect: data.dialect === 'Jordanian' ? 'jordanian' : 'other',
          dialect_confidence: data.dialect_confidence || 0,
          dialect_indicators: data.dialect_indicators || [],
          emotional_markers: data.emotional_markers || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (updateError) {
        console.error('Error updating article:', updateError);
        throw updateError;
      }

      console.log('Analysis completed successfully for article:', article.id);

      // Trigger refresh of analyses in parent component
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }

      toast({
        title: isRTL ? "تم التحليل بنجاح" : "Analysis Complete",
        description: isRTL 
          ? `المشاعر: ${data.sentiment === 'positive' ? 'إيجابي' : data.sentiment === 'negative' ? 'سلبي' : 'محايد'} | العاطفة: ${data.emotion || 'محايد'}`
          : `Sentiment: ${data.sentiment || 'neutral'} | Emotion: ${data.emotion || 'neutral'}`,
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
