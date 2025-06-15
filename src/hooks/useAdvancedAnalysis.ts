
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SavedNewsArticle } from '@/types/news';
import { AdvancedAnalysisResult } from '@/types/analysis';

export const useAdvancedAnalysis = (projectId: string, onAnalysisComplete?: () => void) => {
  const [analyzingArticles, setAnalyzingArticles] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const { isRTL } = useLanguage();

  const analyzeArticleAdvanced = async (article: SavedNewsArticle) => {
    console.log('Advanced analysis started for:', { projectId, articleId: article.id });
    
    if (!user) {
      console.error('No user found for analysis');
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يجب تسجيل الدخول أولاً" : "Please log in first",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      console.error('No projectId provided for analysis');
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "معرف المشروع مطلوب" : "Project ID is required",
        variant: "destructive",
      });
      return;
    }

    setAnalyzingArticles(prev => ({ ...prev, [article.id]: true }));

    try {
      // استدعاء edge function الجديدة للتحليل المتقدم
      console.log('Calling advanced-analysis function...');
      
      const { data, error } = await supabase.functions.invoke('advanced-analysis', {
        body: {
          articleTitle: article.title,
          articleDescription: article.description,
          articleContent: article.content,
          language: article.language || 'ar'
        }
      });

      if (error) {
        console.error('Advanced analysis function error:', error);
        throw error;
      }

      console.log('Advanced analysis result received:', data);

      // التحقق من صحة النتيجة
      if (!data || !data.sentiment) {
        throw new Error('Invalid advanced analysis result received');
      }

      // حفظ النتائج المتقدمة في قاعدة البيانات
      const { data: advancedResult, error: insertError } = await supabase
        .from('advanced_analysis_results')
        .insert({
          article_id: article.id,
          project_id: projectId,
          user_id: user.id,
          primary_emotion: data.primary_emotion || 'محايد',
          emotion_scores: data.emotion_scores || {},
          sentiment_confidence: Math.min(Math.max(data.sentiment_confidence || 0.5, 0), 1),
          sentiment_reasoning: data.sentiment_reasoning,
          main_topics: data.main_topics || [],
          topic_scores: data.topic_scores || {},
          keywords_extracted: data.keywords_extracted || [],
          dialect_features: data.dialect_features || {},
          regional_indicators: data.regional_indicators || [],
          context_analysis: data.context_analysis,
          urgency_level: data.urgency_level || 'low',
          analysis_quality_score: Math.min(Math.max(data.analysis_quality_score || 0.5, 0), 1)
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting advanced analysis:', insertError);
        throw insertError;
      }

      console.log('Advanced analysis inserted successfully:', advancedResult);

      // تحديث المقال بالنتائج الأساسية
      const { error: updateError } = await supabase
        .from('scraped_news')
        .update({ 
          is_analyzed: true, 
          sentiment: data.sentiment,
          emotion: data.primary_emotion || 'محايد',
          dialect: data.dialect === 'jordanian' ? 'jordanian' : 'other',
          dialect_confidence: Math.min(Math.max(data.dialect_confidence || 0, 0), 100),
          dialect_indicators: data.regional_indicators || [],
          emotional_markers: Object.keys(data.emotion_scores || {}),
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (updateError) {
        console.error('Error updating article:', updateError);
        throw updateError;
      }

      // حفظ الكلمات المفتاحية
      if (data.keywords_extracted && data.keywords_extracted.length > 0) {
        const keywordsToInsert = data.keywords_extracted.map((keyword: string, index: number) => ({
          analysis_id: advancedResult.id,
          keyword,
          relevance_score: Math.max(0.1, 1 - (index * 0.1)), // درجة الصلة تقل تدريجياً
          keyword_type: 'topic' as const
        }));

        const { error: keywordsError } = await supabase
          .from('article_keywords')
          .insert(keywordsToInsert);

        if (keywordsError) {
          console.error('Error inserting keywords:', keywordsError);
        }
      }

      // تحديث الإحصائيات الزمنية
      await updateTimelineStats(projectId, data);

      console.log('Advanced analysis completed successfully for article:', article.id);

      // تحديث الواجهة
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }

      toast({
        title: isRTL ? "تم التحليل المتقدم بنجاح" : "Advanced Analysis Complete",
        description: isRTL 
          ? `المشاعر: ${getSentimentLabel(data.sentiment)} | العاطفة: ${data.primary_emotion} | الجودة: ${Math.round((data.analysis_quality_score || 0.5) * 100)}%`
          : `Sentiment: ${data.sentiment} | Emotion: ${data.primary_emotion} | Quality: ${Math.round((data.analysis_quality_score || 0.5) * 100)}%`,
      });

      return advancedResult;

    } catch (error: any) {
      console.error("Advanced analysis error:", error);
      toast({
        title: isRTL ? "خطأ في التحليل المتقدم" : "Advanced Analysis Error",
        description: error.message || (isRTL ? "فشل في تحليل المقال" : "Failed to analyze article"),
        variant: "destructive",
      });
    } finally {
      setAnalyzingArticles(prev => ({ ...prev, [article.id]: false }));
    }
  };

  const updateTimelineStats = async (projectId: string, analysisData: any) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingRecord } = await supabase
        .from('sentiment_timeline')
        .select('*')
        .eq('project_id', projectId)
        .eq('analysis_date', today)
        .single();

      const sentiment = analysisData.sentiment;
      const emotion = analysisData.primary_emotion || 'محايد';
      const topics = analysisData.main_topics || [];

      if (existingRecord) {
        // تحديث السجل الموجود
        const updates = {
          positive_count: sentiment === 'إيجابي' ? existingRecord.positive_count + 1 : existingRecord.positive_count,
          negative_count: sentiment === 'سلبي' ? existingRecord.negative_count + 1 : existingRecord.negative_count,
          neutral_count: sentiment === 'محايد' ? existingRecord.neutral_count + 1 : existingRecord.neutral_count,
          dominant_emotion: emotion,
          top_topics: [...new Set([...existingRecord.top_topics, ...topics])].slice(0, 5)
        };

        await supabase
          .from('sentiment_timeline')
          .update(updates)
          .eq('id', existingRecord.id);
      } else {
        // إنشاء سجل جديد
        await supabase
          .from('sentiment_timeline')
          .insert({
            project_id: projectId,
            analysis_date: today,
            positive_count: sentiment === 'إيجابي' ? 1 : 0,
            negative_count: sentiment === 'سلبي' ? 1 : 0,
            neutral_count: sentiment === 'محايد' ? 1 : 0,
            average_sentiment_score: analysisData.sentiment_confidence || 0.5,
            dominant_emotion: emotion,
            top_topics: topics.slice(0, 5)
          });
      }
    } catch (error) {
      console.error('Error updating timeline stats:', error);
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'إيجابي';
      case 'negative': return 'سلبي';
      default: return 'محايد';
    }
  };

  return {
    analyzingArticles,
    analyzeArticleAdvanced
  };
};
