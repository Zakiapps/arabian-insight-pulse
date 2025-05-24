
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Globe } from "lucide-react";

const DIALECT_COLORS = ["#4f46e5", "#a1a1aa"];

export const DialectDetection = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Fetch real dialect data
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['dialect-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('is_jordanian_dialect')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const t = {
    dialectDetection: isArabic ? "كشف اللهجة" : "Dialect Detection",
    dialectDistribution: isArabic ? "توزيع اللهجات الأردنية مقابل غير الأردنية" : "Distribution of Jordanian vs non-Jordanian dialects",
    noData: isArabic ? "لا توجد بيانات" : "No data available",
    uploadData: isArabic ? "قم برفع البيانات أولاً" : "Upload data first",
  };

  // Calculate real dialect counts
  const jordanianPosts = postsData?.filter(post => post.is_jordanian_dialect === true).length || 0;
  const nonJordanianPosts = postsData?.filter(post => post.is_jordanian_dialect === false).length || 0;
  const totalPosts = jordanianPosts + nonJordanianPosts;

  const dialectData = totalPosts > 0 ? [
    { 
      name: "أردني", 
      value: totalPosts > 0 ? Math.round((jordanianPosts / totalPosts) * 100) : 0 
    },
    { 
      name: "غير أردني", 
      value: totalPosts > 0 ? Math.round((nonJordanianPosts / totalPosts) * 100) : 0 
    },
  ] : [];

  const hasData = postsData && postsData.length > 0;

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle>{t.dialectDetection}</CardTitle>
          <CardDescription>{t.dialectDistribution}</CardDescription>
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
        <CardTitle>{t.dialectDetection}</CardTitle>
        <CardDescription>{t.dialectDistribution}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height={265}>
            <PieChart>
              <Pie
                data={dialectData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {dialectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DIALECT_COLORS[index % DIALECT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'النسبة']}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <div className="text-muted-foreground mb-2">{t.noData}</div>
            <p className="text-sm text-muted-foreground">{t.uploadData}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
