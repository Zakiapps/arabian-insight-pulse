
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryDistribution from "@/components/dashboard/CategoryDistribution";
import { useLanguage } from "@/contexts/LanguageContext";

const CategoryDistributionPage = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">توزيع الفئات</h1>
        <p className="text-muted-foreground">
          تحليل توزيع المحتوى حسب الفئات المختلفة
        </p>
      </div>
      
      <div className="grid gap-6">
        <CategoryDistribution />
        
        <Card>
          <CardHeader>
            <CardTitle>أهم الفئات</CardTitle>
            <CardDescription>
              الفئات الأكثر نشاطاً في البيانات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">الرياضة</span>
                <span className="text-sm text-muted-foreground">35%</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">التكنولوجيا</span>
                <span className="text-sm text-muted-foreground">28%</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">السياسة</span>
                <span className="text-sm text-muted-foreground">22%</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">الترفيه</span>
                <span className="text-sm text-muted-foreground">15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryDistributionPage;
