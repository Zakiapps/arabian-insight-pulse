import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Brain, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Sparkles, 
  Info
} from "lucide-react";

const SentimentModelPage = () => {
  const { isRTL } = useLanguage();
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const analyzeText = async () => {
    if (!text.trim()) {
      toast.error(isRTL ? "يرجى إدخال نص للتحليل" : "Please enter text to analyze");
      return;
    }
    
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text: text.trim() }
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResult(data);
      toast.success(isRTL ? "تم تحليل النص بنجاح" : "Text analyzed successfully");
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      toast.error(error.message || (isRTL ? "حدث خطأ أثناء التحليل" : "An error occurred during analysis"));
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          {isRTL ? "نموذج تحليل المشاعر" : "Sentiment Analysis Model"}
        </h1>
        <p className="text-muted-foreground">
          {isRTL 
            ? "تحليل المشاعر واكتشاف اللهجة الأردنية في النصوص العربية باستخدام نموذج AraBERT المخصص" 
            : "Analyze sentiment and detect Jordanian dialect in Arabic texts using custom AraBERT model"}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {isRTL ? "إدخال النص" : "Text Input"}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? "أدخل النص العربي الذي تريد تحليله" 
                : "Enter the Arabic text you want to analyze"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={isRTL 
                ? "أدخل النص العربي هنا..." 
                : "Enter Arabic text here..."}
              className="min-h-[200px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <Button 
              onClick={analyzeText} 
              disabled={isAnalyzing || !text.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRTL ? "جاري التحليل..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  {isRTL ? "تحليل النص" : "Analyze Text"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {isRTL ? "نتائج التحليل" : "Analysis Results"}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? "نتائج تحليل المشاعر واكتشاف اللهجة" 
                : "Sentiment analysis and dialect detection results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <Brain className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  {isRTL 
                    ? "أدخل نصًا وانقر على 'تحليل النص' لرؤية النتائج" 
                    : "Enter text and click 'Analyze Text' to see results"}
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? "جاري تحليل النص..." : "Analyzing text..."}
                </p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Sentiment Result */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {isRTL ? "تحليل المشاعر" : "Sentiment Analysis"}
                    </h3>
                    <Badge 
                      className={
                        result.sentiment === 'positive' ? 'bg-green-500' : 
                        result.sentiment === 'negative' ? 'bg-red-500' : 
                        'bg-gray-500'
                      }
                    >
                      {result.sentiment === 'positive' 
                        ? (isRTL ? "إيجابي" : "Positive") 
                        : result.sentiment === 'negative' 
                          ? (isRTL ? "سلبي" : "Negative") 
                          : (isRTL ? "محايد" : "Neutral")}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{isRTL ? "درجة الثقة" : "Confidence"}</span>
                      <span className="font-medium">{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <Progress value={result.confidence * 100} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-green-700">
                          {isRTL ? "إيجابي" : "Positive"}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        {Math.round(result.positive_prob * 100)}%
                      </div>
                    </div>
                    
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm font-medium text-red-700">
                          {isRTL ? "سلبي" : "Negative"}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-red-600">
                        {Math.round(result.negative_prob * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Dialect Result */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {isRTL ? "اكتشاف اللهجة" : "Dialect Detection"}
                    </h3>
                    <Badge variant="outline">
                      {result.dialect === 'Jordanian' 
                        ? (isRTL ? "لهجة أردنية" : "Jordanian Dialect") 
                        : (isRTL ? "غير أردنية" : "Non-Jordanian")}
                    </Badge>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Globe className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-blue-700">
                        {isRTL ? "خصائص اللهجة" : "Dialect Features"}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600">
                      {result.dialect === 'Jordanian' 
                        ? (isRTL 
                            ? "تم اكتشاف خصائص اللهجة الأردنية في هذا النص، مثل المصطلحات والتعبيرات المحلية الشائعة في الأردن." 
                            : "Jordanian dialect features were detected in this text, such as local terms and expressions common in Jordan.")
                        : (isRTL 
                            ? "هذا النص مكتوب باللغة العربية الفصحى أو لهجة غير أردنية." 
                            : "This text is written in Standard Arabic or a non-Jordanian dialect.")}
                    </p>
                  </div>
                </div>
                
                {/* Model Info */}
                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>
                      {isRTL ? "تم التحليل باستخدام" : "Analyzed using"} {result.modelSource || "AraBERT"}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
      
      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {isRTL ? "معلومات عن النموذج" : "Model Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium mb-2">
                {isRTL ? "نموذج AraBERT" : "AraBERT Model"}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? "AraBERT هو نموذج لغوي مدرب خصيصًا للغة العربية، مبني على هيكلية BERT. تم تدريبه على مجموعة كبيرة من النصوص العربية لفهم سياق وتركيب اللغة العربية بشكل أفضل." 
                  : "AraBERT is a language model specifically trained for Arabic, built on the BERT architecture. It was trained on a large corpus of Arabic texts to better understand the context and structure of the Arabic language."}
              </p>
              <div className="mt-4">
                <h4 className="font-medium mb-1">
                  {isRTL ? "المميزات" : "Features"}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{isRTL ? "دقة عالية في تحليل المشاعر" : "High accuracy in sentiment analysis"}</li>
                  <li>{isRTL ? "دعم للهجات العربية المختلفة" : "Support for various Arabic dialects"}</li>
                  <li>{isRTL ? "تحسين مخصص للهجة الأردنية" : "Custom optimization for Jordanian dialect"}</li>
                  <li>{isRTL ? "معالجة متقدمة للنصوص العربية" : "Advanced Arabic text processing"}</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">
                {isRTL ? "كشف اللهجة الأردنية" : "Jordanian Dialect Detection"}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? "تم تدريب النموذج على مجموعة كبيرة من النصوص باللهجة الأردنية لتمكينه من التعرف على الخصائص المميزة للهجة الأردنية وتمييزها عن اللهجات العربية الأخرى." 
                  : "The model has been trained on a large corpus of Jordanian dialect texts to enable it to recognize the distinctive features of the Jordanian dialect and distinguish it from other Arabic dialects."}
              </p>
              <div className="mt-4">
                <h4 className="font-medium mb-1">
                  {isRTL ? "مؤشرات اللهجة الأردنية" : "Jordanian Dialect Indicators"}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{isRTL ? "مصطلحات وتعبيرات محلية" : "Local terms and expressions"}</li>
                  <li>{isRTL ? "أنماط لغوية خاصة" : "Specific linguistic patterns"}</li>
                  <li>{isRTL ? "تراكيب جمل مميزة" : "Distinctive sentence structures"}</li>
                  <li>{isRTL ? "كلمات وعبارات شائعة في الأردن" : "Common words and phrases in Jordan"}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentModelPage;