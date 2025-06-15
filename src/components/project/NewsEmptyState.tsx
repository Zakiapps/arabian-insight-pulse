
import { Newspaper } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const NewsEmptyState = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="text-center text-muted-foreground py-8">
      <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
      <div className="mb-2">
        {isRTL ? "لا توجد أخبار محفوظة" : "No saved news articles"}
      </div>
      <p className="text-sm">
        {isRTL ? "قم بالبحث وحفظ المقالات لعرضها هنا" : "Search and save articles to see them here"}
      </p>
    </div>
  );
};

export default NewsEmptyState;
