
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trash2, ExternalLink, Sparkles } from "lucide-react";

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
}

const NewsArticleCard = ({ article, onAnalyze, onDelete, isAnalyzing, isDeleting }: NewsArticleCardProps) => {
  const { isRTL } = useLanguage();

  return (
    <div className="p-4 border rounded-lg bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
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
        {!article.is_analyzed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAnalyze(article)}
            disabled={isAnalyzing}
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
      </div>
    </div>
  );
};

export default NewsArticleCard;
