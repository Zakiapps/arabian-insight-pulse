
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
      <Card className="backdrop-blur shadow-2xl border-primary/15">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <Code className="h-5 w-5" />
            Unified Scraper
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      {(report || analyzedText) && (
        <Card className="border-primary/15 bg-gradient-to-br from-muted/60 via-white/80 to-accent/80 shadow-xl mt-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="mr-1 h-5 w-5" />
              AI Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyzedText && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-violet-600">
                  <Brain className="h-4 w-4" /> Analysis Result
                </h3>
                <pre className="bg-muted p-3 rounded-lg max-h-36 overflow-auto text-xs text-foreground border border-muted-foreground/10">{analyzedText}</pre>
              </div>
            )}
            {report && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-violet-600">
                  <FileText className="h-4 w-4" /> Summary Report
                </h3>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-line text-base font-medium border border-muted-foreground/10 text-foreground">{report}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
