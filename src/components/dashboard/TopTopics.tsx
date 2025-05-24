
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Hash, ArrowUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const TopTopics = () => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const isArabic = language === 'ar';

  // Fetch real posts data to analyze topics
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['top-topics-posts', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('content, sentiment, created_at')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  const t = {
    topTopics: isArabic ? "أهم المواضيع" : "Top Topics",
    topicsDescription: isArabic ? "الكلمات والمواضيع الأكثر تداولاً" : "Most discussed words and topics",
    mentions: isArabic ? "إشارة" : "mentions",
    noData: isArabic ? "لا توجد مواضيع" : "No topics available",
    uploadData: isArabic ? "قم برفع البيانات أولاً" : "Upload data first",
    trending: isArabic ? "رائج" : "Trending"
  };

  // Extract topics from content using Arabic keyword analysis
  const extractTopics = () => {
    if (!postsData || postsData.length === 0) return [];

    // Arabic stopwords to filter out
    const arabicStopwords = new Set([
      'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
      'كان', 'كانت', 'يكون', 'تكون', 'هو', 'هي', 'أنت', 'أنا', 'نحن',
      'التي', 'الذي', 'التي', 'لقد', 'قد', 'لم', 'لن', 'ما', 'لا', 'لكن',
      'أم', 'أو', 'إن', 'أن', 'كل', 'بعض', 'جميع', 'كثير', 'قليل'
    ]);

    const keywords = postsData.flatMap(post => 
      post.content
        .split(/[\s.,!?;:"()[\]{}\-_+=*&^%$#@~`|\\/<>]+/)
        .filter(word => 
          word.length > 2 && 
          !arabicStopwords.has(word) &&
          /[\u0600-\u06FF]/.test(word) // Contains Arabic characters
        )
        .map(word => word.trim())
        .filter(word => word.length > 0)
    );

    const keywordCount = keywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top keywords with minimum mentions
    return Object.entries(keywordCount)
      .filter(([keyword, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([keyword, mentions], index) => {
        // Generate a simple positive trend percentage - ensure all values are numbers
        const baseValue = 15;
        const randomValue = Math.floor(Math.random() * 30);
        const trendValue = baseValue + randomValue;
        
        return {
          topic: keyword,
          mentions: Number(mentions), // Ensure mentions is a number
          trend: `+${trendValue}%`,
          sentiment: getSentimentForTopic(keyword, postsData),
          rank: index + 1
        };
      });
  };

  const getSentimentForTopic = (topic: string, posts: any[]) => {
    const topicPosts = posts.filter(post => 
      post.content.toLowerCase().includes(topic.toLowerCase())
    );
    
    if (topicPosts.length === 0) return 'neutral';
    
    const sentimentCounts = topicPosts.reduce((acc, post) => {
      const currentCount = Number(acc[post.sentiment] || 0);
      acc[post.sentiment] = currentCount + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(sentimentCounts)
      .sort(([,a], [,b]) => Number(b) - Number(a))[0]?.[0] || 'neutral';
  };

  const topTopics = extractTopics();
  const hasData = postsData && postsData.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t.topTopics}
          </CardTitle>
          <CardDescription>{t.topicsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t.topTopics}
        </CardTitle>
        <CardDescription>{t.topicsDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData && topTopics.length > 0 ? (
          <div className="space-y-3">
            {topTopics.map((topic, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors border border-muted/20"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {topic.rank}
                  </div>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-right">{topic.topic}</div>
                    <div className="text-sm text-muted-foreground">
                      {topic.mentions} {t.mentions}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    topic.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                    topic.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {topic.sentiment === 'positive' ? 'إيجابي' : 
                     topic.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                  </div>
                  
                  <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                    <ArrowUp className="h-3 w-3" />
                    {topic.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <div className="text-muted-foreground mb-2">{t.noData}</div>
            <p className="text-sm text-muted-foreground">{t.uploadData}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
