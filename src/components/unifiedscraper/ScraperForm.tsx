
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Globe, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ScraperFormProps {
  setReport: (val: string) => void;
  setAnalyzedText: (val: string) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
}

const ScraperForm: React.FC<ScraperFormProps> = ({
  setReport,
  setAnalyzedText,
  loading,
  setLoading,
}) => {
  const [source, setSource] = useState<"brightdata" | "newsapi">("brightdata");
  const [keywords, setKeywords] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [links, setLinks] = useState("");
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
    <form onSubmit={handleScrapeAndAnalyze} className="space-y-6">
      <Tabs defaultValue={source} onValueChange={v => setSource(v as "brightdata" | "newsapi")}>
        <TabsList className="rounded-lg shadow flex px-1 py-0.5 bg-muted/50">
          <TabsTrigger value="brightdata">
            <Globe className="mr-1 h-4 w-4" />
            BrightData
          </TabsTrigger>
          <TabsTrigger value="newsapi">
            <Newspaper className="mr-1 h-4 w-4" />
            NewsAPI
          </TabsTrigger>
        </TabsList>
        <TabsContent value="brightdata" className="animate-fade-in">
          <div className="space-y-3">
            <label htmlFor="platforms" className="block font-semibold text-sm text-foreground">Platforms <span className="text-xs text-muted-foreground">(comma separated)</span></label>
            <Input
              id="platforms"
              placeholder="twitter, facebook"
              value={platforms}
              onChange={e => setPlatforms(e.target.value)}
              className="focus:ring-primary focus:border-primary/80"
            />
            <label htmlFor="links" className="block font-semibold text-sm text-foreground">Links to posts <span className="text-xs text-muted-foreground">(comma separated)</span></label>
            <Input
              id="links"
              placeholder="https://twitter.com/..., https://facebook.com/..."
              value={links}
              onChange={e => setLinks(e.target.value)}
              className="focus:ring-primary focus:border-primary/80"
            />
            <label htmlFor="keywords" className="block font-semibold text-sm text-foreground">
              Optional keywords
            </label>
            <Input
              id="keywords"
              placeholder="economy, sports, science"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              className="focus:ring-primary focus:border-primary/80"
            />
          </div>
        </TabsContent>
        <TabsContent value="newsapi" className="animate-fade-in">
          <div className="space-y-3">
            <label htmlFor="keywords" className="block font-semibold text-sm text-foreground">Keywords / Topics <span className="text-xs text-muted-foreground">(comma separated)</span></label>
            <Input
              id="keywords"
              placeholder="economy, sports, science"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              className="focus:ring-primary focus:border-primary/80"
            />
          </div>
        </TabsContent>
      </Tabs>
      <Button
        type="submit"
        className="w-full py-3 text-lg font-semibold relative group bg-gradient-to-tr from-primary/90 to-violet-500/90 shadow-lg"
        disabled={loading}
      >
        <span className="flex items-center gap-2">
          <Sparkles className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-125", loading && "animate-spin")} />
          {loading ? "Processing, please wait..." : "Scrape, Analyze, and Generate AI Report"}
        </span>
      </Button>
    </form>
  );
};

export default ScraperForm;
