
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import NewsDataSearch from "./NewsDataSearch";

const NewsDataConfig = () => {
  const { isRTL } = useLanguage();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewsSaved = () => {
    // Trigger a refresh of any news lists
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isRTL ? "إعدادات NewsData.io" : "NewsData.io Configuration"}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? "ابحث في الأخبار باستخدام واجهة برمجة التطبيقات NewsData.io وقم بحفظها وتحليلها"
              : "Search for news using NewsData.io API and save/analyze them"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {isRTL 
                ? "يمكنك البحث في الأخبار باللغتين العربية والإنجليزية. سيتم حفظ النتائج في قاعدة البيانات وعرضها في لوحة تحكم المشروع."
                : "You can search for news in both Arabic and English. Results will be saved to the database and displayed in the project dashboard."
              }
            </div>
          </div>
        </CardContent>
      </Card>

      <NewsDataSearch onNewsSaved={handleNewsSaved} />
    </div>
  );
};

export default NewsDataConfig;
