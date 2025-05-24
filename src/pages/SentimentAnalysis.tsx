
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SentimentAnalysis from "@/components/dashboard/SentimentAnalysis";
import { useLanguage } from "@/contexts/LanguageContext";

const SentimentAnalysisPage = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">تحليل المشاعر</h1>
        <p className="text-muted-foreground">
          تحليل مفصل للمشاعر في البيانات الاجتماعية
        </p>
      </div>
      
      <div className="grid gap-6">
        <SentimentAnalysis />
        
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات تفصيلية</CardTitle>
            <CardDescription>
              معلومات إضافية حول تحليل المشاعر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">65%</div>
                <div className="text-sm text-muted-foreground">مشاعر إيجابية</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-600">20%</div>
                <div className="text-sm text-muted-foreground">مشاعر محايدة</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">15%</div>
                <div className="text-sm text-muted-foreground">مشاعر سلبية</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SentimentAnalysisPage;
