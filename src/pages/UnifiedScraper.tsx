import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Code, Globe, Newspaper, FileText, WandSparkles, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import ScraperHeader from "@/components/unifiedscraper/ScraperHeader";
import ScraperForm from "@/components/unifiedscraper/ScraperForm";
import ScraperResults from "@/components/unifiedscraper/ScraperResults";

export default function UnifiedScraper() {
  const [source, setSource] = useState<"brightdata" | "newsapi">("brightdata");
  const [keywords, setKeywords] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [links, setLinks] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string>("");
  const [analyzedText, setAnalyzedText] = useState<string>("");
  const { toast } = useToast();

  const handleScrapeAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReport("");
    setAnalyzedText("");

    try {
      let scrapeRes: any;
      if (source === "newsapi") {
        scrapeRes = await supabase.functions.invoke("scrape-newsapi", {
          body: {
            project_id: null,
            keywords: keywords.split(",").map((k) => k.trim()),
            sources: [],
            language: "ar"
          }
        });
      } else {
        scrapeRes = await supabase.functions.invoke("scrape-brightdata", {
          body: {
            project_id: null,
            links: links.split(",").map((l) => l.trim()),
            platforms: platforms.split(",").map((p) => p.trim()),
            keywords: keywords.split(",").map((k) => k.trim())
          }
        });
      }

      if (!scrapeRes.data.success) {
        throw new Error(scrapeRes.data.error || "Scraping failed.");
      }

      const textsArr =
        source === "newsapi"
          ? (scrapeRes.data.articles || []).map((a: any) => a.raw_text || "").filter(Boolean)
          : (scrapeRes.data.posts || []).map((p: any) => p.raw_text || p.content || "").filter(Boolean);

      if (!textsArr.length) throw new Error("No data items found to analyze.");

      const rawText = textsArr[0];

      const analyzeRes = await supabase.functions.invoke("analyze-text", {
        body: { text: rawText }
      });

      if (!analyzeRes.data || !analyzeRes.data.analysis_result) {
        throw new Error("Analysis failed.");
      }

      setAnalyzedText(JSON.stringify(analyzeRes.data.analysis_result, null, 2));

      const genSumRes = await supabase.functions.invoke("generate-summary", {
        body: { text: rawText }
      });

      if (!genSumRes.data || !genSumRes.data.summary) {
        throw new Error("Summary generation failed.");
      }

      setReport(genSumRes.data.summary);

      toast({
        title: "Report Generated!",
        description: "The analysis and summary report is ready below.",
        duration: 4000
      });

    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-10 animate-fade-in">
      <ScraperHeader />
      <div className="backdrop-blur shadow-2xl border-primary/15 rounded-xl">
        <ScraperForm
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
