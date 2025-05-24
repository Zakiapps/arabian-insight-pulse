
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, TrendingUp, TrendingDown, Globe, AlertTriangle } from "lucide-react";

interface AnalysisResult {
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  dialect: string;
  modelSource?: string;
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

      // Save to predictions table
      const { error: saveError } = await supabase
        .from('predictions')
        .insert({
          text: text.trim(),
          sentiment: data.sentiment,
          confidence: data.confidence,
          positive_prob: data.positive_prob,
          negative_prob: data.negative_prob,
          dialect: data.dialect,
          model_source: data.modelSource || 'MARBERT_Custom_Endpoint'
        });

      if (saveError) {
        console.error('Error saving prediction:', saveError);
        toast.error('تم التحليل بنجاح ولكن فشل في حفظ النتيجة');
      } else {
        toast.success('تم التحليل والحفظ بنجاح باستخدام نموذج MARBERT');
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
          <Brain className="h-5 w-5" />
          تحليل النصوص العربية - نموذج MARBERT
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          لوحة إدارة تحليل المشاعر باستخدام نموذج MARBERT المدرب على اللهجة الأردنية
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">أدخل النص العربي للتحليل:</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="مثال: يلا يا زلمة الوضع تمام والجو حلو..."
            className="min-h-[100px]"
            dir="rtl"
          />
          <p className="text-xs text-muted-foreground mt-1">
            * يجب أن يكون النص باللغة العربية وأكثر من 3 أحرف
          </p>
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !text.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Brain className="h-4 w-4 animate-pulse ml-2" />
              جاري التحليل بنموذج MARBERT...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 ml-2" />
              تحليل بنموذج MARBERT
            </>
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
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">نتائج تحليل MARBERT:</h3>
              <div className="flex items-center gap-1 text-blue-600">
                <Brain className="h-4 w-4" />
                <span className="text-xs">نموذج مخصص للأردنية</span>
              </div>
            </div>
            
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
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-green-100 rounded">
                    <div className="font-bold text-green-700">
                      {(result.positive_prob * 100).toFixed(1)}%
                    </div>
                    <div className="text-green-600">إيجابي</div>
                  </div>
                  <div className="text-center p-2 bg-red-100 rounded">
                    <div className="font-bold text-red-700">
                      {(result.negative_prob * 100).toFixed(1)}%
                    </div>
                    <div className="text-red-600">سلبي</div>
                  </div>
                </div>
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

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>النموذج:</span>
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  {result.modelSource || 'MARBERT_Custom_Endpoint'} (نموذج مخصص)
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TextAnalysisSection;
