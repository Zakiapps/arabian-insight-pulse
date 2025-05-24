
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryDistribution from "@/components/dashboard/CategoryDistribution";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

const CategoryDistributionPage = () => {
  const { isRTL } = useLanguage();

  // Fetch real posts data to analyze categories
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['category-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('content, source, sentiment, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Analyze content to determine categories (simple keyword-based categorization)
  const categorizeContent = (content: string) => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('سياسة') || lowerContent.includes('حكومة') || lowerContent.includes('وزير') || lowerContent.includes('رئيس')) {
      return 'السياسة';
    } else if (lowerContent.includes('اقتصاد') || lowerContent.includes('مال') || lowerContent.includes('أسعار') || lowerContent.includes('تجارة')) {
      return 'الاقتصاد';
    } else if (lowerContent.includes('رياضة') || lowerContent.includes('كرة') || lowerContent.includes('فريق') || lowerContent.includes('لاعب')) {
      return 'الرياضة';
    } else if (lowerContent.includes('تعليم') || lowerContent.includes('مدرسة') || lowerContent.includes('جامعة') || lowerContent.includes('طالب')) {
      return 'التعليم';
    } else if (lowerContent.includes('صحة') || lowerContent.includes('طبيب') || lowerContent.includes('مستشفى') || lowerContent.includes('علاج')) {
      return 'الصحة';
    } else if (lowerContent.includes('تكنولوجيا') || lowerContent.includes('انترنت') || lowerContent.includes('تطبيق') || lowerContent.includes('برنامج')) {
      return 'التكنولوجيا';
    }
    return 'أخرى';
  };

  // Calculate category statistics
  const categoryStats = postsData?.reduce((acc, post) => {
    const category = categorizeContent(post.content);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalPosts = postsData?.length || 0;
  const sortedCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0
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
        <h1 className="text-3xl font-bold tracking-tight">توزيع الفئات</h1>
        <p className="text-muted-foreground">
          تحليل توزيع المحتوى حسب الفئات المختلفة ({totalPosts.toLocaleString()} منشور)
        </p>
      </div>
      
      <div className="grid gap-6">
        <CategoryDistribution />
        
        <Card>
          <CardHeader>
            <CardTitle>أهم الفئات</CardTitle>
            <CardDescription>
              الفئات الأكثر نشاطاً في البيانات المحللة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedCategories.length > 0 ? (
              <div className="space-y-6">
                {sortedCategories.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.category}</span>
                      <div className="text-sm text-muted-foreground">
                        {item.percentage}% ({item.count.toLocaleString()} منشور)
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">لا توجد بيانات فئات متاحة</div>
                <p className="text-sm text-muted-foreground">يرجى رفع بيانات للتحليل أولاً</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryDistributionPage;
