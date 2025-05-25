import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Brain, Loader2 } from "lucide-react";
import React, { useCallback, useState } from 'react';
import { toast } from "sonner";

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
  minLength?: number;
  maxLength?: number;
}

export const TextAnalyzer: React.FC<TextAnalyzerProps> = ({
  title = "تحليل المشاعر بنموذج ONNX",
  placeholder = "أدخل النص العربي المراد تحليله...",
  defaultText = "",
  minLength = 3,
  maxLength = 1000
}) => {
  const [text, setText] = useState(defaultText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateInput = useCallback(() => {
    if (!text.trim()) {
      toast.error("يرجى إدخال نص للتحليل");
      return false;
    }

    if (text.length < minLength) {
      toast.error(`النص قصير جداً (الحد الأدنى ${minLength} أحرف)`);
      return false;
    }

    if (text.length > maxLength) {
      toast.error(`النص طويل جداً (الحد الأقصى ${maxLength} أحرف)`);
      return false;
    }

    return true;
  }, [text, minLength, maxLength]);

  const analyzeText = useCallback(async () => {
    if (!validateInput()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-text', {
        body: { 
          text: text.trim(),
          options: {
            focus: ['positive', 'negative'] // Explicitly request these sentiment classes
          }
        }
      });

      if (functionError) {
        throw functionError;
      }

      if (!data || data.error) {
        throw new Error(data?.error || "No data received from analysis");
      }

      // Validate the response structure
      if (
        !data.sentiment || 
        !['positive', 'negative'].includes(data.sentiment) ||
        typeof data.confidence !== 'number'
      ) {
        throw new Error("Invalid analysis response format");
      }

      setResult({
        ...data,
        positive_prob: data.positive_prob ?? (data.sentiment === 'positive' ? data.confidence : 1 - data.confidence),
        negative_prob: data.negative_prob ?? (data.sentiment === 'negative' ? data.confidence : 1 - data.confidence)
      });
      
      toast.success("تم تحليل النص بنجاح");
    } catch (error: any) {
      console.error('Analysis error:', error);
      const errorMessage = error.message || "حدث خطأ أثناء التحليل";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, [text, validateInput]);

  const getSentimentDetails = useCallback((sentiment: string) => {
    const details = {
      positive: {
        color: 'bg-green-500',
        text: 'إيجابي',
        icon: '👍'
      },
      negative: {
        color: 'bg-red-500',
        text: 'سلبي',
        icon: '👎'
      }
    };
    return details[sentiment as keyof typeof details] || details.positive;
  }, []);

  const sentimentDetails = result ? getSentimentDetails(result.sentiment) : null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          تحليل المشاعر الإيجابية والسلبية في النص العربي مع تحديد اللهجة
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              setText(e.target.value);
            }
          }}
          placeholder={placeholder}
          className="min-h-[120px] resize-none"
          dir="rtl"
          disabled={isAnalyzing}
        />
        <div className="text-xs text-muted-foreground text-right">
          {text.length}/{maxLength}
        </div>
        
        <Button 
          onClick={analyzeText} 
          disabled={isAnalyzing || !text.trim() || text.length < minLength}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              جاري التحليل...
            </>
          ) : (
            'تحليل المشاعر'
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
          <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="font-medium">النتيجة:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">{sentimentDetails?.icon}</span>
                <Badge className={`${sentimentDetails?.color} text-white`}>
                  {sentimentDetails?.text}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">درجة الثقة:</span>
                <span className="text-sm font-medium">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 border border-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(result.positive_prob * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-800">إيجابي</div>
                </div>
                <div className="text-center p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {(result.negative_prob * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-red-800">سلبي</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">تفاصيل:</span>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {result.dialect === 'Jordanian' ? 'لهجة أردنية' : 'لهجة عربية'}
                </Badge>
                <Badge variant="outline">
                  {result.modelSource}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};