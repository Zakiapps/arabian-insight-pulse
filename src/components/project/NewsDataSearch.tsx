
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Newspaper, Search } from "lucide-react";

interface NewsArticle {
  article_id: string;
  title: string;
  description?: string;
  content?: string;
  pubDate?: string;
  link?: string;
}

const NewsDataSearch = () => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchNews = async (kw: string) => {
    setLoading(true);
    setHasSearched(true);
    setNews([]);
    try {
      // Use Supabase Edge function proxy
      const response = await fetch(`/functions/v1/scrape-newsdata?query=${encodeURIComponent(kw)}`);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim() === "") {
      toast({
        title: isRTL ? "يرجى إدخال كلمة بحث" : "Please enter a keyword",
      });
      return;
    }
    fetchNews(keyword.trim());
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          {isRTL ? "البحث في أخبار NewsData.io" : "Search NewsData.io"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col md:flex-row gap-3 mb-4"
          onSubmit={handleSubmit}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <Input
            type="text"
            placeholder={isRTL ? "أدخل كلمة البحث مثل: الصحة، فلسطين..." : "Enter search term e.g. health, Palestine..."}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading} className="flex-shrink-0">
            <Search className="mr-2 h-4 w-4" />
            {isRTL ? "بحث" : "Search"}
          </Button>
        </form>
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        {hasSearched && !loading && (
          <>
            {news.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                {isRTL ? "لم يتم العثور على أخبار." : "No news found."}
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((a) => (
                  <div
                    key={a.article_id || a.title}
                    className="p-4 border rounded-lg bg-white flex flex-col gap-2 shadow-sm"
                  >
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-xs text-muted-foreground whitespace-pre-line line-clamp-3 max-w-prose">
                      {(a.description || a.content || "").slice(0, 200)}...
                    </div>
                    <div className="flex gap-2 py-1">
                      {a.link && (
                        <a
                          href={a.link}
                          target="_blank"
                          rel="noopener noreferrer"
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
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsDataSearch;
