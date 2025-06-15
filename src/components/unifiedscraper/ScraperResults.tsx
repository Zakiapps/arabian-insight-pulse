
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Brain } from "lucide-react";

interface ScraperResultsProps {
  analyzedText: string;
  report: string;
}

const ScraperResults: React.FC<ScraperResultsProps> = ({ analyzedText, report }) => {
  if (!analyzedText && !report) return null;

  return (
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
  );
};

export default ScraperResults;
