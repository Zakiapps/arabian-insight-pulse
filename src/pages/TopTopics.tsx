
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopTopics } from "@/components/dashboard/TopTopics";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

const TopTopicsPage = () => {
  const { isRTL } = useLanguage();

  const trendingTopics = [
    { topic: "الذكاء الاصطناعي", mentions: 1250, growth: "+15%" },
    { topic: "كأس العالم", mentions: 980, growth: "+8%" },
    { topic: "التكنولوجيا المالية", mentions: 745, growth: "+22%" },
    { topic: "التعليم الرقمي", mentions: 632, growth: "+12%" },
    { topic: "الطاقة المتجددة", mentions: 521, growth: "+18%" },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">المواضيع الشائعة</h1>
        <p className="text-muted-foreground">
          أهم المواضيع والاتجاهات في البيانات الاجتماعية
        </p>
      </div>
      
      <div className="grid gap-6">
        <TopTopics />
        
        <Card>
          <CardHeader>
            <CardTitle>المواضيع الرائجة</CardTitle>
            <CardDescription>
              أكثر المواضيع تداولاً مع معدلات النمو
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingTopics.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium">{item.topic}</div>
                    <div className="text-sm text-muted-foreground">{item.mentions} إشارة</div>
                  </div>
                  <Badge variant={item.growth.startsWith('+') ? 'default' : 'secondary'}>
                    {item.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopTopicsPage;
