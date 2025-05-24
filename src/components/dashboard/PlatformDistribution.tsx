
import { ArrowRight } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3 } from "lucide-react";

export const PlatformDistribution = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Fetch real platform data
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['platform-chart-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('source')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const t = {
    platformDistribution: isArabic ? "توزيع المنصات" : "Platform Distribution",
    platformsDescription: isArabic ? "المنشورات حسب منصة التواصل الاجتماعي" : "Posts by social media platform",
    viewAll: isArabic ? "عرض الكل" : "View All",
    posts: isArabic ? "منشور" : "posts",
    noData: isArabic ? "لا توجد بيانات" : "No data available",
    uploadData: isArabic ? "قم برفع البيانات أولاً" : "Upload data first",
  };

  // Calculate platform statistics
  const platformStats = postsData?.reduce((acc, post) => {
    const platform = post.source || 'غير محدد';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const platformsData = Object.entries(platformStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5) // Show top 5 platforms
    .map(([name, posts]) => ({ name, posts }));

  const hasData = postsData && postsData.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>{t.platformDistribution}</CardTitle>
            <CardDescription>{t.platformsDescription}</CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">{t.viewAll}</span>
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{t.platformDistribution}</CardTitle>
          <CardDescription>{t.platformsDescription}</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <ArrowRight className="h-4 w-4" />
          <span className="sr-only">{t.viewAll}</span>
        </Button>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={platformsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                formatter={(value) => [`${value} ${t.posts}`, '']}
              />
              <Line type="monotone" dataKey="posts" name={t.posts} stroke="hsl(var(--primary))" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <div className="text-muted-foreground mb-2">{t.noData}</div>
            <p className="text-sm text-muted-foreground">{t.uploadData}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
