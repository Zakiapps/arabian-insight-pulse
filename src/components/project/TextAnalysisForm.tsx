
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, TrendingUp, TrendingDown, Minus, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnalysisResult {
  id: string;
  sentiment: string;
  sentimentScore: number;
  language: string;
  dialect: string;
  dialectConfidence: number;
}

interface TextAnalysisFormProps {
  projectId: string;
}

const TextAnalysisForm = ({ projectId }: TextAnalysisFormProps) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();

  const analyzeTextMutation = useMutation({
    mutationFn: async (inputText: string) => {
      console.log('Starting analysis for text:', inputText);
      
      const { data, error } = await supabase.functions.invoke('analyze-arabic-text', {
        body: { text: inputText, projectId }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to analyze text');
      }
      
      console.log('Analysis successful:', data);
      return data as AnalysisResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: isRTL ? "تم التحليل بنجاح" : "Analysis Complete",
        description: isRTL ? "تم تحليل النص وحفظ النتائج" : "Text analyzed and results saved",
      });
      
      // Invalidate project stats to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['project-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-analyses', projectId] });
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast({
        title: isRTL ? "فشل في التحليل" : "Analysis Failed",
        description: error.message || 'An error occurred during analysis',
        variant: "destructive",
      });
    }
  });

  const handleAnalyze = () => {
    if (!text.trim()) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال نص للتحليل" : "Please enter text to analyze",
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

  const getDialectName = (dialect: string) => {
    const dialectNames: Record<string, string> = {
      'jordanian': isRTL ? 'أردني' : 'Jordanian',
      'egyptian': isRTL ? 'مصري' : 'Egyptian',
      'saudi': isRTL ? 'سعودي' : 'Saudi',
      'msa': isRTL ? 'عربي فصيح' : 'Modern Standard Arabic'
    };
    return dialectNames[dialect] || dialect;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {isRTL ? 'تحليل النص العربي' : 'Arabic Text Analysis'}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? 'أدخل النص العربي لتحليل المشاعر واكتشاف اللهجة'
              : 'Enter Arabic text to analyze sentiment and detect dialect'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={isRTL ? "اكتب النص العربي هنا..." : "Enter Arabic text here..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button 
            onClick={handleAnalyze}
            disabled={analyzeTextMutation.isPending || !text.trim()}
            className="w-full"
          >
            {analyzeTextMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isRTL ? 'جاري التحليل...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                {isRTL ? 'تحليل النص' : 'Analyze Text'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getSentimentIcon(result.sentiment)}
              {isRTL ? 'نتائج التحليل' : 'Analysis Results'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sentiment Analysis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {isRTL ? 'تحليل المشاعر:' : 'Sentiment:'}
                </span>
                <Badge className={getSentimentColor(result.sentiment)}>
                  {result.sentiment === 'positive' ? (isRTL ? 'إيجابي' : 'Positive') :
                   result.sentiment === 'negative' ? (isRTL ? 'سلبي' : 'Negative') :
                   (isRTL ? 'محايد' : 'Neutral')}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{isRTL ? 'الثقة:' : 'Confidence:'}</span>
                  <span>{Math.round(result.sentimentScore * 100)}%</span>
                </div>
                <Progress value={result.sentimentScore * 100} className="h-2" />
              </div>
            </div>

            {/* Language & Dialect */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {isRTL ? 'اللغة:' : 'Language:'}
                  </span>
                </div>
                <Badge variant="outline">
                  {isRTL ? 'العربية' : 'Arabic'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">
                  {isRTL ? 'اللهجة:' : 'Dialect:'}
                </span>
                <div className="space-y-1">
                  <Badge variant="outline">
                    {getDialectName(result.dialect)}
                  </Badge>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{isRTL ? 'الثقة:' : 'Confidence:'}</span>
                    <span>{Math.round(result.dialectConfidence * 100)}%</span>
                  </div>
                  <Progress value={result.dialectConfidence * 100} className="h-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TextAnalysisForm;
