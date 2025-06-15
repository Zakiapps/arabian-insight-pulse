
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trash2, ExternalLink, Sparkles, AlertTriangle, CheckCircle, Info } from "lucide-react";

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

interface NewsArticleCardProps {
  article: SavedNewsArticle;
  onAnalyze: (article: SavedNewsArticle) => void;
  onDelete: (articleId: string) => void;
  isAnalyzing: boolean;
  isDeleting: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

const NewsArticleCard = ({ 
  article, 
  onAnalyze, 
  onDelete, 
  isAnalyzing, 
  isDeleting,
  selectionMode = false,
  selected = false,
  onSelect
}: NewsArticleCardProps) => {
  const { isRTL } = useLanguage();

  // Enhanced content quality assessment with fallback support
  const getContentQuality = () => {
    const content = article.content || '';
    const description = article.description || '';
    const title = article.title || '';
    
    // Check for placeholder content patterns
    const placeholderPatterns = [
      /ONLY AVAILABLE IN PAID PLANS/i,
      /upgrade to premium/i,
      /subscribe to read/i,
      /premium content/i,
      /paywall/i
    ];
    
    const hasPlaceholder = placeholderPatterns.some(pattern => 
      pattern.test(content) || pattern.test(description)
    );
    
    // If main content is blocked, check if we have usable title + description
    if (hasPlaceholder) {
      const fallbackText = `${title} ${description}`.trim();
      const fallbackWordCount = fallbackText.split(/\s+/).length;
      const hasArabic = /[\u0600-\u06FF]/.test(fallbackText);
      
      if (!hasArabic || fallbackWordCount < 5) {
        return { 
          level: 'blocked', 
          score: 0, 
          message: 'محتوى محجوب - لا يوجد نص كافي',
          icon: AlertTriangle,
          color: 'text-red-600 bg-red-50',
          canAnalyze: false
        };
      }
      
      // We have usable fallback content
      return { 
        level: 'fallback', 
        score: Math.min(fallbackWordCount * 3, 60), 
        message: 'تحليل العنوان والوصف متاح',
        icon: Info,
        color: 'text-blue-600 bg-blue-50',
        canAnalyze: true
      };
    }

    // Regular content assessment
    const totalLength = content.length + description.length + title.length;
    const wordCount = (content + ' ' + description + ' ' + title).split(/\s+/).length;
    
    if (content.length > 500) {
      return { 
        level: 'excellent', 
        score: 95, 
        message: 'محتوى ممتاز للتحليل',
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50',
        canAnalyze: true
      };
    } else if (content.length > 200 || (description.length > 100 && title.length > 20)) {
      return { 
        level: 'good', 
        score: 75, 
        message: 'محتوى جيد للتحليل',
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50',
        canAnalyze: true
      };
    } else if (description.length > 50 || title.length > 30) {
      return { 
        level: 'fair', 
        score: 50, 
        message: 'محتوى محدود للتحليل',
        icon: Info,
        color: 'text-yellow-600 bg-yellow-50',
        canAnalyze: true
      };
    } else {
      return { 
        level: 'poor', 
        score: 25, 
        message: 'محتوى قصير للتحليل',
        icon: AlertTriangle,
        color: 'text-orange-600 bg-orange-50',
        canAnalyze: true
      };
    }
  };

  const contentQuality = getContentQuality();
  const QualityIcon = contentQuality.icon;

  return (
    <div className={`p-4 border rounded-lg bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow ${
      selectionMode && selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    }`}>
      {/* Header with selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {selectionMode && (
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              disabled={article.is_analyzed || !contentQuality.canAnalyze}
            />
          )}
          
          {article.source_icon ? (
            <img
              src={article.source_icon}
              alt={article.source_name || ""}
              className="w-6 h-6 rounded"
              loading="lazy"
            />
          ) : (
            <span className="text-xs bg-muted rounded px-2 py-1">
              {article.source_name || ""}
            </span>
          )}
          
          <div className="flex-1">
            <h3 className="font-semibold text-sm line-clamp-2">{article.title}</h3>
            <div className="text-xs text-muted-foreground">
              {article.pub_date ? new Date(article.pub_date).toLocaleDateString() : 
               new Date(article.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Status badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={article.language === 'ar' ? 'default' : 'secondary'}>
            {article.language === 'ar' ? (isRTL ? 'عربي' : 'Arabic') : (isRTL ? 'إنجليزي' : 'English')}
          </Badge>
          
          {article.is_analyzed && article.sentiment && (
            <Badge
              variant={
                article.sentiment === 'positive' ? 'default' :
                article.sentiment === 'negative' ? 'destructive' : 'secondary'
              }
            >
              {isRTL
                ? article.sentiment === 'positive' ? 'إيجابي' : 
                  article.sentiment === 'negative' ? 'سلبي' : 'محايد'
                : article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
            </Badge>
          )}

          {article.emotion && (
            <Badge variant="outline" className="text-xs">
              {article.emotion}
            </Badge>
          )}

          {article.dialect === 'jordanian' && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
              🇯🇴 أردني
            </Badge>
          )}
        </div>
      </div>

      {/* Enhanced Content Quality Indicator */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${contentQuality.color}`}>
        <QualityIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{contentQuality.message}</span>
        <Badge variant="outline" className="text-xs">
          {contentQuality.score}%
        </Badge>
        {contentQuality.level === 'fallback' && (
          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
            عنوان + وصف
          </Badge>
        )}
      </div>

      {/* Enhanced Analysis Display */}
      {article.is_analyzed && (article.dialect_indicators?.length || article.emotional_markers?.length) && (
        <div className="space-y-2">
          {article.dialect_indicators && article.dialect_indicators.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-blue-600 font-medium">مؤشرات أردنية:</span>
              {article.dialect_indicators.slice(0, 5).map((indicator, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {indicator}
                </Badge>
              ))}
              {article.dialect_indicators.length > 5 && (
                <span className="text-xs text-blue-600">+{article.dialect_indicators.length - 5}</span>
              )}
            </div>
          )}
          
          {article.emotional_markers && article.emotional_markers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-purple-600 font-medium">مؤشرات عاطفية:</span>
              {article.emotional_markers.slice(0, 3).map((marker, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                  {marker}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image */}
      {article.image_url && (
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full max-w-sm rounded object-cover"
          loading="lazy"
        />
      )}

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-3">
        {article.description || article.content || ""}
      </p>

      {/* Tags */}
      {(article.category?.length || article.keywords?.length) && (
        <div className="flex flex-wrap gap-1">
          {article.category?.map((cat, idx) => (
            <span
              key={cat + idx}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
            >
              {cat}
            </span>
          ))}
          {article.keywords?.slice(0, 3).map((kw, idx) => (
            <span
              key={kw + idx}
              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        {!article.is_analyzed && !selectionMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAnalyze(article)}
            disabled={isAnalyzing || !contentQuality.canAnalyze}
            className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
          >
            {isAnalyzing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            {isRTL ? "تحليل بـ MARBERT" : "Analyze with MARBERT"}
          </Button>
        )}
        
        {article.link && (
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              {isRTL ? "فتح الرابط" : "Open Link"}
            </a>
          </Button>
        )}
        
        {!selectionMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(article.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            {isRTL ? "حذف" : "Delete"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NewsArticleCard;
