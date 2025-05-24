
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Brain } from "lucide-react";

interface AnalysisResult {
  result: 'positive' | 'negative' | 'neutral';
  confidence: number;
  details?: {
    positiveScore: number;
    negativeScore: number;
    wordsAnalyzed: number;
  };
}

interface TextAnalyzerProps {
  title?: string;
  placeholder?: string;
  defaultText?: string;
}

export const TextAnalyzer: React.FC<TextAnalyzerProps> = ({
  title = "تحليل المشاعر",
  placeholder = "أدخل النص العربي المراد تحليله...",
  defaultText = ""
}) => {
  const [text, setText] = useState(defaultText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeText = async () => {
    if (!text.trim()) {
      toast.error("يرجى إدخال نص للتحليل");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text: text.trim() }
      });

      if (error) throw error;

      setResult(data);
      toast.success("تم تحليل النص بنجاح");
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast.error("فشل في تحليل النص");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500';
      case 'negative':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'إيجابي';
      case 'negative':
        return 'سلبي';
      default:
        return 'محايد';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] resize-none"
          dir="rtl"
        />
        
        <Button 
          onClick={analyzeText} 
          disabled={isAnalyzing || !text.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              جاري التحليل...
            </>
          ) : (
            'تحليل النص'
          )}
        </Button>

        {result && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">النتيجة:</span>
              <Badge 
                className={`${getSentimentColor(result.result)} text-white`}
              >
                {getSentimentText(result.result)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">درجة الثقة:</span>
              <span className="text-sm font-medium">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>

            {result.details && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-green-600">
                    {result.details.positiveScore}
                  </div>
                  <div className="text-muted-foreground">إيجابي</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">
                    {result.details.negativeScore}
                  </div>
                  <div className="text-muted-foreground">سلبي</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {result.details.wordsAnalyzed}
                  </div>
                  <div className="text-muted-foreground">كلمات</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
