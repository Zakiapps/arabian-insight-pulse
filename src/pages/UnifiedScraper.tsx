import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ScraperHeader from "@/components/unifiedscraper/ScraperHeader";
import ScraperFormContainer from "@/components/unifiedscraper/ScraperFormContainer";
import ScraperResults from "@/components/unifiedscraper/ScraperResults";

/**
 * UnifiedScraperPage acts as a container for all unified scraper logic/state.
 */
export default function UnifiedScraper() {
  const { isRTL } = useLanguage();
  const [analyzedText, setAnalyzedText] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className={cn("max-w-3xl mx-auto mt-10 space-y-10 animate-fade-in", isRTL ? "text-right" : "text-left")}>
      <div className="flex mb-4">
        <Link
          to="/dashboard"
          className={cn("flex items-center gap-2 ml-auto", isRTL ? "flex-row-reverse mr-auto ml-0" : "")}
        >
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
      <div className="relative"><ScraperHeader /></div>
      <div className="backdrop-blur shadow-2xl border-primary/20 rounded-xl bg-white/90 dark:bg-zinc-950/70 border p-6 animate-fade-in">
        <ScraperFormContainer
          setReport={setReport}
          setAnalyzedText={setAnalyzedText}
          loading={loading}
          setLoading={setLoading}
        />
      </div>
      <ScraperResults analyzedText={analyzedText} report={report} />
    </div>
  );
}
