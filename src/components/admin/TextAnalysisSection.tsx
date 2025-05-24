
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, TrendingUp, TrendingDown, Globe } from "lucide-react";

interface AnalysisResult {
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  dialect: string;
}

const TextAnalysisSection = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('الرجاء إدخال نص للتحليل');
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

      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data);

      // Save to predictions table using type assertion to bypass strict typing
      const { error: saveError } = await (supabase as any)
        .from('predictions')
        .insert({
          text: text.trim(),
          sentiment: data.sentiment,
          confidence: data.confidence,
          positive_prob: data.positive_prob,
          negative_prob: data.negative_prob,
          dialect: data.dialect
        });

      if (saveError) {
        console.error('Error saving prediction:', saveError);
        toast.error('تم التحليل بنجاح ولكن فشل في حفظ النتيجة');
      } else {
        toast.success('تم التحليل والحفظ بنجاح');
      }

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'حدث خطأ أثناء التحليل');
      toast.error('فشل في تحليل النص');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          تحليل النصوص العربية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">أدخل النص العربي للتحليل:</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="أدخل النص العربي هنا..."
            className="min-h-[100px]"
            dir="rtl"
          />
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !text.trim()}
          className="w-full"
        >
          {isAnalyzing ? 'جاري التحليل...' : 'تحليل النص'}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">خطأ: {error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg">نتائج التحليل:</h3>
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">التصنيف:</span>
                <div className="flex items-center gap-2">
                  {result.sentiment === 'positive' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <Badge variant={result.sentiment === 'positive' ? 'default' : 'destructive'}>
                    {result.sentiment === 'positive' ? 'إيجابي' : 'سلبي'}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    (ثقة: {(result.confidence * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">الاحتمالات:</span>
                <span className="text-sm">
                  إيجابي ({(result.positive_prob * 100).toFixed(1)}%), 
                  سلبي ({(result.negative_prob * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">اللهجة:</span>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <Badge variant="outline">
                    {result.dialect === 'Jordanian' ? 'باللهجة الأردنية' : 'ليس باللهجة الأردنية'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TextAnalysisSection;
