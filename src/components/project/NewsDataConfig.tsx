
// Simple config page; could be expanded for advanced config
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Newspaper } from "lucide-react";
export default function NewsDataConfig() {
  const { isRTL } = useLanguage();
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          {isRTL ? "إعدادات NewsData.io" : "NewsData.io Settings"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">
          {isRTL
            ? "يتم الآن جلب الأخبار بواسطة NewsData.io تلقائيا عبر كلمة البحث المحددة"
            : "The system now fetches news using NewsData.io with a default search. No further configuration is needed."}
        </div>
      </CardContent>
    </Card>
  );
}
