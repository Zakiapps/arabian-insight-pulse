
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, ExternalLink, Clock, Globe, Newspaper, CheckCircle, AlertCircle } from 'lucide-react';
import { useNewsAnalysis } from '@/hooks/useNewsAnalysis';

interface NewsArticle {
  id: string;
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

interface NewsArticleCardProps {
  article: NewsArticle;
  projectId: string;
  onAnalysisComplete?: () => void;
}

const NewsArticleCard = ({ article, projectId, onAnalysisComplete }: NewsArticleCardProps) => {
  const { analyzingArticles, analyzeArticle } = useNewsAnalysis(projectId, onAnalysisComplete);
  
  const isAnalyzing = analyzingArticles[article.id];

  const handleAnalyze = () => {
    analyzeArticle(article);
  };

  const getContentSourceIcon = () => {
    if (article.content && article.content.length > 100) {
      return <CheckCircle className="h-4 w-4 text-green-600" title="محتوى كامل متوفر" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-orange-600" title="سيتم التحليل باستخدام العنوان والوصف" />;
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
        </div>

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
              
              {article.emotion && (
                <Badge variant="outline" className="text-xs">
                  {article.emotion}
                </Badge>
              )}
              
              {article.dialect === 'jordanian' && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  🇯🇴 أردني {article.dialect_confidence && `(${Math.round(article.dialect_confidence)}%)`}
                </Badge>
              )}
            </div>
            
            {article.dialect_indicators && article.dialect_indicators.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">دلائل لهجة: </span>
                {article.dialect_indicators.slice(0, 3).join(', ')}
                {article.dialect_indicators.length > 3 && '...'}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!article.is_analyzed ? (
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              size="sm"
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  تحليل المشاعر
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
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

export default NewsArticleCard;
