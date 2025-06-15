
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Brain, ExternalLink, Clock, Globe, Newspaper, CheckCircle, AlertCircle, BarChart3, Sparkles } from 'lucide-react';
import { useAdvancedAnalysis } from '@/hooks/useAdvancedAnalysis';
import { SavedNewsArticle } from '@/types/news';
import { AdvancedAnalysisResult } from '@/types/analysis';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ArticleAnalysisChart from '@/components/analysis/ArticleAnalysisChart';

interface EnhancedNewsArticleCardProps {
  article: SavedNewsArticle;
  projectId: string;
  onAnalysisComplete?: () => void;
}

const EnhancedNewsArticleCard = ({ article, projectId, onAnalysisComplete }: EnhancedNewsArticleCardProps) => {
  console.log('EnhancedNewsArticleCard rendered with projectId:', projectId, 'article:', article.id);
  
  const { analyzingArticles, analyzeArticleAdvanced } = useAdvancedAnalysis(projectId, onAnalysisComplete);
  const [advancedAnalysis, setAdvancedAnalysis] = useState<AdvancedAnalysisResult | null>(null);
  const [loadingAdvanced, setLoadingAdvanced] = useState(false);
  
  const isAnalyzing = analyzingArticles[article.id];

  // تحميل التحليل المتقدم إذا كان المقال محلل
  useEffect(() => {
    if (article.is_analyzed) {
      loadAdvancedAnalysis();
    }
  }, [article.is_analyzed, article.id]);

  const loadAdvancedAnalysis = async () => {
    try {
      setLoadingAdvanced(true);
      const { data, error } = await supabase
        .from('advanced_analysis_results')
        .select('*')
        .eq('article_id', article.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading advanced analysis:', error);
        return;
      }

      if (data) {
        // تحويل البيانات إلى النوع الصحيح
        const typedData: AdvancedAnalysisResult = {
          ...data,
          emotion_scores: (data.emotion_scores as any) || {},
          main_topics: Array.isArray(data.main_topics) ? data.main_topics as string[] : [],
          topic_scores: (data.topic_scores as any) || {},
          keywords_extracted: Array.isArray(data.keywords_extracted) ? data.keywords_extracted as string[] : [],
          dialect_features: (data.dialect_features as any) || {},
          regional_indicators: Array.isArray(data.regional_indicators) ? data.regional_indicators as string[] : []
        };
        setAdvancedAnalysis(typedData);
      }
    } catch (error) {
      console.error('Error loading advanced analysis:', error);
    } finally {
      setLoadingAdvanced(false);
    }
  };

  const handleAnalyze = async () => {
    console.log('Analyzing article with advanced analysis, projectId:', projectId);
    if (!projectId) {
      console.error('Missing projectId in EnhancedNewsArticleCard');
      return;
    }
    
    const result = await analyzeArticleAdvanced(article);
    if (result) {
      setAdvancedAnalysis(result);
    }
  };

  const getContentSourceIcon = () => {
    if (article.content && article.content.length > 100) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getAnalysisSourceBadge = () => {
    if (!article.is_analyzed) return null;
    
    const hasContent = article.content && article.content.length > 100;
    const hasDescription = article.description && article.description.length > 10;
    
    let sourceText = '';
    let badgeColor = 'bg-blue-100 text-blue-800';
    
    if (hasContent) {
      sourceText = 'تحليل النص الكامل';
      badgeColor = 'bg-green-100 text-green-800';
    } else if (hasDescription) {
      sourceText = 'تحليل العنوان والوصف';
      badgeColor = 'bg-orange-100 text-orange-800';
    } else {
      sourceText = 'تحليل العنوان فقط';
      badgeColor = 'bg-yellow-100 text-yellow-800';
    }
    
    return (
      <Badge variant="outline" className={`text-xs ${badgeColor}`}>
        {sourceText}
      </Badge>
    );
  };

  const getQualityBadge = () => {
    if (!advancedAnalysis) return null;
    
    const quality = advancedAnalysis.analysis_quality_score;
    let badgeColor = 'bg-gray-100 text-gray-800';
    let qualityText = 'منخفضة';
    
    if (quality >= 0.8) {
      badgeColor = 'bg-green-100 text-green-800';
      qualityText = 'عالية';
    } else if (quality >= 0.6) {
      badgeColor = 'bg-blue-100 text-blue-800';
      qualityText = 'جيدة';
    } else if (quality >= 0.4) {
      badgeColor = 'bg-yellow-100 text-yellow-800';
      qualityText = 'متوسطة';
    }
    
    return (
      <Badge variant="outline" className={`text-xs ${badgeColor}`}>
        جودة التحليل: {qualityText} ({Math.round(quality * 100)}%)
      </Badge>
    );
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight mb-2 line-clamp-2">
              {article.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {article.source_name && (
                <div className="flex items-center gap-1">
                  <Newspaper className="h-4 w-4" />
                  <span>{article.source_name}</span>
                </div>
              )}
              {article.pub_date && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(article.pub_date).toLocaleDateString('ar-SA')}</span>
                </div>
              )}
              {getContentSourceIcon()}
            </div>
          </div>
          {article.image_url && (
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-20 h-20 object-cover rounded-md flex-shrink-0"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {article.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {article.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {article.language && (
            <Badge variant="outline" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              {article.language === 'ar' ? 'عربي' : article.language.toUpperCase()}
            </Badge>
          )}
          
          {article.category && article.category.slice(0, 2).map((cat, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {cat}
            </Badge>
          ))}
          
          {getAnalysisSourceBadge()}
          {getQualityBadge()}
        </div>

        {/* عرض النتائج الأساسية */}
        {article.is_analyzed && (
          <div className="bg-muted/50 rounded-lg p-3 mb-3">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant={
                article.sentiment === 'positive' ? 'default' : 
                article.sentiment === 'negative' ? 'destructive' : 'secondary'
              }>
                {article.sentiment === 'positive' ? 'إيجابي' :
                 article.sentiment === 'negative' ? 'سلبي' : 'محايد'}
              </Badge>
              
              {advancedAnalysis?.primary_emotion && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                  {advancedAnalysis.primary_emotion}
                </Badge>
              )}
              
              {article.dialect === 'jordanian' && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  🇯🇴 أردني {article.dialect_confidence && `(${Math.round(article.dialect_confidence)}%)`}
                </Badge>
              )}
            </div>
            
            {/* عرض المواضيع الرئيسية */}
            {advancedAnalysis?.main_topics && advancedAnalysis.main_topics.length > 0 && (
              <div className="text-xs text-muted-foreground mb-2">
                <span className="font-medium">المواضيع: </span>
                {advancedAnalysis.main_topics.slice(0, 3).join(' • ')}
                {advancedAnalysis.main_topics.length > 3 && '...'}
              </div>
            )}
            
            {/* عرض الكلمات المفتاحية */}
            {advancedAnalysis?.keywords_extracted && advancedAnalysis.keywords_extracted.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">كلمات مفتاحية: </span>
                {advancedAnalysis.keywords_extracted.slice(0, 4).join(' • ')}
                {advancedAnalysis.keywords_extracted.length > 4 && '...'}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!article.is_analyzed ? (
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !projectId}
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  تحليل متقدم...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  تحليل متقدم
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !projectId}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    إعادة التحليل...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    إعادة التحليل
                  </>
                )}
              </Button>

              {/* زر عرض التحليل التفصيلي */}
              {advancedAnalysis && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      التفاصيل
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-right">
                        تحليل تفصيلي: {article.title}
                      </DialogTitle>
                    </DialogHeader>
                    <ArticleAnalysisChart analysis={advancedAnalysis} />
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
          
          {article.link && (
            <Button 
              asChild 
              variant="outline" 
              size="sm"
            >
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                المصدر
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNewsArticleCard;
