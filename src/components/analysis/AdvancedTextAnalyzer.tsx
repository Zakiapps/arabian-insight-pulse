
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, Sparkles, Target, Globe, TrendingUp, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisResult {
  sentiment: string;
  sentiment_score: number;
  positive_prob: number;
  negative_prob: number;
  neutral_prob: number;
  is_jordanian_dialect: boolean;
  confidence: number;
  word_count: number;
  char_count: number;
  keywords: string[];
}

export default function AdvancedTextAnalyzer() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const analyzeText = async () => {
    if (!text.trim()) {
      toast.error("يرجى إدخال نص للتحليل");
      return;
    }

    if (text.length < 10) {
      toast.error("النص قصير جداً، يرجى إدخال نص أطول");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Call the analyze-text edge function
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text }
      });

      if (error) throw error;

      // Enhanced analysis with additional metrics
      const enhancedResult: AnalysisResult = {
        sentiment: data.sentiment,
        sentiment_score: data.confidence,
        positive_prob: data.positive_prob || 0,
        negative_prob: data.negative_prob || 0,
        neutral_prob: 1 - (data.positive_prob || 0) - (data.negative_prob || 0),
        is_jordanian_dialect: data.dialect === 'Jordanian',
        confidence: data.confidence,
        word_count: text.trim().split(/\s+/).length,
        char_count: text.length,
        keywords: extractKeywords(text),
      };

      setResult(enhancedResult);
      
      // Save to database
      const { error: saveError } = await supabase
        .from('analyzed_posts')
        .insert({
          user_id: user?.id,
          content: text,
          source: 'advanced-analyzer',
          sentiment: enhancedResult.sentiment,
          sentiment_score: enhancedResult.sentiment_score,
          is_jordanian_dialect: enhancedResult.is_jordanian_dialect,
          engagement_count: 0
        });

      if (saveError) {
        console.error('Error saving analysis:', saveError);
      }

      // Animate results
      setTimeout(() => setShowDetails(true), 500);
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error("حدث خطأ أثناء تحليل النص");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractKeywords = (text: string): string[] => {
    // Simple keyword extraction - remove stop words and get frequent terms
    const stopWords = ['في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'التي', 'اللي', 'بس', 'لكن'];
    const words = text.toLowerCase().match(/[\u0600-\u06FF]+/g) || [];
    const filtered = words.filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Count frequency and return top keywords
    const frequency: { [key: string]: number } = {};
    filtered.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            محلل النصوص المتقدم
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </CardTitle>
          <CardDescription className="text-lg">
            تحليل ذكي ومتقدم للنصوص العربية باستخدام الذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              أدخل النص للتحليل
            </label>
            <Textarea
              placeholder="اكتب هنا النص العربي الذي تريد تحليله... مثال: 'أعجبني هذا المنتج كثيراً وأنصح به الجميع'"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none border-2 focus:border-primary/50 transition-colors"
              dir="rtl"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>الأحرف: {text.length}</span>
              <span>الكلمات: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
            </div>
          </div>

          <Button 
            onClick={analyzeText} 
            disabled={isAnalyzing || !text.trim()}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري التحليل...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                تحليل النص
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-6 w-6" />
                  نتائج التحليل
                  <span className="text-2xl">{getSentimentIcon(result.sentiment)}</span>
                </CardTitle>
                <CardDescription>تحليل شامل ومتقدم للنص المدخل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Results */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className={`border-2 ${getSentimentColor(result.sentiment)}`}>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <div className="text-4xl font-bold">
                          {result.sentiment === 'positive' ? 'إيجابي' : 
                           result.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                        </div>
                        <div className="text-lg font-semibold">
                          مستوى الثقة: {(result.confidence * 100).toFixed(1)}%
                        </div>
                        <Progress value={result.confidence * 100} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border-2 ${result.is_jordanian_dialect ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <Globe className="h-8 w-8 mx-auto" />
                        <div className="text-2xl font-bold">
                          {result.is_jordanian_dialect ? 'لهجة أردنية' : 'لهجة غير أردنية'}
                        </div>
                        <div className="text-sm">
                          {result.is_jordanian_dialect ? 'تم كشف استخدام اللهجة الأردنية' : 'لم يتم كشف اللهجة الأردنية'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Probabilities */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">تفاصيل الاحتماليات</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                إيجابي
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium w-12">
                                  {(result.positive_prob * 100).toFixed(1)}%
                                </span>
                                <Progress value={result.positive_prob * 100} className="w-24" />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                محايد
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium w-12">
                                  {(result.neutral_prob * 100).toFixed(1)}%
                                </span>
                                <Progress value={result.neutral_prob * 100} className="w-24" />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                سلبي
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium w-12">
                                  {(result.negative_prob * 100).toFixed(1)}%
                                </span>
                                <Progress value={result.negative_prob * 100} className="w-24" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Statistics and Keywords */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        إحصائيات النص
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>عدد الكلمات:</span>
                        <Badge variant="outline">{result.word_count}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>عدد الأحرف:</span>
                        <Badge variant="outline">{result.char_count}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>متوسط طول الكلمة:</span>
                        <Badge variant="outline">
                          {result.word_count > 0 ? (result.char_count / result.word_count).toFixed(1) : 0}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        الكلمات المفتاحية
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.length > 0 ? (
                          result.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">لم يتم العثور على كلمات مفتاحية</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
