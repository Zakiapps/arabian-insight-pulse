
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DialectDetection } from "@/components/dashboard/DialectDetection";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

const DialectDetectionPage = () => {
  const { isRTL } = useLanguage();

  const dialectStats = [
    { dialect: "الأردنية", percentage: 35, count: 2850 },
    { dialect: "المصرية", percentage: 25, count: 2030 },
    { dialect: "الخليجية", percentage: 20, count: 1620 },
    { dialect: "الشامية", percentage: 12, count: 975 },
    { dialect: "المغربية", percentage: 8, count: 650 },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">كشف اللهجة</h1>
        <p className="text-muted-foreground">
          تحليل وتصنيف اللهجات العربية في المحتوى الاجتماعي
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
            <div className="space-y-6">
              {dialectStats.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.dialect}</span>
                    <div className="text-sm text-muted-foreground">
                      {item.percentage}% ({item.count} نص)
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>خصائص اللهجات</CardTitle>
            <CardDescription>
              التميز اللغوي لكل لهجة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">اللهجة الأردنية</h3>
                <p className="text-sm text-muted-foreground">
                  تتميز بالدقة في التعبير واستخدام المصطلحات التقليدية
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">اللهجة المصرية</h3>
                <p className="text-sm text-muted-foreground">
                  الأكثر انتشاراً في المحتوى الترفيهي والإعلامي
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">اللهجة الخليجية</h3>
                <p className="text-sm text-muted-foreground">
                  غنية بالمصطلحات التجارية والاقتصادية
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">اللهجة الشامية</h3>
                <p className="text-sm text-muted-foreground">
                  تجمع بين عدة بلدان وتتميز بالتنوع اللغوي
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DialectDetectionPage;
