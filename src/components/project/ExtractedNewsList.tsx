
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Newspaper, Sparkles, CheckSquare, Square } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import NewsArticleCard from "./NewsArticleCard";
import NewsEmptyState from "./NewsEmptyState";
import { useNewsDeletion } from "@/hooks/useNewsDeletion";
import { useBatchAnalysis } from "@/hooks/useBatchAnalysis";
import { SavedNewsArticle } from "@/types/news";

interface ExtractedNewsListProps {
  projectId: string;
  onAnalysisComplete?: () => void;
}

const ExtractedNewsList = ({ projectId, onAnalysisComplete }: ExtractedNewsListProps) => {
  console.log('ExtractedNewsList rendered with projectId:', projectId);
  
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const { data: savedNews, isLoading, refetch } = useQuery({
    queryKey: ['saved-news', projectId],
    queryFn: async () => {
      console.log('Fetching saved news for projectId:', projectId);
      if (!projectId) {
        console.error('No projectId provided to query');
        throw new Error('Project ID is required');
      }
      
      const { data, error } = await supabase
        .from('scraped_news')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching saved news:', error);
        throw error;
      }
      console.log('Fetched saved news:', data?.length, 'articles');
      return data as SavedNewsArticle[];
    },
    enabled: !!projectId && !!user
  });

  const handleAnalysisComplete = () => {
    console.log('Analysis completed, refreshing data...');
    refetch();
    if (onAnalysisComplete) {
      onAnalysisComplete();
    }
  };

  const { deletingArticles, deleteArticle } = useNewsDeletion();
  const { isAnalyzing: isBatchAnalyzing, analyzeAllUnanalyzed, analyzeSelected } = useBatchAnalysis(projectId);

  const handleDeleteArticle = (articleId: string) => {
    deleteArticle(articleId, refetch);
  };

  const handleSelectArticle = (articleId: string, selected: boolean) => {
    if (selected) {
      setSelectedArticles(prev => [...prev, articleId]);
    } else {
      setSelectedArticles(prev => prev.filter(id => id !== articleId));
    }
  };

  const handleSelectAll = () => {
    if (!savedNews) return;
    const unanalyzedIds = savedNews.filter(article => !article.is_analyzed).map(article => article.id);
    setSelectedArticles(unanalyzedIds);
  };

  const handleDeselectAll = () => {
    setSelectedArticles([]);
  };

  const handleBulkAnalyzeSelected = async () => {
    if (selectedArticles.length === 0) return;
    
    const result = await analyzeSelected(selectedArticles);
    if (result?.success) {
      setSelectedArticles([]);
      setSelectionMode(false);
      handleAnalysisComplete();
    }
  };

  const handleAnalyzeAllUnanalyzed = async () => {
    const result = await analyzeAllUnanalyzed();
    if (result?.success) {
      handleAnalysisComplete();
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

  const unanalyzedCount = savedNews?.filter(article => !article.is_analyzed).length || 0;
  const analyzedCount = savedNews?.filter(article => article.is_analyzed).length || 0;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          {isRTL ? "الأخبار المحفوظة" : "Saved News Articles"}
          <Badge variant="secondary">{savedNews?.length || 0}</Badge>
          {analyzedCount > 0 && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              {analyzedCount} محلل
            </Badge>
          )}
          {unanalyzedCount > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
              {unanalyzedCount} غير محلل
            </Badge>
          )}
        </CardTitle>

        {/* Bulk Analysis Controls */}
        {savedNews && savedNews.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {unanalyzedCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleAnalyzeAllUnanalyzed}
                disabled={isBatchAnalyzing}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isBatchAnalyzing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isRTL ? `تحليل الكل (${unanalyzedCount})` : `Analyze All (${unanalyzedCount})`}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectionMode(!selectionMode)}
              disabled={isBatchAnalyzing}
            >
              {selectionMode ? (
                <CheckSquare className="h-4 w-4 mr-2" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              {isRTL ? "وضع التحديد" : "Selection Mode"}
            </Button>

            {selectionMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={unanalyzedCount === 0}
                >
                  {isRTL ? "تحديد الكل" : "Select All"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedArticles.length === 0}
                >
                  {isRTL ? "إلغاء التحديد" : "Deselect All"}
                </Button>

                {selectedArticles.length > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleBulkAnalyzeSelected}
                    disabled={isBatchAnalyzing}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {isBatchAnalyzing ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    {isRTL ? `تحليل المحدد (${selectedArticles.length})` : `Analyze Selected (${selectedArticles.length})`}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
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
                projectId={projectId}
                onAnalysisComplete={handleAnalysisComplete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtractedNewsList;
