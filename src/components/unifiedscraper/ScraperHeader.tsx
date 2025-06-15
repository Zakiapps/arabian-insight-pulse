
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const ScraperHeader: React.FC = () => {
  const { isRTL, t } = useLanguage();

  return (
    <section
      className={cn(
        "bg-gradient-to-br from-blue-50/70 via-white via-65% to-primary/10 rounded-2xl p-10 mb-4 flex flex-col items-center shadow-2xl relative overflow-hidden animate-fade-in",
        "ring-2 ring-primary/30 border-2 border-primary/10"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="absolute -top-7 left-7 right-8 z-0 opacity-30 pointer-events-none">
        <img
          src="https://assets-global.website-files.com/6509e97f7cb3df93e152f1fd/650ae4c74db78fdcd2303995_ai-power-symbol-p-500.png"
          alt=""
          className="w-32 mx-auto blur-[1px] animate-pulse"
          style={{ filter: "drop-shadow(0 0 24px #a06dff99)" }}
        />
      </div>
      <span className="relative z-10 flex items-center gap-2 mb-4">
        <Badge
          variant="default"
          className="flex items-center gap-1 font-semibold bg-gradient-to-r from-violet-500 via-primary to-blue-400 text-white px-4 py-2 rounded-lg shadow-md animate-bounce"
        >
          <Sparkles className="mr-1 h-4 w-4" /> {isRTL ? "مدعوم بالذكاء الاصطناعي" : "AI Powered"}
        </Badge>
      </span>
      <h1
        className={cn(
          "font-extrabold text-3xl md:text-4xl text-center flex items-center gap-3 mb-3",
          "bg-gradient-to-r from-primary via-violet-600 to-indigo-500 bg-clip-text text-transparent drop-shadow"
        )}
      >
        {isRTL ? "موحد استخراج وتحليل البيانات" : "Unified Data Scraper & Analyzer"}
      </h1>
      <p className="text-lg text-muted-foreground text-center max-w-xl mx-auto font-medium">
        {isRTL
          ? "استخدم الذكاء الاصطناعي المتقدم لاستخراج وتحليل وتلخيص البيانات من وسائل التواصل أو الأخبار بسهولة عالية."
          : "Unleash advanced AI to extract, analyze, and summarize data from social media or news—all in a unified workflow."}
      </p>
    </section>
  );
};

export default ScraperHeader;
