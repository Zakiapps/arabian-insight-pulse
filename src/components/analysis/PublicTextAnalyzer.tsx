
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, TrendingUp, TrendingDown, Globe, Sparkles, AlertTriangle, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AnalysisResult {
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  dialect: string;
  modelSource?: string;
}

const PublicTextAnalyzer = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
          user_id: user?.id || null,
          text: text.trim(),
          sentiment: data.sentiment,
          confidence: data.confidence,
          positive_prob: data.positive_prob,
          negative_prob: data.negative_prob,
          dialect: data.dialect,
          model_source: data.modelSource || 'AraBERT_ONNX'
        });

      if (saveError) {
        console.error('Error saving prediction:', saveError);
      }

      toast.success('تم تحليل النص بنجاح باستخدام نموذج AraBERT!');

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'حدث خطأ أثناء التحليل');
      toast.error('فشل في تحليل النص');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-primary" />
            محلل المشاعر العربية - AraBERT
          </CardTitle>
          <p className="text-muted-foreground">
            اكتشف المشاعر واللهجة في النصوص العربية باستخدام نموذج AraBERT ONNX المدرب
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
            <Sparkles className="h-4 w-4" />
            مدعوم بالذكاء الاصطناعي المتقدم
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">أدخل النص العربي للتحليل:</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="مثال: يلا يا زلمة الوضع تمام والجو حلو..."
              className="min-h-[120px] text-right"
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
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                جاري التحليل بنموذج AraBERT...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                تحليل بنموذج AraBERT
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-700 font-medium">خطأ: {error}</p>
              </div>
              <p className="text-sm text-red-600 mt-1">
                تأكد من أن النص باللغة العربية ومن توفر الاتصال بالإنترنت
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl text-gray-800">نتائج تحليل AraBERT</h3>
                <div className="flex items-center gap-1 text-blue-600">
                  <Brain className="h-4 w-4" />
                  <span className="text-xs">نموذج ONNX</span>
                </div>
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="font-semibold">التصنيف:</span>
                  <div className="flex items-center gap-2">
                    {result.sentiment === 'positive' ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    <Badge 
                      variant={result.sentiment === 'positive' ? 'default' : 'destructive'}
                      className="text-sm px-3 py-1"
                    >
                      {result.sentiment === 'positive' ? 'إيجابي' : 'سلبي'}
                    </Badge>
                    <span className="text-sm font-medium text-gray-600">
                      ثقة: {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="font-semibold">الاحتمالات:</span>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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

                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="font-semibold">اللهجة:</span>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {result.dialect === 'Jordanian' ? 'باللهجة الأردنية' : 'ليس باللهجة الأردنية'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 mt-4 p-2 bg-blue-50 rounded">
                <div className="flex items-center justify-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>تم التحليل باستخدام نموذج AraBERT ONNX المدرب المتخصص في اللغة العربية</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>جرب نصوص مختلفة لاختبار دقة نموذج AraBERT المدرب</p>
            <p className="text-xs mt-1">
              أمثلة: "الجو حلو اليوم وأنا مبسوط" | "ما بدي هالحكي الفاضي"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicTextAnalyzer;
