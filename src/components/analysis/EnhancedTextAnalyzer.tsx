
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Frown, Meh, MapPin, BarChart3, Trash2 } from "lucide-react";

interface AnalysisResult {
  id: string;
  text: string;
  sentiment: string;
  confidence: number;
  positive_prob: number;
  negative_prob: number;
  dialect: string;
  category: string;
  is_jordanian_dialect: boolean;
  created_at: string;
}

const EnhancedTextAnalyzer = () => {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // استخدام Promise.all لمعالجة العمليات غير المتزامنة
      const transformedResults: AnalysisResult[] = await Promise.all(
        (data || []).map(async (item) => ({
          id: item.id,
          text: item.text,
          sentiment: item.sentiment,
          confidence: item.confidence,
          positive_prob: item.positive_prob,
          negative_prob: item.negative_prob,
          dialect: item.dialect,
          category: await getCategoryForText(item.text),
          is_jordanian_dialect: await getJordanianDialectForText(item.text),
          created_at: item.created_at
        }))
      );

      setResults(transformedResults);
    } catch (error: any) {
      console.error('Error fetching results:', error);
      toast.error('خطأ في جلب النتائج السابقة');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryForText = async (text: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .rpc('categorize_jordanian_post', { content: text });
      
      if (error) throw error;
      return data || 'general';
    } catch (error) {
      return 'general';
    }
  };

  const getJordanianDialectForText = async (text: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('detect_jordanian_dialect_enhanced', { content: text });
      
      if (error) throw error;
      return data || false;
    } catch (error) {
      return false;
    }
  };

  const analyzeText = async () => {
    if (!text.trim()) {
      toast.error('يرجى إدخال نص للتحليل');
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text: text.trim() }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('تم تحليل النص بنجاح');
        setText('');
        fetchResults(); // Refresh results
      } else {
        throw new Error(data?.error || 'خطأ في تحليل النص');
      }
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      toast.error('خطأ في تحليل النص: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteResult = async (id: string) => {
    try {
      const { error } = await supabase
        .from('predictions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResults(prev => prev.filter(r => r.id !== id));
      toast.success('تم حذف النتيجة');
    } catch (error: any) {
      console.error('Error deleting result:', error);
      toast.error('خطأ في حذف النتيجة');
    }
  };

  const clearAllResults = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع النتائج؟')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('predictions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      setResults([]);
      toast.success('تم حذف جميع النتائج');
    } catch (error: any) {
      console.error('Error clearing results:', error);
      toast.error('خطأ في حذف النتائج');
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Heart className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-gray-500" />;
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

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'politics': 'سياسة',
      'economics': 'اقتصاد',
      'religion': 'دين',
      'education': 'تعليم',
      'sports': 'رياضة',
      'general': 'عام'
    };
    return categories[category] || category;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>تحليل النص المتقدم</CardTitle>
          <CardDescription>
            أدخل النص لتحليل المشاعر، كشف اللهجة الأردنية، والتصنيف
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="أدخل النص المراد تحليله هنا..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button 
            onClick={analyzeText} 
            disabled={analyzing || !text.trim()}
            className="w-full"
          >
            {analyzing ? 'جاري التحليل...' : 'تحليل النص'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>النتائج السابقة</CardTitle>
              <CardDescription>آخر 10 تحليلات</CardDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllResults}
              disabled={results.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              حذف الكل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد نتائج سابقة
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Card key={result.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteResult(result.id)}
                    className="absolute top-2 left-2 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* النص */}
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{result.text}</p>
                      </div>

                      {/* النتائج */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* تحليل المشاعر */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getSentimentIcon(result.sentiment)}
                            <span className="font-medium">تحليل المشاعر</span>
                          </div>
                          <Badge className={getSentimentColor(result.sentiment)}>
                            {result.sentiment === 'positive' ? 'إيجابي' : 
                             result.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                          </Badge>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>الثقة</span>
                              <span>{(result.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={result.confidence * 100} className="h-2" />
                          </div>
                        </div>

                        {/* معلومات إضافية */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">التصنيف</span>
                          </div>
                          <Badge variant="outline">
                            {getCategoryName(result.category)}
                          </Badge>
                          
                          {result.is_jordanian_dialect && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-orange-500" />
                              <Badge variant="secondary">لهجة أردنية</Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* الاحتماليات */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">توزيع الاحتماليات</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>إيجابي</span>
                            <span>{(result.positive_prob * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={result.positive_prob * 100} className="h-1" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>سلبي</span>
                            <span>{(result.negative_prob * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={result.negative_prob * 100} className="h-1" />
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {new Date(result.created_at).toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTextAnalyzer;
