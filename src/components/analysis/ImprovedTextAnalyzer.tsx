
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Brain, Loader2, MessageSquare, TrendingUp, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisResult {
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  dialect: string;
  modelSource: string;
}

interface PredictionRecord {
  id: string;
  text: string;
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  dialect: string;
  model_source: string;
  created_at: string;
}

const ImprovedTextAnalyzer = () => {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<PredictionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, isAuthenticated } = useAuth();

  const fetchRecentPredictions = async () => {
    try {
      // Use analyzed_posts table instead of predictions to avoid RLS issues
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent predictions:', error);
        return;
      }

      if (data) {
        // Transform to match expected format
        const transformedData: PredictionRecord[] = data.map(item => ({
          id: item.id,
          text: item.content,
          sentiment: item.sentiment || 'neutral',
          confidence: item.sentiment_score || 0,
          positive_prob: item.sentiment === 'positive' ? (item.sentiment_score || 0) : 0,
          negative_prob: item.sentiment === 'negative' ? (item.sentiment_score || 0) : 0,
          dialect: item.is_jordanian_dialect ? 'Jordanian' : 'Non-Jordanian',
          model_source: 'MARBERT_Enhanced',
          created_at: item.created_at
        }));
        setRecentPredictions(transformedData);
      }
    } catch (error) {
      console.error('Error in fetchRecentPredictions:', error);
    }
  };

  const analyzeText = async () => {
    if (!text.trim()) {
      toast.error('يرجى إدخال نص للتحليل');
      return;
    }

    // Check authentication - use isAuthenticated and user instead of just profile
    if (!isAuthenticated || !user?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      // Call the analyze-text function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-text', {
        body: { text }
      });

      if (analysisError) throw analysisError;

      // Store in analyzed_posts table instead of predictions
      const { error: insertError } = await supabase
        .from('analyzed_posts')
        .insert({
          user_id: user.id, // Use user.id directly instead of profile.id
          content: text,
          sentiment: analysisData.sentiment,
          sentiment_score: analysisData.confidence,
          is_jordanian_dialect: analysisData.dialect === 'Jordanian',
          source: 'manual_analysis'
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        // Don't throw error, just log it - we can still show the result
      }

      setResult(analysisData);
      toast.success('تم تحليل النص بنجاح! 🎉');
      
      // Refresh recent predictions
      fetchRecentPredictions();

    } catch (error: any) {
      console.error('Analysis error:', error);
      setError(error.message || 'حدث خطأ أثناء التحليل');
      toast.error('فشل في تحليل النص');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'إيجابي';
      case 'negative': return 'سلبي';
      default: return 'محايد';
    }
  };

  // Fetch recent predictions on component mount
  useState(() => {
    if (user?.id) {
      fetchRecentPredictions();
    }
  });

  return (
    <div className="space-y-8" dir="rtl">
      {/* Main Analysis Card */}
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-7 w-7 text-primary" />
            </motion.div>
            محلل المشاعر المتطور 🤖
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-lg font-medium">أدخل النص للتحليل:</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب النص الذي تريد تحليل مشاعره هنا..."
              className="min-h-32 text-lg border-2 border-primary/20 focus:border-primary/50"
              dir="rtl"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={analyzeText} 
            disabled={analyzing || !text.trim()}
            className="w-full h-14 text-lg"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin ml-3" />
                جاري التحليل بالذكاء الاصطناعي...
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6 ml-3" />
                🚀 تحليل النص بـ MARBERT
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-green-200 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="text-4xl">{getSentimentEmoji(result.sentiment)}</div>
                  🎯 نتائج التحليل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      <span className="text-lg font-bold">المشاعر:</span>
                    </div>
                    <Badge className={`text-xl px-6 py-3 ${getSentimentColor(result.sentiment)}`}>
                      {getSentimentText(result.sentiment)}
                    </Badge>
                    <div className="text-lg">
                      <strong>درجة الثقة:</strong> {Math.round(result.confidence * 100)}%
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Globe className="h-6 w-6 text-purple-600" />
                      <span className="text-lg font-bold">اللهجة:</span>
                    </div>
                    <Badge variant="outline" className="text-lg px-6 py-3">
                      🇯🇴 {result.dialect === 'Jordanian' ? 'أردنية' : 'غير أردنية'}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      المصدر: {result.modelSource}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-primary/20">
                  <p className="text-lg leading-relaxed" dir="rtl">{text}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Predictions */}
      {recentPredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6" />
              آخر التحليلات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPredictions.map((prediction) => (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getSentimentEmoji(prediction.sentiment)}</span>
                      <Badge className={getSentimentColor(prediction.sentiment)}>
                        {getSentimentText(prediction.sentiment)}
                      </Badge>
                      <Badge variant="outline">
                        🇯🇴 {prediction.dialect === 'Jordanian' ? 'أردنية' : 'غير أردنية'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(prediction.confidence * 100)}% ثقة
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2" dir="rtl">
                    {prediction.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImprovedTextAnalyzer;
