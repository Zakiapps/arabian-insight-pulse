
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, Trash2, ExternalLink, Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
  is_analyzed: boolean;
  created_at: string;
}

interface ExtractedNewsListProps {
  projectId: string;
}

const ExtractedNewsList = ({ projectId }: ExtractedNewsListProps) => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [analyzingArticles, setAnalyzingArticles] = useState<Record<string, boolean>>({});
  const [deletingArticles, setDeletingArticles] = useState<Record<string, boolean>>({});

  const { data: savedNews, isLoading, refetch } = useQuery({
    queryKey: ['saved-news', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraped_news')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavedNewsArticle[];
    },
    enabled: !!projectId && !!user
  });

  const analyzeArticle = async (article: SavedNewsArticle) => {
    if (!user) return;

    setAnalyzingArticles(prev => ({ ...prev, [article.id]: true }));

    try {
      const textToAnalyze = article.content || article.description || article.title;
      
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: {
          text: textToAnalyze,
          source: 'scraped_news',
          user_id: user.id
        }
      });

      if (error) throw error;

      // Update the article as analyzed with sentiment
      await supabase
        .from('scraped_news')
        .update({ 
          is_analyzed: true, 
          sentiment: data.sentiment,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      await refetch();

      toast({
        title: isRTL ? "تم التحليل" : "Analysis Complete",
        description: isRTL 
          ? `المشاعر: ${data.sentiment === 'positive' ? 'إيجابي' : data.sentiment === 'negative' ? 'سلبي' : 'محايد'}`
          : `Sentiment: ${data.sentiment}`,
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

  const deleteArticle = async (articleId: string) => {
    setDeletingArticles(prev => ({ ...prev, [articleId]: true }));

    try {
      const { error } = await supabase
        .from('scraped_news')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      await refetch();

      toast({
        title: isRTL ? "تم الحذف" : "Deleted Successfully",
        description: isRTL ? "تم حذف المقال" : "Article deleted",
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: isRTL ? "خطأ في الحذف" : "Delete Error",
        description: error.message || "Failed to delete article",
        variant: "destructive",
      });
    } finally {
      setDeletingArticles(prev => ({ ...prev, [articleId]: false }));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            {isRTL ? "الأخبار المحفوظة" : "Saved News Articles"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          {isRTL ? "الأخبار المحفوظة" : "Saved News Articles"}
          <Badge variant="secondary">{savedNews?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!savedNews || savedNews.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <div className="mb-2">
              {isRTL ? "لا توجد أخبار محفوظة" : "No saved news articles"}
            </div>
            <p className="text-sm">
              {isRTL ? "قم بالبحث وحفظ المقالات لعرضها هنا" : "Search and save articles to see them here"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedNews.map((article) => (
              <div
                key={article.id}
                className="p-4 border rounded-lg bg-white flex flex-col gap-3 shadow-sm"
              >
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
                  <div className="flex gap-2">
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
                  </div>
                </div>

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
                      onClick={() => analyzeArticle(article)}
                      disabled={analyzingArticles[article.id]}
                    >
                      {analyzingArticles[article.id] ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Brain className="h-4 w-4 mr-1" />
                      )}
                      {isRTL ? "تحليل بـ AraBERT" : "Analyze with AraBERT"}
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
                    onClick={() => deleteArticle(article.id)}
                    disabled={deletingArticles[article.id]}
                  >
                    {deletingArticles[article.id] ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    {isRTL ? "حذف" : "Delete"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtractedNewsList;
