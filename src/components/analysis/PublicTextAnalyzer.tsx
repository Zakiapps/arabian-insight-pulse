import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Brain, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { useState } from 'react';
import { toast } from "sonner";

interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  dialect: string;
  dialect_confidence?: number;
  dialect_indicators?: string[];
  modelSource: string;
  processed_text?: string;
  validation?: { isValid: boolean; errorMsg: string };
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
    return sentiment === 'positive' ? 'bg-green-500' : 
           sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500';
  };

  const getSentimentText = (sentiment: string) => {
    return sentiment === 'positive' ? 'إيجابي' : 
           sentiment === 'negative' ? 'سلبي' : 'محايد';
  };

  const getSentimentIcon = (sentiment: string) => {
    return sentiment === 'positive' ? '😊' : 
           sentiment === 'negative' ? '😞' : '😐';
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
            تحليل المشاعر المطور بنموذج MARBERT
          </CardTitle>
          <p className="text-lg text-muted-foreground">
            تحليل متقدم للمشاعر واللهجة الأردنية مع معالجة ذكية للنصوص العربية
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-base font-medium">النص المراد تحليله</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="أدخل النص العربي هنا... مثال: يلا يا زلمة الوضع تمام والخدمة ممتازة"
              className="min-h-[120px] resize-none text-lg leading-relaxed"
              dir="rtl"
              disabled={isAnalyzing}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>عدد الأحرف: {text.length}</span>
              <span>عدد الكلمات: {text.trim().split(/\s+/).filter(w => w.length > 0).length}</span>
            </div>
          </div>
          
          <Button 
            onClick={analyzeText} 
            disabled={isAnalyzing || !text.trim()}
            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin ml-3" />
                جاري التحليل المتقدم بنموذج MARBERT...
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6 ml-3" />
                تحليل متقدم بنموذج MARBERT
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
                  نتائج التحليل المتقدم
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
                  <div className="mt-3">
                    {result.dialect_confidence && (
                      <>
                        <div className="text-2xl font-bold text-gray-700">
                          {result.dialect_confidence}%
                        </div>
                        <div className="text-sm text-gray-500">ثقة كشف اللهجة</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-100 rounded-xl">
                  <div className="text-2xl font-bold text-green-700">
                    {(result.positive_prob * 100).toFixed(1)}%
                  </div>
                  <div className="text-green-600 font-medium">احتمالية إيجابية</div>
                </div>
                <div className="text-center p-4 bg-red-100 rounded-xl">
                  <div className="text-2xl font-bold text-red-700">
                    {(result.negative_prob * 100).toFixed(1)}%
                  </div>
                  <div className="text-red-600 font-medium">احتمالية سلبية</div>
                </div>
              </div>

              {/* Dialect Indicators */}
              {result.dialect === 'Jordanian' && result.dialect_indicators && result.dialect_indicators.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    🎯 المؤشرات الأردنية المكتشفة
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.dialect_indicators.slice(0, 12).map((indicator, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                  {result.dialect_indicators.length > 12 && (
                    <p className="text-sm text-blue-600 mt-2">
                      و {result.dialect_indicators.length - 12} مؤشر آخر...
                    </p>
                  )}
                </div>
              )}

              {/* Processing Info */}
              {result.processed_text && result.processed_text !== text && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">النص بعد المعالجة:</h4>
                  <p className="text-sm text-yellow-800 italic" dir="rtl">
                    "{result.processed_text}"
                  </p>
                </div>
              )}

              <div className="text-center text-sm text-gray-500 mt-4 p-3 bg-white/50 rounded-lg">
                ✨ تم التحليل باستخدام نموذج MARBERT المطور مع معالجة متقدمة للنصوص العربية
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Sample Texts */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl">نصوص تجريبية محسّنة</CardTitle>
          <p className="text-sm text-muted-foreground">جرب هذه النصوص لرؤية قوة النموذج المطور</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="text-right h-auto p-4 justify-start hover:bg-blue-50"
              onClick={() => setText('يلا يا زلمة الوضع تمام والخدمة ممتازة، بدي أرجع أجرب المنتج مرة ثانية')}
            >
              <span className="text-green-600 ml-2">✓ إيجابي أردني:</span>
              "يلا يا زلمة الوضع تمام والخدمة ممتازة، بدي أرجع أجرب المنتج مرة ثانية"
            </Button>
            <Button
              variant="outline"
              className="text-right h-auto p-4 justify-start hover:bg-red-50"
              onClick={() => setText('والله الخدمة زفت وما بدي أشوف وجهكم مرة ثانية، مش عارف كيف بتشتغلوا')}
            >
              <span className="text-red-600 ml-2">✗ سلبي أردني:</span>
              "والله الخدمة زفت وما بدي أشوف وجهكم مرة ثانية، مش عارف كيف بتشتغلوا"
            </Button>
            <Button
              variant="outline"
              className="text-right h-auto p-4 justify-start hover:bg-green-50"
              onClick={() => setText('هذا المنتج رائع وأنصح بتجربته. الجودة عالية والخدمة ممتازة')}
            >
              <span className="text-green-600 ml-2">✓ إيجابي فصيح:</span>
              "هذا المنتج رائع وأنصح بتجربته. الجودة عالية والخدمة ممتازة"
            </Button>
            <Button
              variant="outline"
              className="text-right h-auto p-4 justify-start hover:bg-red-50"
              onClick={() => setText('الخدمة سيئة جداً ولا أنصح أحد بالتعامل معهم')}
            >
              <span className="text-red-600 ml-2">✗ سلبي فصيح:</span>
              "الخدمة سيئة جداً ولا أنصح أحد بالتعامل معهم"
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
