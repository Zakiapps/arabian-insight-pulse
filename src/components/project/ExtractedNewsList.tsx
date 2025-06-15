
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Send, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface ExtractedNewsListProps {
  projectId: string;
}

const QUERY_KEYWORD = "technology"; // Can be customized per-project in future

const ExtractedNewsList = ({ projectId }: ExtractedNewsListProps) => {
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) fetchExtractedNews();
    // eslint-disable-next-line
  }, [projectId]);

  const fetchExtractedNews = async () => {
    setLoading(true);
    // Fetch news articles from Supabase Edge Function (proxy to newsdata.io)
    try {
      const response = await fetch(`/functions/v1/scrape-newsdata?project_id=${projectId}&query=${QUERY_KEYWORD}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.articles)) {
        setNews(data.articles.slice(0, 10));
      } else {
        toast({
          title: isRTL ? "خطأ في جلب الأخبار" : "Error fetching news",
          description: data.error || "",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: isRTL ? "خطأ في جلب الأخبار" : "Error fetching news",
        description: error?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // محاكاة الإرسال إلى تحليل المشاعر أو التلخيص
  const handleAction = (article: any, type: "sentiment" | "summary") => {
    setActionLoading(article.article_id + "-" + type);
    setTimeout(() => {
      toast({
        title:
          type === "sentiment"
            ? isRTL
              ? "تم إرسال النص"
              : "Sent to Sentiment Analysis"
            : isRTL
            ? "تم إرسال النص للتلخيص"
            : "Sent for Summarization",
        description: article.title,
      });
      setActionLoading(null);
    }, 800);
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            {isRTL ? "جاري تحميل الأخبار..." : "Loading news..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!news.length) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          {isRTL ? "آخر الأخبار المستخرجة" : "Latest Extracted News"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((a) => (
            <div
              key={a.article_id}
              className="p-4 border rounded-lg bg-white flex flex-col gap-2 shadow-sm"
            >
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground whitespace-pre-line line-clamp-3 max-w-prose">
                {(a.description || a.content || "").slice(0, 200)}...
              </div>
              <div className="flex gap-2 py-1">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={actionLoading === a.article_id + "-sentiment"}
                  onClick={() => handleAction(a, "sentiment")}
                >
                  {actionLoading === a.article_id + "-sentiment"
                    ? isRTL
                      ? "جاري الإرسال ..."
                      : "Sending..."
                    : isRTL
                    ? "تحليل المشاعر"
                    : "Analyze Sentiment"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionLoading === a.article_id + "-summary"}
                  onClick={() => handleAction(a, "summary")}
                >
                  {actionLoading === a.article_id + "-summary"
                    ? isRTL
                      ? "جاري التلخيص..."
                      : "Summarizing..."
                    : isRTL
                    ? "تلخيص"
                    : "Summarize"}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    className="text-blue-600 underline text-xs ml-2"
                  >
                    {isRTL ? "رابط الخبر" : "News Link"}
                  </a>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "تاريخ:" : "Date:"}{" "}
                {a.pubDate ? new Date(a.pubDate).toLocaleString() : "-"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractedNewsList;
