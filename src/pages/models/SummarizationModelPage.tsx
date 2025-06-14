import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  FileText, 
  Loader2, 
  Copy, 
  Download, 
  Info,
  Sparkles
} from "lucide-react";

const SummarizationModelPage = () => {
  const { isRTL } = useLanguage();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  
  const summarizeText = async () => {
    if (!text.trim()) {
      toast.error(isRTL ? "يرجى إدخال نص للتلخيص" : "Please enter text to summarize");
      return;
    }
    
    if (text.trim().length < 50) {
      toast.error(isRTL ? "النص قصير جدًا، يجب أن يكون 50 حرفًا على الأقل" : "Text is too short, must be at least 50 characters");
      return;
    }
    
    setIsSummarizing(true);
    setSummary(null);
    setModel(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { text: text.trim() }
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSummary(data.summary);
      setModel(data.model || "mT5_multilingual_XLSum");
      toast.success(isRTL ? "تم تلخيص النص بنجاح" : "Text summarized successfully");
    } catch (error: any) {
      console.error('Error summarizing text:', error);
      toast.error(error.message || (isRTL ? "حدث خطأ أثناء التلخيص" : "An error occurred during summarization"));
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      toast.success(isRTL ? "تم نسخ الملخص" : "Summary copied to clipboard");
    }
  };
  
  const handleDownloadSummary = () => {
    if (summary) {
      const element = document.createElement('a');
      const file = new Blob([summary], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `summary-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(isRTL ? "تم تنزيل الملخص" : "Summary downloaded");
    }
  };
  
  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          {isRTL ? "نموذج تلخيص النصوص" : "Text Summarization Model"}
        </h1>
        <p className="text-muted-foreground">
          {isRTL 
            ? "تلخيص النصوص العربية الطويلة باستخدام نموذج mT5 متعدد اللغات" 
            : "Summarize long Arabic texts using the multilingual mT5 model"}
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
                ? "أدخل النص العربي الذي تريد تلخيصه" 
                : "Enter the Arabic text you want to summarize"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                {isRTL ? "العنوان (اختياري)" : "Title (Optional)"}
              </Label>
              <Input
                id="title"
                placeholder={isRTL 
                  ? "أدخل عنوان النص" 
                  : "Enter text title"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="text">
                {isRTL ? "النص" : "Text"}
              </Label>
              <Textarea
                id="text"
                placeholder={isRTL 
                  ? "أدخل النص العربي هنا..." 
                  : "Enter Arabic text here..."}
                className="min-h-[200px]"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {isRTL 
                  ? "أدخل نصًا بطول 50 حرفًا على الأقل للحصول على أفضل النتائج" 
                  : "Enter text of at least 50 characters for best results"}
              </p>
            </div>
            
            <Button 
              onClick={summarizeText} 
              disabled={isSummarizing || !text.trim() || text.trim().length < 50}
              className="w-full"
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRTL ? "جاري التلخيص..." : "Summarizing..."}
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  {isRTL ? "تلخيص النص" : "Summarize Text"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {isRTL ? "الملخص" : "Summary"}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? "ملخص النص المولد بواسطة النموذج" 
                : "Text summary generated by the model"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!summary && !isSummarizing ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  {isRTL 
                    ? "أدخل نصًا وانقر على 'تلخيص النص' لرؤية الملخص" 
                    : "Enter text and click 'Summarize Text' to see the summary"}
                </p>
              </div>
            ) : isSummarizing ? (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? "جاري تلخيص النص..." : "Summarizing text..."}
                </p>
              </div>
            ) : summary ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">
                    {isRTL ? "الملخص" : "Summary"}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={handleCopySummary}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDownloadSummary}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="whitespace-pre-line">
                    {summary}
                  </p>
                </div>
                
                <div className="text-xs text-muted-foreground text-center pt-4">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>
                      {isRTL ? "تم التلخيص باستخدام" : "Summarized using"} {model}
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
                {isRTL ? "نموذج mT5" : "mT5 Model"}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? "mT5 هو نموذج متعدد اللغات مدرب على مجموعة بيانات XLSum، وهو مصمم خصيصًا لتلخيص النصوص بلغات متعددة بما في ذلك العربية." 
                  : "mT5 is a multilingual model trained on the XLSum dataset, specifically designed for summarizing texts in multiple languages including Arabic."}
              </p>
              <div className="mt-4">
                <h4 className="font-medium mb-1">
                  {isRTL ? "المميزات" : "Features"}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{isRTL ? "دعم للغة العربية وأكثر من 100 لغة أخرى" : "Support for Arabic and over 100 other languages"}</li>
                  <li>{isRTL ? "تلخيص دقيق يحافظ على المعنى الأساسي" : "Accurate summarization that preserves core meaning"}</li>
                  <li>{isRTL ? "قدرة على التعامل مع نصوص طويلة" : "Ability to handle long texts"}</li>
                  <li>{isRTL ? "تدريب على مجموعة بيانات إخبارية متنوعة" : "Trained on diverse news datasets"}</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">
                {isRTL ? "مجموعة بيانات XLSum" : "XLSum Dataset"}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? "XLSum هي مجموعة بيانات متعددة اللغات للتلخيص الإخباري تغطي 44 لغة، بما في ذلك العربية. تم جمعها من مواقع BBC الإخبارية وتتضمن أكثر من 1 مليون زوج من المقالات والملخصات." 
                  : "XLSum is a multilingual dataset for news summarization covering 44 languages, including Arabic. It was collected from BBC news websites and includes over 1 million article-summary pairs."}
              </p>
              <div className="mt-4">
                <h4 className="font-medium mb-1">
                  {isRTL ? "استخدامات التلخيص" : "Summarization Use Cases"}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{isRTL ? "تلخيص المقالات الإخبارية" : "Summarizing news articles"}</li>
                  <li>{isRTL ? "تلخيص المنشورات على وسائل التواصل الاجتماعي" : "Summarizing social media posts"}</li>
                  <li>{isRTL ? "إنشاء ملخصات للتقارير والمستندات" : "Creating summaries for reports and documents"}</li>
                  <li>{isRTL ? "استخلاص المعلومات الرئيسية من النصوص الطويلة" : "Extracting key information from long texts"}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummarizationModelPage;