
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Brain, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";

interface AnalysisResult {
  sentiment: 'positive' | 'negative';
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  dialect: string;
  modelSource: string;
}

export default function PublicTextAnalyzer() {
  const [text, setText] = useState('');
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
      console.log('Analyzing text:', text.trim());
      
      const { data, error: functionError } = await supabase.functions.invoke('analyze-text', {
        body: { text: text.trim() }
      });

      console.log('Analysis response:', data, functionError);

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (data?.error) {
        console.error('Analysis error:', data.error);
        setError(data.error);
        toast.error("فشل في تحليل النص");
        return;
      }

      if (data) {
        console.log('Analysis successful:', data);
        setResult(data);
        toast.success("تم تحليل النص بنجاح باستخدام نموذج MARBERT");
      } else {
        throw new Error('لم يتم استلام نتائج التحليل');
      }
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      const errorMessage = error.message || "حدث خطأ أثناء التحليل";
      setError(errorMessage);
      toast.error("فشل في تحليل النص: " + errorMessage);
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

  const getSentimentIcon = (sentiment: string) => {
    return sentiment === 'positive' ? '😊' : '😞';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Main Analysis Card */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="flex items-center justify-center gap-3 text-3xl">
            <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            تحليل المشاعر بنموذج MARBERT
          </CardTitle>
          <p className="text-lg text-muted-foreground">
            اكتشف المشاعر واللهجة الأردنية في النصوص العربية باستخدام الذكاء الاصطناعي
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-base font-medium">النص المراد تحليله</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="أدخل النص العربي هنا... مثال: هذا المنتج رائع وأنصح بتجربته"
              className="min-h-[120px] resize-none text-lg leading-relaxed"
              dir="rtl"
              disabled={isAnalyzing}
            />
          </div>
          
          <Button 
            onClick={analyzeText} 
            disabled={isAnalyzing || !text.trim()}
            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin ml-3" />
                جاري التحليل بنموذج MARBERT...
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6 ml-3" />
                تحليل بنموذج MARBERT
              </>
            )}
          </Button>

          {error && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="text-red-700 font-medium text-lg">خطأ في التحليل</p>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 rounded-xl border">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  نتائج التحليل
                </h3>
              </div>
              
              {/* Main Result */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white rounded-xl shadow-md">
                  <div className="text-4xl mb-3">{getSentimentIcon(result.sentiment)}</div>
                  <Badge 
                    className={`${getSentimentColor(result.sentiment)} text-white text-lg px-4 py-2`}
                  >
                    {getSentimentText(result.sentiment)}
                  </Badge>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-700">
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">درجة الثقة</div>
                  </div>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-md">
                  <div className="text-4xl mb-3">🇯🇴</div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {result.dialect === 'Jordanian' ? 'أردنية' : 'غير أردنية'}
                  </Badge>
                  <div className="mt-3 text-sm text-gray-600">
                    كشف اللهجة
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-100 rounded-xl">
                  <div className="text-2xl font-bold text-green-700">
                    {(result.positive_prob * 100).toFixed(1)}%
                  </div>
                  <div className="text-green-600 font-medium">إيجابي</div>
                </div>
                <div className="text-center p-4 bg-red-100 rounded-xl">
                  <div className="text-2xl font-bold text-red-700">
                    {(result.negative_prob * 100).toFixed(1)}%
                  </div>
                  <div className="text-red-600 font-medium">سلبي</div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500 mt-4 p-3 bg-white/50 rounded-lg">
                تم التحليل باستخدام نموذج {result.modelSource || 'MARBERT'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Texts */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl">نصوص تجريبية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="text-right h-auto p-4 justify-start"
              onClick={() => setText('هذا المنتج رائع حقاً وأنصح الجميع بتجربته. الجودة عالية والخدمة ممتازة.')}
            >
              "هذا المنتج رائع حقاً وأنصح الجميع بتجربته. الجودة عالية والخدمة ممتازة."
            </Button>
            <Button
              variant="outline"
              className="text-right h-auto p-4 justify-start"
              onClick={() => setText('الخدمة سيئة جداً ولا أنصح أحد بالتعامل معهم.')}
            >
              "الخدمة سيئة جداً ولا أنصح أحد بالتعامل معهم."
            </Button>
            <Button
              variant="outline"
              className="text-right h-auto p-4 justify-start"
              onClick={() => setText('والله هاي الشركة زاكية كثير وبخدمو منيح.')}
            >
              "والله هاي الشركة زاكية كثير وبخدمو منيح." (لهجة أردنية)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
