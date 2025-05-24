
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformDistribution } from "@/components/dashboard/PlatformDistribution";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PlatformDistributionPage = () => {
  const { isRTL } = useLanguage();

  // Fetch real platform data
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['platform-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('source, engagement_count, sentiment, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate platform statistics
  const platformStats = postsData?.reduce((acc, post) => {
    const platform = post.source || 'غير محدد';
    if (!acc[platform]) {
      acc[platform] = {
        posts: 0,
        totalEngagement: 0,
        positive: 0,
        negative: 0,
        neutral: 0
      };
    }
    acc[platform].posts += 1;
    acc[platform].totalEngagement += post.engagement_count || 0;
    
    if (post.sentiment === 'positive') acc[platform].positive += 1;
    else if (post.sentiment === 'negative') acc[platform].negative += 1;
    else acc[platform].neutral += 1;
    
    return acc;
  }, {} as Record<string, any>) || {};

  const totalPosts = postsData?.length || 0;
  const sortedPlatforms = Object.entries(platformStats)
    .sort(([,a], [,b]) => b.posts - a.posts)
    .map(([platform, stats]) => ({
      platform,
      posts: stats.posts,
      percentage: totalPosts > 0 ? Math.round((stats.posts / totalPosts) * 100) : 0,
      avgEngagement: stats.posts > 0 ? Math.round(stats.totalEngagement / stats.posts) : 0,
      positiveRate: stats.posts > 0 ? Math.round((stats.positive / stats.posts) * 100) : 0
    }));

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
        <h1 className="text-3xl font-bold tracking-tight">توزيع المنصات</h1>
        <p className="text-muted-foreground">
          تحليل توزيع المحتوى عبر منصات التواصل الاجتماعي المختلفة ({totalPosts.toLocaleString()} منشور)
        </p>
      </div>
      
      <div className="grid gap-6">
        <PlatformDistribution />
        
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات المنصات</CardTitle>
            <CardDescription>
              معدلات التفاعل والوصول لكل منصة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedPlatforms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedPlatforms.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.platform}</span>
                      <span className="text-sm text-primary font-medium">{item.percentage}%</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>عدد المنشورات:</span>
                        <span>{item.posts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>متوسط التفاعل:</span>
                        <span>{item.avgEngagement.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>معدل الإيجابية:</span>
                        <span className={item.positiveRate > 50 ? 'text-green-600' : 'text-red-600'}>
                          {item.positiveRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">لا توجد بيانات منصات متاحة</div>
                <p className="text-sm text-muted-foreground">يرجى رفع بيانات للتحليل أولاً</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformDistributionPage;
