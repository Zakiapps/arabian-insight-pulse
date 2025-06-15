
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Send, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExtractedNewsListProps {
  projectId: string;
}

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
    // نجلب الأخبار المستخرجة فقط (من uploads - المصدر newsapi)
    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("project_id", projectId)
      .eq("source", "newsapi")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      toast({
        title: isRTL ? "خطأ في جلب الأخبار" : "Error fetching news",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNews(data || []);
    }
    setLoading(false);
  };

  // محاكاة الإرسال إلى تحليل المشاعر أو التلخيص
  const handleAction = (article: any, type: "sentiment" | "summary") => {
    setActionLoading(article.id + "-" + type);
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
              key={a.id}
              className="p-4 border rounded-lg bg-white flex flex-col gap-2 shadow-sm"
            >
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground whitespace-pre-line line-clamp-3 max-w-prose">
                {(a.raw_text || "").slice(0, 200)}...
              </div>
              <div className="flex gap-2 py-1">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={actionLoading === a.id + "-sentiment"}
                  onClick={() => handleAction(a, "sentiment")}
                >
                  {actionLoading === a.id + "-sentiment"
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
                  disabled={actionLoading === a.id + "-summary"}
                  onClick={() => handleAction(a, "summary")}
                >
                  {actionLoading === a.id + "-summary"
                    ? isRTL
                      ? "جاري التلخيص..."
                      : "Summarizing..."
                    : isRTL
                    ? "تلخيص"
                    : "Summarize"}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
                {a.metadata?.url && (
                  <a
                    href={a.metadata.url}
                    target="_blank"
                    className="text-blue-600 underline text-xs ml-2"
                  >
                    {isRTL ? "رابط الخبر" : "News Link"}
                  </a>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "تاريخ:" : "Date:"}{" "}
                {a.metadata?.publishedAt
                  ? new Date(a.metadata.publishedAt).toLocaleString()
                  : a.created_at
                    ? new Date(a.created_at).toLocaleString()
                    : "-"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractedNewsList;
