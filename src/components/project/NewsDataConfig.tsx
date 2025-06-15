// Simple config page; could be expanded for advanced config
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import NewsDataSearch from "./NewsDataSearch";
import { useLanguage } from "@/contexts/LanguageContext";
import { Newspaper } from "lucide-react";

// Turn this config page into the main NewsData.io search UI
export default function NewsDataConfig() {
  const { isRTL } = useLanguage();
  return (
    <div>
      <NewsDataSearch />
      <Card className="mt-3">
        <CardContent className="text-xs text-muted-foreground">
          {isRTL
            ? "يتم جلب الأخبار عبر NewsData.io. يمكنك البحث باستخدام الكلمات الرئيسية كما في البحث عبر Google."
            : "News fetched via NewsData.io API. Use keywords as you would in a Google search."}
        </CardContent>
      </Card>
    </div>
  );
}
