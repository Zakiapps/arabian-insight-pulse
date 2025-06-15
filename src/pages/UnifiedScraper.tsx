import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Code, Globe, Newspaper, FileText } from "lucide-react";

type SourceType = "brightdata" | "newsapi";

export default function UnifiedScraper() {
  const [source, setSource] = useState<SourceType>("brightdata");
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
        // Call NewsAPI edge function
        scrapeRes = await supabase.functions.invoke("scrape-newsapi", {
          body: {
            project_id: null, // Or user project, adjust if needed
            keywords: keywords.split(",").map((k) => k.trim()),
            sources: [],
            language: "ar"
          }
        });
      } else {
        // Call BrightData edge function
        scrapeRes = await supabase.functions.invoke("scrape-brightdata", {
          body: {
            project_id: null, // Or user project, adjust if needed
            links: links.split(",").map((l) => l.trim()),
            platforms: platforms.split(",").map((p) => p.trim()),
            keywords: keywords.split(",").map((k) => k.trim())
          }
        });
      }

      if (!scrapeRes.data.success) {
        throw new Error(scrapeRes.data.error || "Scraping failed.");
      }

      // Scraped items: use their concatenated content for the analysis step
      const textsArr =
        source === "newsapi"
          ? (scrapeRes.data.articles || []).map((a: any) => a.raw_text || "").filter(Boolean)
          : (scrapeRes.data.posts || []).map((p: any) => p.raw_text || p.content || "").filter(Boolean);

      if (!textsArr.length) throw new Error("No data items found to analyze.");

      // For demo: Only send the first item for analysis to keep the flow simple
      const rawText = textsArr[0];

      // Analyze using analyze-text
      const analyzeRes = await supabase.functions.invoke("analyze-text", {
        body: { text: rawText }
      });

      if (!analyzeRes.data || !analyzeRes.data.analysis_result) {
        throw new Error("Analysis failed.");
      }

      setAnalyzedText(JSON.stringify(analyzeRes.data.analysis_result, null, 2));

      // Summarize with mT5 (generate-summary)
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
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Unified Data Scraper &amp; Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScrapeAndAnalyze} className="space-y-4">
            <Tabs defaultValue={source} onValueChange={v => setSource(v as SourceType)}>
              <TabsList>
                <TabsTrigger value="brightdata">
                  <Globe className="mr-1 h-4 w-4" />
                  BrightData
                </TabsTrigger>
                <TabsTrigger value="newsapi">
                  <Newspaper className="mr-1 h-4 w-4" />
                  NewsAPI
                </TabsTrigger>
              </TabsList>
              <TabsContent value="brightdata">
                <div className="space-y-2">
                  <label htmlFor="platforms" className="block font-medium">Platforms (comma-separated)</label>
                  <Input
                    id="platforms"
                    placeholder="twitter, facebook"
                    value={platforms}
                    onChange={e => setPlatforms(e.target.value)}
                  />
                  <label htmlFor="links" className="block font-medium">Links to posts (comma-separated)</label>
                  <Input
                    id="links"
                    placeholder="https://twitter.com/..., https://facebook.com/..."
                    value={links}
                    onChange={e => setLinks(e.target.value)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="newsapi">
                <div className="space-y-2">
                  <label htmlFor="keywords" className="block font-medium">Keywords / Topics (comma-separated)</label>
                  <Input
                    id="keywords"
                    placeholder="economy, sports, science"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Scrape, Analyze, and Generate Report"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {(report || analyzedText) && (
        <Card>
          <CardHeader>
            <CardTitle>
              <FileText className="mr-1 h-5 w-5" />
              AI Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyzedText && (
              <div className="mb-4">
                <h3 className="font-medium mb-2 flex items-center gap-1">
                  <Brain className="h-4 w-4" /> Analysis Result
                </h3>
                <pre className="bg-muted p-2 rounded max-h-32 overflow-auto text-xs">{analyzedText}</pre>
              </div>
            )}
            {report && (
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-1">
                  <FileText className="h-4 w-4" /> Summary Report
                </h3>
                <div className="bg-muted p-3 rounded whitespace-pre-line text-sm">{report}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
