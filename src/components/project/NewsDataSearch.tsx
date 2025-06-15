
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Newspaper, Search, Wifi, WifiOff, Save, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";

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
  creator?: string[];
  keywords?: string[];
  category?: string[];
  sentiment?: string;
}

interface NewsDataSearchProps {
  onNewsSaved?: () => void; // Callback to refresh the news list
}

const NewsDataSearch = ({ onNewsSaved }: NewsDataSearchProps) => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const { projectId } = useParams();
  const [keyword, setKeyword] = useState("");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'failed'>('unknown');
  const [hasSearched, setHasSearched] = useState(false);
  const [savingArticles, setSavingArticles] = useState<Record<string, boolean>>({});
  const [analyzingArticles, setAnalyzingArticles] = useState<Record<string, boolean>>({});

  // Function to detect if text contains Arabic characters
  const isArabicText = (text: string) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicRegex.test(text);
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      console.log("Testing NewsData.io connection...");
      
      const { data, error } = await supabase.functions.invoke('scrape-newsdata', {
        body: { 
          test: true,
          query: 'test'
        }
      });
      
      console.log("Test response:", { data, error });
      
      if (error) {
        throw new Error(error.message || "Function invocation failed");
      }
      
      if (data?.success) {
        setConnectionStatus('success');
        toast({
          title: isRTL ? "تم الاتصال بنجاح" : "Connection Successful",
          description: isRTL 
            ? `تم العثور على ${data.totalResults || 0} مقال متاح`
            : `Found ${data.totalResults || 0} articles available`,
        });
      } else {
        setConnectionStatus('failed');
        toast({
          title: isRTL ? "فشل في الاتصال" : "Connection Failed",
          description: data?.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Connection test failed:", error);
      setConnectionStatus('failed');
      toast({
        title: isRTL ? "فشل في الاتصال" : "Connection Failed",
        description: error.message || "Unable to connect to NewsData.io",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const fetchNews = async (kw: string) => {
    setLoading(true);
    setHasSearched(true);
    setNews([]);
    
    try {
      console.log("Fetching news for keyword:", kw);
      
      // Detect if keyword is Arabic and set appropriate language
      const isArabic = isArabicText(kw);
      const language = isArabic ? 'ar' : 'en';
      
      console.log("Detected language:", language, "for keyword:", kw);
      
      const { data, error } = await supabase.functions.invoke('scrape-newsdata', {
        body: { 
          query: kw,
          language: language
        }
      });
      
      console.log("Fetch response:", { data, error });
      
      if (error) {
        throw new Error(error.message || "Function invocation failed");
      }

      if (!data?.success) {
        throw new Error(data?.error || "API request failed");
      }

      // NewsData.io returns articles in 'results' field
      const articles: NewsArticle[] = Array.isArray(data.results) ? data.results : [];
      
      if (articles.length > 0) {
        setNews(articles.slice(0, 10)); // Show first 10 articles
        setConnectionStatus('success');
        toast({
          title: isRTL ? "تم جلب الأخبار" : "News Fetched",
          description: isRTL 
            ? `تم العثور على ${articles.length} خبر`
            : `Found ${articles.length} articles`,
        });
      } else {
        setNews([]);
        toast({
          title: isRTL ? "لا توجد نتائج" : "No Results",
          description: isRTL
            ? "لم يتم العثور على أخبار مطابقة لهذه الكلمة."
            : "No articles found for this keyword.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("News fetch error:", error);
      setConnectionStatus('failed');
      toast({
        title: isRTL ? "خطأ في جلب الأخبار" : "Error Fetching News",
        description: error.message || "Failed to fetch news",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveArticleToProject = async (article: NewsArticle) => {
    if (!user || !projectId) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يجب تسجيل الدخول أولاً" : "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    setSavingArticles(prev => ({ ...prev, [article.article_id]: true }));

    try {
      const { error } = await supabase
        .from('scraped_news')
        .insert({
          project_id: projectId,
          user_id: user.id,
          article_id: article.article_id,
          title: article.title,
          description: article.description,
          content: article.content,
          source_name: article.source_name,
          source_icon: article.source_icon,
          image_url: article.image_url,
          link: article.link,
          pub_date: article.pubDate ? new Date(article.pubDate).toISOString() : null,
          language: isArabicText(article.title || '') ? 'ar' : 'en',
          category: article.category || [],
          keywords: article.keywords || [],
        });

      if (error) throw error;

      // Call the callback to refresh the news list in the dashboard
      if (onNewsSaved) {
        onNewsSaved();
      }

      toast({
        title: isRTL ? "تم الحفظ" : "Saved Successfully",
        description: isRTL ? "تم حفظ المقال في المشروع" : "Article saved to project",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: isRTL ? "خطأ في الحفظ" : "Save Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    } finally {
      setSavingArticles(prev => ({ ...prev, [article.article_id]: false }));
    }
  };

  const analyzeAndSaveArticle = async (article: NewsArticle) => {
    if (!user || !projectId) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يجب تسجيل الدخول أولاً" : "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    setAnalyzingArticles(prev => ({ ...prev, [article.article_id]: true }));

    try {
      // First save the article to the project
      const { data: savedArticle, error: saveError } = await supabase
        .from('scraped_news')
        .insert({
          project_id: projectId,
          user_id: user.id,
          article_id: article.article_id,
          title: article.title,
          description: article.description,
          content: article.content,
          source_name: article.source_name,
          source_icon: article.source_icon,
          image_url: article.image_url,
          link: article.link,
          pub_date: article.pubDate ? new Date(article.pubDate).toISOString() : null,
          language: isArabicText(article.title || '') ? 'ar' : 'en',
          category: article.category || [],
          keywords: article.keywords || [],
          is_analyzed: false,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Then analyze the article using AraBERT
      const textToAnalyze = article.content || article.description || article.title;
      
      if (!textToAnalyze || textToAnalyze.trim().length === 0) {
        throw new Error(isRTL ? "لا يوجد نص للتحليل" : "No text to analyze");
      }

      console.log("Analyzing text:", textToAnalyze.substring(0, 100));
      
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-text', {
        body: {
          text: textToAnalyze
        }
      });

      console.log("Analysis response:", { analysisData, analysisError });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        throw new Error(analysisError.message || "Analysis failed");
      }

      if (!analysisData) {
        throw new Error("No analysis data received");
      }

      // Update the saved article with analysis results
      const { error: updateError } = await supabase
        .from('scraped_news')
        .update({ 
          is_analyzed: true, 
          sentiment: analysisData.sentiment || 'neutral',
          updated_at: new Date().toISOString()
        })
        .eq('id', savedArticle.id);

      if (updateError) throw updateError;

      // Call the callback to refresh the news list in the dashboard
      if (onNewsSaved) {
        onNewsSaved();
      }

      const sentimentText = analysisData.sentiment === 'positive' ? 
        (isRTL ? 'إيجابي' : 'Positive') : 
        analysisData.sentiment === 'negative' ? 
        (isRTL ? 'سلبي' : 'Negative') : 
        (isRTL ? 'محايد' : 'Neutral');

      toast({
        title: isRTL ? "تم التحليل والحفظ" : "Analyzed and Saved",
        description: isRTL 
          ? `تم حفظ المقال وتحليله. المشاعر: ${sentimentText}`
          : `Article saved and analyzed. Sentiment: ${sentimentText}`,
      });
    } catch (error: any) {
      console.error("Analysis and save error:", error);
      toast({
        title: isRTL ? "خطأ في التحليل والحفظ" : "Analysis and Save Error",
        description: error.message || "Failed to analyze and save article",
        variant: "destructive",
      });
    } finally {
      setAnalyzingArticles(prev => ({ ...prev, [article.article_id]: false }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim() === "") {
      toast({
        title: isRTL ? "يرجى إدخال كلمة بحث" : "Please enter a keyword",
        variant: "destructive",
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
          {connectionStatus === 'success' && <Wifi className="h-4 w-4 text-green-500" />}
          {connectionStatus === 'failed' && <WifiOff className="h-4 w-4 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Connection Test Section */}
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {isRTL ? "حالة الاتصال:" : "Connection Status:"} 
              <span className={`ml-2 font-medium ${
                connectionStatus === 'success' ? 'text-green-600' : 
                connectionStatus === 'failed' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {connectionStatus === 'success' ? (isRTL ? 'متصل' : 'Connected') :
                 connectionStatus === 'failed' ? (isRTL ? 'غير متصل' : 'Failed') :
                 (isRTL ? 'غير معروف' : 'Unknown')}
              </span>
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testConnection}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                isRTL ? "اختبار الاتصال" : "Test Connection"
              )}
            </Button>
          </div>
        </div>

        {/* Search Form */}
        <form
          className="flex flex-col md:flex-row gap-3 mb-4"
          onSubmit={handleSubmit}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <Input
            type="text"
            placeholder={
              isRTL ? "أدخل كلمة البحث مثل: الصحة، فلسطين، الأردن..." : "Enter search term e.g. health, Palestine, Jordan..."
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

        {/* Language Detection Info */}
        {keyword && (
          <div className="mb-4 text-xs text-muted-foreground">
            {isRTL ? "اللغة المكتشفة:" : "Detected language:"} {isArabicText(keyword) ? (isRTL ? "العربية" : "Arabic") : (isRTL ? "الإنجليزية" : "English")}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {/* Results */}
        {hasSearched && !loading && (
          <>
            {news.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                {isRTL ? "لم يتم العثور على أخبار." : "No news found."}
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((article) => (
                  <div
                    key={article.article_id || article.title}
                    className="p-4 border rounded-lg bg-white flex flex-col gap-2 shadow-sm"
                  >
                    {/* Header with source icon, title, and sentiment */}
                    <div className="flex items-center gap-3">
                      {article.source_icon ? (
                        <img
                          src={article.source_icon}
                          alt={article.source_id || article.source_name || ""}
                          className="w-6 h-6 rounded"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs bg-muted rounded px-2 py-1">
                          {article.source_name || article.source_id || ""}
                        </span>
                      )}
                      <span className="font-semibold flex-1">{article.title}</span>
                      {article.sentiment && (
                        <span
                          className={`px-2 py-1 rounded text-xs
                            ${article.sentiment === "positive"
                              ? "bg-green-100 text-green-800"
                              : article.sentiment === "negative"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {isRTL
                            ? article.sentiment === "positive"
                              ? "إيجابي"
                              : article.sentiment === "negative"
                              ? "سلبي"
                              : "محايد"
                            : article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                        </span>
                      )}
                    </div>

                    {/* Image */}
                    {article.image_url && (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full max-w-xs rounded object-cover my-1"
                        loading="lazy"
                      />
                    )}

                    {/* Description */}
                    <div className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3 max-w-prose">
                      {(article.description || article.content || "").slice(0, 200)}...
                    </div>

                    {/* Creator */}
                    {(article.creator && article.creator.length > 0) && (
                      <div className="text-xs">
                        <span className="font-medium">{isRTL ? "الكاتب" : "By"}: </span>
                        {article.creator.join(", ")}
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {article.category && article.category.map((cat, idx) => (
                        <span
                          key={cat + idx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                        >
                          {cat}
                        </span>
                      ))}
                      {article.keywords && article.keywords.map((kw, idx) => (
                        <span
                          key={kw + idx}
                          className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveArticleToProject(article)}
                        disabled={savingArticles[article.article_id]}
                      >
                        {savingArticles[article.article_id] ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        {isRTL ? "حفظ في المشروع" : "Save to Project"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => analyzeAndSaveArticle(article)}
                        disabled={analyzingArticles[article.article_id]}
                      >
                        {analyzingArticles[article.article_id] ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Brain className="h-4 w-4 mr-1" />
                        )}
                        {isRTL ? "تحليل وحفظ بـ AraBERT" : "Analyze & Save with AraBERT"}
                      </Button>
                    </div>

                    {/* Footer with link and date */}
                    <div className="flex gap-2 py-1 items-center">
                      {article.link && (
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-xs"
                        >
                          {isRTL ? "رابط الخبر" : "Read More"}
                        </a>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? "تاريخ:" : "Date:"}{" "}
                        {article.pubDate ? new Date(article.pubDate).toLocaleString() : "-"}
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
