
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, TrendingUp, TrendingDown, Minus, Globe, Sparkles, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EnhancedAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  emotion: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  emotional_intensity: number;
  emotion_details: {
    detected_emotion: string;
    intensity_level: string;
  };
  dialect: string;
  dialect_confidence: number;
  dialect_indicators: string[];
  emotional_markers: string[];
  emotional_context: string[];
  validation_context: string;
  modelSource: string;
  processed_text: string;
}

interface EnhancedTextAnalysisFormProps {
  projectId: string;
}

const EnhancedTextAnalysisForm = ({ projectId }: EnhancedTextAnalysisFormProps) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<EnhancedAnalysisResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();

  const analyzeTextMutation = useMutation({
    mutationFn: async (inputText: string) => {
      console.log('Starting enhanced analysis for text:', inputText);
      
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text: inputText }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to analyze text');
      }
      
      console.log('Enhanced analysis successful:', data);
      return data as EnhancedAnalysisResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "تم التحليل بنجاح",
        description: "تم تحليل النص باستخدام نموذج MARBERT المطور",
      });
      
      // Invalidate project stats to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['project-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-analyses', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-analysis-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-text-analyses', projectId] });
    },
    onError: (error) => {
      console.error('Enhanced analysis error:', error);
      toast({
        title: "فشل في التحليل",
        description: error.message || 'حدث خطأ أثناء التحليل',
        variant: "destructive",
      });
    }
  });

  const handleAnalyze = () => {
    if (!text.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نص للتحليل",
        variant: "destructive",
      });
      return;
    }
    analyzeTextMutation.mutate(text.trim());
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentText = (sentiment: string) => {
    return sentiment === 'positive' ? 'إيجابي' : 
           sentiment === 'negative' ? 'سلبي' : 'محايد';
  };

  const getSentimentEmoji = (sentiment: string) => {
    return sentiment === 'positive' ? '😊' : 
           sentiment === 'negative' ? '😞' : '😐';
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="text-base font-medium">النص المراد تحليله</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="أدخل النص العربي هنا... مثال: يلا يا زلمة الوضع تمام والخدمة ممتازة"
            className="min-h-[120px] resize-none text-lg leading-relaxed"
            dir="rtl"
            disabled={analyzeTextMutation.isPending}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>عدد الأحرف: {text.length}</span>
            <span>عدد الكلمات: {text.trim().split(/\s+/).filter(w => w.length > 0).length}</span>
          </div>
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={analyzeTextMutation.isPending || !text.trim()}
          className="w-full h-14 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
        >
          {analyzeTextMutation.isPending ? (
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
      </div>

      {result && (
        <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 rounded-xl border">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <Target className="h-6 w-6" />
              نتائج التحليل المتقدم
            </h3>
          </div>
          
          {/* Main Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl mb-3">{getSentimentEmoji(result.sentiment)}</div>
              <Badge className={`${getSentimentColor(result.sentiment)} text-lg px-4 py-2`}>
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
                <div className="text-2xl font-bold text-gray-700">
                  {result.dialect_confidence}%
                </div>
                <div className="text-sm text-gray-500">ثقة كشف اللهجة</div>
              </div>
            </div>
          </div>

          {/* Emotion Analysis */}
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              💭 تحليل العواطف المتقدم
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700">{result.emotion}</div>
                <div className="text-sm text-purple-600">العاطفة المكتشفة</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700">{result.emotion_details.intensity_level}</div>
                <div className="text-sm text-purple-600">مستوى الشدة</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700">{(result.emotional_intensity * 100).toFixed(1)}%</div>
                <div className="text-sm text-purple-600">الشدة العاطفية</div>
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

          {/* Emotional Markers */}
          {result.emotional_markers && result.emotional_markers.length > 0 && (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                💫 المؤشرات العاطفية
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.emotional_markers.map((marker, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    {marker}
                  </Badge>
                ))}
              </div>
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
            ✨ تم التحليل باستخدام {result.modelSource || 'نموذج MARBERT المطور'} مع معالجة متقدمة للنصوص العربية
          </div>
        </div>
      )}

      {/* Sample Texts */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl">نصوص تجريبية محسّنة</CardTitle>
          <CardDescription className="text-sm">جرب هذه النصوص لرؤية قوة النموذج المطور</CardDescription>
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
};

export default EnhancedTextAnalysisForm;
