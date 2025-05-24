
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformDistribution } from "@/components/dashboard/PlatformDistribution";
import { useLanguage } from "@/contexts/LanguageContext";

const PlatformDistributionPage = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">توزيع المنصات</h1>
        <p className="text-muted-foreground">
          تحليل توزيع المحتوى عبر منصات التواصل الاجتماعي المختلفة
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">تويتر</span>
                  <span className="text-sm text-blue-600">45%</span>
                </div>
                <div className="text-sm text-muted-foreground">أعلى معدل تفاعل</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">فيسبوك</span>
                  <span className="text-sm text-blue-700">30%</span>
                </div>
                <div className="text-sm text-muted-foreground">أوسع انتشار</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">إنستغرام</span>
                  <span className="text-sm text-pink-600">15%</span>
                </div>
                <div className="text-sm text-muted-foreground">محتوى بصري</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">لينكدإن</span>
                  <span className="text-sm text-blue-800">10%</span>
                </div>
                <div className="text-sm text-muted-foreground">محتوى مهني</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformDistributionPage;
