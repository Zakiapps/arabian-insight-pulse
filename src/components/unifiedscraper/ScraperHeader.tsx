
import React from "react";
import { Badge } from "@/components/ui/badge";
import { WandSparkles, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ScraperHeader: React.FC = () => (
  <section className={cn(
    "bg-gradient-to-br from-blue-50/60 via-white via-65% to-gray-50 rounded-2xl p-8 mb-2 flex flex-col items-center shadow-xl relative overflow-hidden",
    "ring-1 ring-primary/10"
  )}>
    <div className="absolute -top-6 right-8 z-0 opacity-40 animate-pulse pointer-events-none">
      <WandSparkles size={90} className="text-primary drop-shadow-xl blur-md" />
    </div>
    <span className="relative z-10 flex items-center gap-2 mb-3">
      <Badge variant="default" className="flex items-center gap-1 font-semibold bg-gradient-to-r from-violet-500 to-primary text-white px-3 py-1 rounded-lg shadow-md animate-pulse">
        <Sparkles className="mr-1 h-4 w-4" /> AI Powered
      </Badge>
    </span>
    <h1 className="font-extrabold text-3xl md:text-4xl text-center flex items-center gap-3 mb-3 bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
      <WandSparkles className="h-9 w-9 drop-shadow" />
      Unified Data Scraper & Analyzer
    </h1>
    <p className="text-lg text-muted-foreground text-center max-w-xl mx-auto font-medium">
      Unleash advanced AI to extract, analyze, and summarize data from social media or news—all in a unified workflow.
    </p>
  </section>
);

export default ScraperHeader;
