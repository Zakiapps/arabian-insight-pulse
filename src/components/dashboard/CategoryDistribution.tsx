
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tags } from "lucide-react";

const CATEGORY_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export default function CategoryDistribution() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Fetch real posts data to analyze categories
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['category-chart-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('content')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const t = {
    categoryDistribution: isArabic ? "توزيع الفئات" : "Category Distribution",
    categoryDescription: isArabic ? "تصنيف المحتوى حسب الموضوع" : "Content categorization by topic",
    noData: isArabic ? "لا توجد بيانات" : "No data available",
    uploadData: isArabic ? "قم برفع البيانات أولاً" : "Upload data first",
  };

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
  const categoryData = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6) // Show top 6 categories
    .map(([name, count], index) => ({
      name,
      value: totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0,
      count,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }));

  const hasData = postsData && postsData.length > 0;

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle>{t.categoryDistribution}</CardTitle>
          <CardDescription>{t.categoryDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[265px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle>{t.categoryDistribution}</CardTitle>
        <CardDescription>{t.categoryDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height={265}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [`${value}% (${props.payload.count} منشور)`, 'النسبة']}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <Tags className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <div className="text-muted-foreground mb-2">{t.noData}</div>
            <p className="text-sm text-muted-foreground">{t.uploadData}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
