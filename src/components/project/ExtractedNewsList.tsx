
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import NewsArticleCard from "./NewsArticleCard";
import NewsEmptyState from "./NewsEmptyState";
import { useNewsAnalysis } from "@/hooks/useNewsAnalysis";
import { useNewsDeletion } from "@/hooks/useNewsDeletion";

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

interface ExtractedNewsListProps {
  projectId: string;
  onAnalysisComplete?: () => void;
}

const ExtractedNewsList = ({ projectId, onAnalysisComplete }: ExtractedNewsListProps) => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();

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

  const { analyzingArticles, analyzeArticle } = useNewsAnalysis(projectId, () => {
    refetch();
    if (onAnalysisComplete) {
      onAnalysisComplete();
    }
  });

  const { deletingArticles, deleteArticle } = useNewsDeletion();

  const handleDeleteArticle = (articleId: string) => {
    deleteArticle(articleId, refetch);
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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          {isRTL ? "الأخبار المحفوظة" : "Saved News Articles"}
          <Badge variant="secondary">{savedNews?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!savedNews || savedNews.length === 0 ? (
          <NewsEmptyState />
        ) : (
          <div className="space-y-4">
            {savedNews.map((article) => (
              <NewsArticleCard
                key={article.id}
                article={article}
                onAnalyze={analyzeArticle}
                onDelete={handleDeleteArticle}
                isAnalyzing={analyzingArticles[article.id] || false}
                isDeleting={deletingArticles[article.id] || false}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtractedNewsList;
