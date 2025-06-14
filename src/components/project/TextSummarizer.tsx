import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Copy, Download, FileText, Loader2 } from 'lucide-react';

// Define the form schema
const summarizerFormSchema = z.object({
  title: z.string().optional(),
  text: z.string().min(50, {
    message: "Text must be at least 50 characters",
  }),
});

const TextSummarizer = () => {
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<z.infer<typeof summarizerFormSchema>>({
    resolver: zodResolver(summarizerFormSchema),
    defaultValues: {
      title: "",
      text: "",
    },
  });
  
  // Generate summary
  const onSubmit = async (values: z.infer<typeof summarizerFormSchema>) => {
    setLoading(true);
    setSummary(null);
    
    try {
      // Call the MT5 summarization endpoint
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ text: values.text })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }
      
      const result = await response.json();
      
      if (result.summary) {
        setSummary(result.summary);
        toast({
          title: isRTL ? "تم إنشاء الملخص بنجاح" : "Summary generated successfully",
        });
      } else {
        throw new Error('No summary returned from the API');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: isRTL ? "خطأ في إنشاء الملخص" : "Error generating summary",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Copy summary to clipboard
  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      toast({
        title: isRTL ? "تم نسخ الملخص" : "Summary copied to clipboard",
      });
    }
  };
  
  // Download summary as text file
  const handleDownloadSummary = () => {
    if (summary) {
      const element = document.createElement('a');
      const file = new Blob([summary], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `summary-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast({
        title: isRTL ? "تم تنزيل الملخص" : "Summary downloaded",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {isRTL ? 'ملخص النص' : 'Text Summarization'}
        </CardTitle>
        <CardDescription>
          {isRTL 
            ? 'إنشاء ملخصات للنصوص العربية باستخدام نموذج MT5' 
            : 'Generate summaries for Arabic texts using MT5 model'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isRTL ? 'العنوان (اختياري)' : 'Title (Optional)'}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={isRTL ? "أدخل عنوان النص" : "Enter text title"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isRTL ? 'النص' : 'Text'}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={isRTL ? "أدخل النص العربي للتلخيص" : "Enter Arabic text to summarize"}
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {isRTL 
                      ? 'أدخل نصًا بطول 50 حرفًا على الأقل للحصول على أفضل النتائج' 
                      : 'Enter text of at least 50 characters for best results'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRTL ? 'جاري إنشاء الملخص...' : 'Generating summary...'}
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  {isRTL ? 'إنشاء ملخص' : 'Generate Summary'}
                </>
              )}
            </Button>
          </form>
        </Form>
        
        {summary && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">
                  {isRTL ? 'الملخص' : 'Summary'}
                </h3>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={handleCopySummary}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDownloadSummary}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm whitespace-pre-line">
                {summary}
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              <p>
                {isRTL 
                  ? 'تم إنشاء الملخص باستخدام نموذج MT5 متعدد اللغات' 
                  : 'Summary generated using MT5 multilingual model'}
              </p>
              <p>
                {isRTL 
                  ? 'النموذج: mT5-multilingual-XLSum' 
                  : 'Model: mT5-multilingual-XLSum'}
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">
                {isRTL ? 'عن نموذج MT5' : 'About MT5 Model'}
              </h3>
              <p className="text-sm">
                {isRTL 
                  ? 'MT5 هو نموذج متعدد اللغات مدرب على مجموعة بيانات XLSum، وهو مصمم خصيصًا لتلخيص النصوص بلغات متعددة بما في ذلك العربية.' 
                  : 'MT5 is a multilingual model trained on the XLSum dataset, specifically designed for summarizing texts in multiple languages including Arabic.'}
              </p>
              <p className="text-sm mt-2">
                {isRTL 
                  ? 'يمكن للنموذج تلخيص النصوص الطويلة إلى ملخصات موجزة مع الحفاظ على المعنى الأساسي.' 
                  : 'The model can summarize long texts into concise summaries while preserving the core meaning.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextSummarizer;