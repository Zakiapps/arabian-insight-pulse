
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Globe,
  Target,
  Zap,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

const EnhancedTextAnalyzer = () => {
  const { profile } = useAuth();
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeText = async () => {
    if (!text.trim()) {
      toast.error("يرجى إدخال نص للتحليل");
      return;
    }

    setAnalyzing(true);
    try {
      // Call the analyze-text edge function
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text: text.trim() }
      });

      if (error) throw error;

      setResult(data);
      
      // Store the analysis result
      const { error: insertError } = await supabase
        .from('analyzed_posts')
        .insert({
          user_id: profile?.id,
          content: text.trim(),
          sentiment: data.sentiment,
          sentiment_score: data.confidence,
          is_jordanian_dialect: data.dialect === 'jordanian',
          source: 'manual_analysis'
        });

      if (insertError) throw insertError;

      toast.success("تم تحليل النص بنجاح");
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast.error("حدث خطأ أثناء تحليل النص");
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return TrendingUp;
      case 'negative': return TrendingDown;
      default: return BarChart3;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            تحليل النصوص المتقدم
          </h2>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          استخدم تقنيات الذكاء الاصطناعي المتطورة لتحليل المشاعر واكتشاف اللهجة الأردنية في النصوص العربية
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              إدخال النص
            </CardTitle>
            <CardDescription>
              أدخل النص العربي الذي تريد تحليله
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder="اكتب أو الصق النص العربي هنا..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] text-right"
              dir="rtl"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>عدد الأحرف: {text.length}</span>
              <span>عدد الكلمات: {text.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
            </div>
            <Button 
              onClick={analyzeText} 
              disabled={analyzing || !text.trim()}
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              size="lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  تحليل النص
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500/5 to-purple-500/5">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              نتائج التحليل
            </CardTitle>
            <CardDescription>
              تحليل مفصل للنص باستخدام الذكاء الاصطناعي
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!result ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/30 w-fit mx-auto mb-4">
                  <Brain className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium mb-2">في انتظار التحليل</h3>
                <p className="text-sm">أدخل نصاً وانقر على "تحليل النص" لرؤية النتائج</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Sentiment Analysis */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    تحليل المشاعر
                  </h4>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={result.sentiment === 'positive' ? 'default' : 
                               result.sentiment === 'negative' ? 'destructive' : 'secondary'}
                      className="text-sm"
                    >
                      {result.sentiment === 'positive' ? 'إيجابي' : 
                       result.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">مستوى الثقة</span>
                        <span className="text-sm font-medium">{Math.round(result.confidence * 100)}%</span>
                      </div>
                      <Progress value={result.confidence * 100} className="h-2" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dialect Detection */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    كشف اللهجة
                  </h4>
                  <div className="flex items-center gap-3">
                    <Badge variant={result.dialect === 'jordanian' ? 'default' : 'outline'}>
                      {result.dialect === 'jordanian' ? 'أردنية' : 'عربية فصحى'}
                    </Badge>
                    {result.dialect_confidence && (
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">دقة الكشف</span>
                          <span className="text-sm font-medium">{Math.round(result.dialect_confidence * 100)}%</span>
                        </div>
                        <Progress value={result.dialect_confidence * 100} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Detailed Metrics */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    تفاصيل التحليل
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {result.positive_prob && (
                      <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="text-sm text-green-600 mb-1">احتمالية إيجابية</div>
                        <div className="text-lg font-bold text-green-700">
                          {Math.round(result.positive_prob * 100)}%
                        </div>
                      </div>
                    )}
                    {result.negative_prob && (
                      <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                        <div className="text-sm text-red-600 mb-1">احتمالية سلبية</div>
                        <div className="text-lg font-bold text-red-700">
                          {Math.round(result.negative_prob * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* AI Insights */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">رؤى الذكاء الاصطناعي</span>
                  </div>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>تم تحليل النص باستخدام خوارزمية AraBERT المحسّنة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>تم كشف الكلمات المفتاحية والمؤشرات العاطفية</span>
                    </div>
                    {result.dialect === 'jordanian' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        <span>تم التعرف على خصائص اللهجة الأردنية بنجاح</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Features */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-center p-4 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
          <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold mb-1">تحليل فوري</h3>
          <p className="text-sm text-muted-foreground">نتائج سريعة ودقيقة في ثوانٍ</p>
        </Card>
        
        <Card className="text-center p-4 border-2 border-dashed border-green-500/20 hover:border-green-500/40 transition-colors">
          <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">دقة عالية</h3>
          <p className="text-sm text-muted-foreground">تدريب على ملايين النصوص العربية</p>
        </Card>
        
        <Card className="text-center p-4 border-2 border-dashed border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">كشف اللهجات</h3>
          <p className="text-sm text-muted-foreground">تخصص في اللهجة الأردنية</p>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedTextAnalyzer;
