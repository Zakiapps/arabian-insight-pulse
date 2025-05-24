
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DialectDetection } from "@/components/dashboard/DialectDetection";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DialectDetectionPage = () => {
  const { isRTL } = useLanguage();

  // Fetch real dialect data
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['dialect-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('content, is_jordanian_dialect, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate dialect statistics
  const totalPosts = postsData?.length || 0;
  const jordanianPosts = postsData?.filter(post => post.is_jordanian_dialect === true).length || 0;
  const nonJordanianPosts = totalPosts - jordanianPosts;

  const jordanianPercentage = totalPosts > 0 ? Math.round((jordanianPosts / totalPosts) * 100) : 0;
  const nonJordanianPercentage = totalPosts > 0 ? Math.round((nonJordanianPosts / totalPosts) * 100) : 0;

  // Analyze dialect characteristics based on content patterns
  const analyzeDialectPatterns = () => {
    if (!postsData || postsData.length === 0) return [];

    const patterns = [
      {
        dialect: "الأردنية",
        percentage: jordanianPercentage,
        count: jordanianPosts,
        characteristics: "تتميز بالدقة في التعبير واستخدام المصطلحات التقليدية"
      },
      {
        dialect: "غير الأردنية",
        percentage: nonJordanianPercentage,
        count: nonJordanianPosts,
        characteristics: "تشمل مختلف اللهجات العربية الأخرى"
      }
    ];

    return patterns.filter(p => p.count > 0);
  };

  const dialectPatterns = analyzeDialectPatterns();

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
        <h1 className="text-3xl font-bold tracking-tight">كشف اللهجة</h1>
        <p className="text-muted-foreground">
          تحليل وتصنيف اللهجات العربية في المحتوى الاجتماعي ({totalPosts.toLocaleString()} منشور)
        </p>
      </div>
      
      <div className="grid gap-6">
        <DialectDetection />
        
        <Card>
          <CardHeader>
            <CardTitle>توزيع اللهجات</CardTitle>
            <CardDescription>
              النسب المئوية لكل لهجة في البيانات المحللة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dialectPatterns.length > 0 ? (
              <div className="space-y-6">
                {dialectPatterns.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.dialect}</span>
                      <div className="text-sm text-muted-foreground">
                        {item.percentage}% ({item.count.toLocaleString()} نص)
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">لا توجد بيانات لهجات متاحة</div>
                <p className="text-sm text-muted-foreground">يرجى رفع بيانات للتحليل أولاً</p>
              </div>
            )}
          </CardContent>
        </Card>

        {dialectPatterns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>خصائص اللهجات</CardTitle>
              <CardDescription>
                التميز اللغوي لكل لهجة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dialectPatterns.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{item.dialect}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.characteristics}
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      تم العثور عليها في {item.count.toLocaleString()} منشور
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DialectDetectionPage;
