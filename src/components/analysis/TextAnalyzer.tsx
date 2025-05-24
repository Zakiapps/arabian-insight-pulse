
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Brain, AlertTriangle } from "lucide-react";

interface AnalysisResult {
  sentiment: 'positive' | 'negative';
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  dialect: string;
  modelSource: string;
}

interface TextAnalyzerProps {
  title?: string;
  placeholder?: string;
  defaultText?: string;
}

export const TextAnalyzer: React.FC<TextAnalyzerProps> = ({
  title = "تحليل المشاعر بنموذج AraBERT",
  placeholder = "أدخل النص العربي المراد تحليله...",
  defaultText = ""
}) => {
  const [text, setText] = useState(defaultText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = async () => {
    if (!text.trim()) {
      toast.error("يرجى إدخال نص للتحليل");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-text', {
        body: { text: text.trim() }
      });

      if (functionError) {
        throw functionError;
      }

      if (data?.error) {
        setError(data.error);
        toast.error("فشل في تحليل النص");
        return;
      }

      setResult(data);
      toast.success("تم تحليل النص بنجاح باستخدام نموذج AraBERT");
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      setError(error.message || "حدث خطأ أثناء التحليل");
      toast.error("فشل في تحليل النص");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    return sentiment === 'positive' ? 'bg-green-500' : 'bg-red-500';
  };

  const getSentimentText = (sentiment: string) => {
    return sentiment === 'positive' ? 'إيجابي' : 'سلبي';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          مدعوم بنموذج AraBERT ONNX المتخصص في اللغة العربية
        </p>
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
              جاري التحليل بنموذج AraBERT...
            </>
          ) : (
            'تحليل بنموذج AraBERT'
          )}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-red-700 font-medium">خطأ: {error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="font-medium">النتيجة:</span>
              <Badge 
                className={`${getSentimentColor(result.sentiment)} text-white`}
              >
                {getSentimentText(result.sentiment)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">درجة الثقة:</span>
              <span className="text-sm font-medium">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-2 bg-green-100 rounded">
                <div className="font-medium text-green-700">
                  {(result.positive_prob * 100).toFixed(1)}%
                </div>
                <div className="text-green-600">إيجابي</div>
              </div>
              <div className="text-center p-2 bg-red-100 rounded">
                <div className="font-medium text-red-700">
                  {(result.negative_prob * 100).toFixed(1)}%
                </div>
                <div className="text-red-600">سلبي</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">اللهجة:</span>
              <Badge variant="outline">
                {result.dialect === 'Jordanian' ? 'أردنية' : 'غير أردنية'}
              </Badge>
            </div>

            <div className="text-xs text-center text-muted-foreground mt-2">
              تم التحليل باستخدام نموذج {result.modelSource}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
