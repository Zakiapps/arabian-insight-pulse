
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopTopics } from "@/components/dashboard/TopTopics";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TopTopicsPage = () => {
  const { isRTL } = useLanguage();

  // Fetch real posts data to analyze topics
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['topics-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('content, sentiment, engagement_count, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Extract topics from content using keyword analysis
  const extractTopics = () => {
    if (!postsData || postsData.length === 0) return [];

    const keywords = postsData.flatMap(post => 
      post.content.split(/\s+/)
        .filter(word => word.length > 3)
        .map(word => word.replace(/[^\u0600-\u06FF\s]/g, ''))
        .filter(word => word.length > 2)
    );

    const keywordCount = keywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top keywords and calculate engagement
    return Object.entries(keywordCount)
      .filter(([keyword, count]) => count >= 2) // Only keywords mentioned at least twice
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, mentions]) => {
        // Calculate growth trend (simplified)
        const recentMentions = postsData.filter(post => 
          post.content.includes(keyword) && 
          new Date(post.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        
        const growth = mentions > 0 ? Math.round((recentMentions / mentions) * 100) : 0;
        
        return {
          topic: keyword,
          mentions,
          growth: growth > 100 ? `+${growth - 100}%` : `${growth - 100}%`
        };
      });
  };

  const trendingTopics = extractTopics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">المواضيع الشائعة</h1>
        <p className="text-muted-foreground">
          أهم المواضيع والاتجاهات في البيانات الاجتماعية
        </p>
      </div>
      
      <div className="grid gap-6">
        <TopTopics />
        
        <Card>
          <CardHeader>
            <CardTitle>المواضيع الرائجة</CardTitle>
            <CardDescription>
              أكثر المواضيع تداولاً مع معدلات التكرار
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trendingTopics.length > 0 ? (
              <div className="space-y-4">
                {trendingTopics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium">{item.topic}</div>
                      <div className="text-sm text-muted-foreground">{item.mentions} إشارة</div>
                    </div>
                    <Badge variant={item.growth.startsWith('+') ? 'default' : 'secondary'}>
                      {item.growth}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">لا توجد مواضيع رائجة حالياً</div>
                <p className="text-sm text-muted-foreground">يرجى رفع بيانات للتحليل أولاً</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopTopicsPage;
