
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
    if (!user) return;

    setAnalyzingArticles(prev => ({ ...prev, [article.id]: true }));

    try {
      const textToAnalyze = article.content || article.description || article.title;
      
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: {
          text: textToAnalyze
        }
      });

      if (error) throw error;

      // Store the analysis in text_analyses table for the recent analyses section
      const { error: insertError } = await supabase
        .from('text_analyses')
        .insert({
          project_id: projectId,
          input_text: textToAnalyze,
          sentiment: data.sentiment,
          sentiment_score: data.confidence,
          emotion: data.emotion,
          language: article.language || 'ar',
          dialect: data.dialect === 'Jordanian' ? 'jordanian' : 'other',
          dialect_confidence: data.dialect_confidence,
          dialect_indicators: data.dialect_indicators || [],
          emotional_markers: data.emotional_markers || [],
          user_id: user.id
        });

      if (insertError) {
        console.error('Error inserting analysis:', insertError);
      }

      // Update the article with enhanced analysis results
      await supabase
        .from('scraped_news')
        .update({ 
          is_analyzed: true, 
          sentiment: data.sentiment,
          emotion: data.emotion,
          dialect: data.dialect === 'Jordanian' ? 'jordanian' : 'other',
          dialect_confidence: data.dialect_confidence,
          dialect_indicators: data.dialect_indicators || [],
          emotional_markers: data.emotional_markers || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      // Trigger refresh of analyses in parent component
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }

      toast({
        title: isRTL ? "تم التحليل بنجاح" : "Analysis Complete",
        description: isRTL 
          ? `المشاعر: ${data.sentiment === 'positive' ? 'إيجابي' : data.sentiment === 'negative' ? 'سلبي' : 'محايد'} | العاطفة: ${data.emotion}`
          : `Sentiment: ${data.sentiment} | Emotion: ${data.emotion}`,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: isRTL ? "خطأ في التحليل" : "Analysis Error",
        description: error.message || "Failed to analyze article",
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
