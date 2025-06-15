
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
  image_url?: string;
  source_id?: string;
  source_icon?: string;
  source_name?: string;
  creator?: string[]; // usually an array
  keywords?: string[];
  category?: string[];
  sentiment?: string;
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
      const response = await fetch(`/functions/v1/scrape-newsdata?query=${encodeURIComponent(kw)}`);
      let data: any;

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Unexpected response (not JSON):", text);
        toast({
          title: isRTL ? "خطأ في جلب الأخبار" : "Error fetching news",
          description: isRTL
            ? "لم يتم العثور على أخبار أو حدث خطأ في الخادم."
            : "No news found or server error.",
          variant: "destructive",
        });
        setNews([]);
        return;
      }

      // NewsData.io now returns articles as data.articles or data.results
      let articles: NewsArticle[] = [];
      if (Array.isArray(data.articles)) {
        articles = data.articles;
      } else if (Array.isArray(data.results)) {
        articles = data.results;
      }

      if (articles.length > 0) {
        setNews(articles.slice(0, 10));
      } else {
        toast({
          title: isRTL ? "لا توجد نتائج" : "No news found",
          description: isRTL
            ? "لم يتم العثور على أخبار مطابقة لهذه الكلمة."
            : "No matching news articles for this keyword.",
          variant: "destructive",
        });
        setNews([]);
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
            placeholder={
              isRTL ? "أدخل كلمة البحث مثل: الصحة، فلسطين..." : "Enter search term e.g. health, Palestine..."
            }
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
                    {/* Header: source icon, title, sentiment badge */}
                    <div className="flex items-center gap-3">
                      {a.source_icon ? (
                        <img
                          src={a.source_icon}
                          alt={a.source_id || a.source_name || ""}
                          className="w-6 h-6 rounded"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs bg-muted rounded px-2 py-1">
                          {a.source_name || a.source_id || ""}
                        </span>
                      )}
                      <span className="font-semibold flex-1">{a.title}</span>
                      {a.sentiment && (
                        <span
                          className={`px-2 py-1 rounded text-xs
                            ${a.sentiment === "positive"
                              ? "bg-green-100 text-green-800"
                              : a.sentiment === "negative"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {isRTL
                            ? a.sentiment === "positive"
                              ? "إيجابي"
                              : a.sentiment === "negative"
                              ? "سلبي"
                              : "محايد"
                            : a.sentiment.charAt(0).toUpperCase() + a.sentiment.slice(1)}
                        </span>
                      )}
                    </div>
                    {/* Image */}
                    {a.image_url && (
                      <img
                        src={a.image_url}
                        alt={a.title}
                        className="w-full max-w-xs rounded object-cover my-1"
                        loading="lazy"
                      />
                    )}
                    {/* Description/Content */}
                    <div className="text-xs text-muted-foreground whitespace-pre-line line-clamp-3 max-w-prose">
                      {(a.description || a.content || "").slice(0, 200)}...
                    </div>
                    {/* Author/Creator */}
                    {(a.creator && a.creator.length > 0) && (
                      <div className="text-xs">
                        <span className="font-medium">{isRTL ? "الكاتب" : "By"}: </span>
                        {a.creator.join(", ")}
                      </div>
                    )}
                    {/* Keywords and Categories as tags */}
                    <div className="flex flex-wrap gap-1">
                      {a.category && a.category.map((cat, idx) => (
                        <span
                          key={cat + idx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                        >
                          {cat}
                        </span>
                      ))}
                      {a.keywords && a.keywords.map((kw, idx) => (
                        <span
                          key={kw + idx}
                          className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                    {/* Links and date */}
                    <div className="flex gap-2 py-1 items-center">
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
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? "تاريخ:" : "Date:"}{" "}
                        {a.pubDate ? new Date(a.pubDate).toLocaleString() : "-"}
                      </span>
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
