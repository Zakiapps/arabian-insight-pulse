
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import ScraperHeader from "@/components/unifiedscraper/ScraperHeader";
import ScraperForm from "@/components/unifiedscraper/ScraperForm";
import ScraperResults from "@/components/unifiedscraper/ScraperResults";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UnifiedScraper() {
  const { isRTL, t } = useLanguage();
  // We'll rely on context and form for the rest

  return (
    <div className={cn("max-w-3xl mx-auto mt-10 space-y-10 animate-fade-in", isRTL ? "text-right" : "text-left")}>
      <div className="flex mb-4">
        <Link to="/dashboard" className={cn(
          "flex items-center gap-2 ml-auto",
          isRTL ? "flex-row-reverse mr-auto ml-0" : ""
        )}>
          <Button
            variant="ghost"
            className="group font-bold px-4 py-2 text-base rounded-lg"
          >
            <span>
              {isRTL ? "العودة للوحة التحكم" : "Back to Dashboard"}
            </span>
          </Button>
        </Link>
      </div>
      <div className="relative">
        <ScraperHeader />
        <div className="absolute right-12 top-4 z-10 pointer-events-none opacity-20 [@media(max-width:600px)]:hidden">
          <Sparkles size={90} className="text-violet-400/80 animate-spin-slow" />
        </div>
      </div>
      <div className="backdrop-blur shadow-2xl border-primary/20 rounded-xl bg-white/90 dark:bg-zinc-950/70 border p-6 animate-fade-in">
        <ScraperForm />
      </div>
      <ScraperResults />
    </div>
  );
}
