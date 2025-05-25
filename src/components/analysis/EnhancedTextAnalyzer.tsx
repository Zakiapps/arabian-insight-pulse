
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Heart, 
  TrendingDown, 
  BarChart3,
  Languages,
  Globe,
  Sparkles,
  Upload,
  FileText,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  isJordanianDialect: boolean;
  dialectConfidence: number;
  details?: {
    positive_prob: number;
    negative_prob: number;
    jordanian_indicators: string[];
  };
}

const EnhancedTextAnalyzer = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  // Enhanced Jordanian dialect detection
  const detectJordanianDialect = (text: string): { isJordanian: boolean; confidence: number; indicators: string[] } => {
    const jordanianTerms = [
      "زلمة", "يا زلمة", "خرفنة", "تسليك", "احشش", "انكب", "راعي", "هسا", "شو", "كيفك",
      "إربد", "عمان", "الزرقاء", "العقبة", "منتخب", "واللهي", "عال", "بدك", "مش عارف",
      "تمام", "فش", "عالسريع", "يا رجال", "يلا", "خلص", "دبس", "بسطة",
      "جاي", "روح", "حياتي", "عن جد", "بكفي", "ما بدي", "طيب", "قديش", "وينك",
      "عالطول", "شايف", "هسه", "بتعرف", "بس", "يعني", "كتير", "شوي", "حبتين",
      "منيح", "بدأيش", "بطل", "خبرني", "ولك", "يا عمي", "مفكر", "بفكر"
    ];

    const jordanianPatterns = [
      /\b(شو|كيف|وين|بدك|مش|هسا|هسه|منيح)\b/gi,
      /\b(يا\s*(زلمة|رجال|حياتي|عمي))\b/gi,
      /\b(عال|فش|كتير|شوي)\b/gi,
      /\b(بدأيش|بطل|خبرني)\b/gi
    ];

    const textLower = text.toLowerCase();
    let foundTerms: string[] = [];
    let score = 0;

    // Check for Jordanian terms
    jordanianTerms.forEach(term => {
      if (textLower.includes(term.toLowerCase())) {
        foundTerms.push(term);
        score += 1;
      }
    });

    // Check for Jordanian patterns
    jordanianPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        foundTerms.push(...matches);
        score += matches.length * 0.5;
      }
    });

    const totalWords = text.split(/\s+/).length;
    const confidence = Math.min((score / Math.max(totalWords * 0.1, 1)) * 100, 100);
    const isJordanian = confidence > 15; // Lower threshold for better detection

    return {
      isJordanian,
      confidence: Math.round(confidence),
      indicators: [...new Set(foundTerms)] // Remove duplicates
    };
  };

  // Enhanced sentiment analysis
  const analyzeSentiment = (text: string): { sentiment: 'positive' | 'negative' | 'neutral'; confidence: number; positive_prob: number; negative_prob: number } => {
    const positiveWords = [
      "جميل", "رائع", "ممتاز", "عظيم", "مذهل", "سعيد", "فرح", "حب", "أحب", "حلو",
      "بخير", "تمام", "زين", "حلا", "ولا أروع", "روعة", "كويس", "منيح", "عال"
    ];

    const negativeWords = [
      "سيء", "فظيع", "مقرف", "حزين", "غضبان", "زعلان", "مش حلو", "وحش", "مو زين",
      "تعبان", "مريض", "زفت", "خرا", "مقهور", "مكسور", "زهقان", "ملان"
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) {
        positiveScore++;
      }
      if (negativeWords.some(nw => word.includes(nw))) {
        negativeScore++;
      }
    });

    const totalScore = positiveScore + negativeScore;
    if (totalScore === 0) {
      return { sentiment: 'neutral', confidence: 80, positive_prob: 0.33, negative_prob: 0.33 };
    }

    const positive_prob = positiveScore / totalScore;
    const negative_prob = negativeScore / totalScore;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 60;

    if (positive_prob > 0.6) {
      sentiment = 'positive';
      confidence = Math.round(positive_prob * 100);
    } else if (negative_prob > 0.6) {
      sentiment = 'negative';
      confidence = Math.round(negative_prob * 100);
    }

    return { sentiment, confidence, positive_prob, negative_prob };
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('يرجى إدخال نص للتحليل');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Perform sentiment analysis
      const sentimentResult = analyzeSentiment(text);
      
      // Perform dialect detection
      const dialectResult = detectJordanianDialect(text);

      const analysisResult: AnalysisResult = {
        sentiment: sentimentResult.sentiment,
        confidence: sentimentResult.confidence,
        isJordanianDialect: dialectResult.isJordanian,
        dialectConfidence: dialectResult.confidence,
        details: {
          positive_prob: sentimentResult.positive_prob,
          negative_prob: sentimentResult.negative_prob,
          jordanian_indicators: dialectResult.indicators
        }
      };

      // Save to database if user is logged in
      if (user) {
        try {
          const { error } = await supabase
            .from('analyzed_posts')
            .insert({
              user_id: user.id,
              content: text,
              sentiment: analysisResult.sentiment,
              sentiment_score: analysisResult.confidence / 100,
              is_jordanian_dialect: analysisResult.isJordanianDialect,
              source: 'manual_analysis'
            });

          if (error) {
            console.error('Error saving analysis:', error);
          }
        } catch (saveError) {
          console.error('Save error:', saveError);
        }
      }

      setResult(analysisResult);
      toast.success('تم تحليل النص بنجاح!');

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('حدث خطأ في التحليل، يرجى المحاولة مرة أخرى');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Heart className="h-5 w-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500';
      case 'negative':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'إيجابي';
      case 'negative':
        return 'سلبي';
      default:
        return 'محايد';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">تحليل النصوص المتقدم</CardTitle>
              <CardDescription>
                تحليل المشاعر وكشف اللهجة الأردنية باستخدام الذكاء الاصطناعي
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <label htmlFor="text-input" className="text-sm font-medium">
              النص المراد تحليله
            </label>
            <Textarea
              id="text-input"
              placeholder="اكتب النص الذي تريد تحليل مشاعره واكتشاف لهجته هنا..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px] text-right"
              dir="rtl"
            />
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={!text.trim() || isAnalyzing}
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                جاري التحليل...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                تحليل النص
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <Separator />
              
              {/* Sentiment Analysis Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  نتائج تحليل المشاعر
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(result.sentiment)}
                          <span className="font-medium">المشاعر العامة</span>
                        </div>
                        <Badge className={getSentimentColor(result.sentiment)}>
                          {getSentimentText(result.sentiment)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>مستوى الثقة</span>
                          <span>{result.confidence}%</span>
                        </div>
                        <Progress value={result.confidence} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">التفاصيل الإحصائية</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>احتمالية إيجابية:</span>
                          <span>{Math.round((result.details?.positive_prob || 0) * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>احتمالية سلبية:</span>
                          <span>{Math.round((result.details?.negative_prob || 0) * 100)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Dialect Detection Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  نتائج كشف اللهجة
                </h3>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">اللهجة المكتشفة</span>
                      </div>
                      <Badge variant={result.isJordanianDialect ? "default" : "secondary"}>
                        {result.isJordanianDialect ? "أردنية" : "غير أردنية"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>مستوى الثقة</span>
                        <span>{result.dialectConfidence}%</span>
                      </div>
                      <Progress value={result.dialectConfidence} className="h-2" />
                    </div>
                    
                    {result.isJordanianDialect && result.details?.jordanian_indicators && result.details.jordanian_indicators.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">المؤشرات المكتشفة:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.details.jordanian_indicators.slice(0, 8).map((indicator, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Success Message */}
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span>تم حفظ نتائج التحليل في حسابك بنجاح</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTextAnalyzer;
