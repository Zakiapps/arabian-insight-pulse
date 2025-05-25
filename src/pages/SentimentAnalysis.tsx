
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SentimentAnalysis from "@/components/dashboard/SentimentAnalysis";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const SentimentAnalysisPage = () => {
  const { isRTL } = useLanguage();

  // Fetch real sentiment data
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['sentiment-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('sentiment, sentiment_score, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate real sentiment statistics
  const totalPosts = postsData?.length || 0;
  const positivePosts = postsData?.filter(post => post.sentiment === 'positive').length || 0;
  const neutralPosts = postsData?.filter(post => post.sentiment === 'neutral').length || 0;
  const negativePosts = postsData?.filter(post => post.sentiment === 'negative').length || 0;

  const positivePercentage = totalPosts > 0 ? Math.round((positivePosts / totalPosts) * 100) : 0;
  const neutralPercentage = totalPosts > 0 ? Math.round((neutralPosts / totalPosts) * 100) : 0;
  const negativePercentage = totalPosts > 0 ? Math.round((negativePosts / totalPosts) * 100) : 0;

  // Calculate average sentiment score
  const averageSentimentScore = postsData?.length > 0 
    ? postsData.reduce((sum, post) => sum + (post.sentiment_score || 0), 0) / postsData.length
    : 0;

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
        <h1 className="text-3xl font-bold tracking-tight">تحليل المشاعر</h1>
        <p className="text-muted-foreground">
          تحليل مفصل للمشاعر في البيانات الاجتماعية ({totalPosts.toLocaleString()} منشور)
        </p>
      </div>
      
      <div className="grid gap-6">
        <SentimentAnalysis />
        
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات تفصيلية</CardTitle>
            <CardDescription>
              توزيع المشاعر الحالي في البيانات
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalPosts > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <div className="text-2xl font-bold text-green-600">{positivePercentage}%</div>
                  </div>
                  <div className="text-sm text-green-700 font-medium">مشاعر إيجابية</div>
                  <div className="text-xs text-green-600 mt-1">{positivePosts.toLocaleString()} منشور</div>
                </div>
                
                <div className="text-center p-6 border rounded-lg bg-gray-50 border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <Minus className="h-5 w-5 text-gray-600 mr-2" />
                    <div className="text-2xl font-bold text-gray-600">{neutralPercentage}%</div>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">مشاعر محايدة</div>
                  <div className="text-xs text-gray-600 mt-1">{neutralPosts.toLocaleString()} منشور</div>
                </div>
                
                <div className="text-center p-6 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                    <div className="text-2xl font-bold text-red-600">{negativePercentage}%</div>
                  </div>
                  <div className="text-sm text-red-700 font-medium">مشاعر سلبية</div>
                  <div className="text-xs text-red-600 mt-1">{negativePosts.toLocaleString()} منشور</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">لا توجد بيانات مشاعر متاحة</div>
                <p className="text-sm text-muted-foreground">يرجى رفع بيانات للتحليل أولاً</p>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPosts > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>معدل المشاعر العام</CardTitle>
              <CardDescription>
                النتيجة الإجمالية لتحليل المشاعر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {averageSentimentScore.toFixed(2)}
                  </div>
                  <Badge variant={
                    averageSentimentScore > 0.1 ? 'default' : 
                    averageSentimentScore < -0.1 ? 'destructive' : 'secondary'
                  }>
                    {averageSentimentScore > 0.1 ? 'إيجابي' : 
                     averageSentimentScore < -0.1 ? 'سلبي' : 'محايد'}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    المعدل العام للمشاعر
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysisPage;
