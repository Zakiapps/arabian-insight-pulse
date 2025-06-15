import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, Save, Newspaper, Info, AlertCircle } from 'lucide-react';

// Define the form schema
const newsApiFormSchema = z.object({
  api_key: z.string().min(1, {
    message: "NewsAPI key is required",
  }),
  sources: z.array(z.string()),
  keywords: z.array(z.string()).min(1, {
    message: "At least one keyword is required",
  }),
  language: z.string().default('ar'),
  is_active: z.boolean().default(true),
});

interface NewsApiConfigProps {
  projectId: string;
}

const NewsApiConfig = ({ projectId }: NewsApiConfigProps) => {
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [scrapingActive, setScrapingActive] = useState(false);
  const [config, setConfig] = useState<any>(null);
  
  // Available news sources
  const newsSources = [
    { id: 'al-jazeera', name: 'Al Jazeera' },
    { id: 'bbc-arabic', name: 'BBC Arabic' },
    { id: 'cnn-arabic', name: 'CNN Arabic' },
    { id: 'rt-arabic', name: 'RT Arabic' },
    { id: 'sky-news-arabia', name: 'Sky News Arabia' },
    { id: 'al-arabiya', name: 'Al Arabiya' },
    { id: 'mada-masr', name: 'Mada Masr' },
    { id: 'al-masry-al-youm', name: 'Al-Masry Al-Youm' },
    { id: 'al-ahram', name: 'Al-Ahram' },
    { id: 'asharq-al-awsat', name: 'Asharq Al-Awsat' }
  ];
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof newsApiFormSchema>>({
    resolver: zodResolver(newsApiFormSchema),
    defaultValues: {
      api_key: "482cb9523dff462ebd58db6177d3af91", // Default API key
      sources: [],
      keywords: [""],
      language: 'ar',
      is_active: true,
    },
  });
  
  // استرجاع التكوين من Supabase عند التحميل أو تغيير projectId
  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line
  }, [projectId]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_configs')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      if (data) {
        setConfig(data);
        form.reset({
          api_key: data.api_key ?? "",
          sources: data.sources ?? [],
          keywords: data.keywords && data.keywords.length ? data.keywords : [""],
          language: data.language || 'ar',
          is_active: data.is_active
        });
      } else {
        // لا يوجد إعداد سابق: إعادة تعيين النموذج للقيم الافتراضية
        form.reset({
          api_key: "482cb9523dff462ebd58db6177d3af91",
          sources: [],
          keywords: [""],
          language: "ar",
          is_active: true
        });
        setConfig(null);
      }
    } catch (error) {
      console.error('Error fetching NewsAPI config:', error);
      toast({
        title: isRTL ? "خطأ في جلب الإعدادات" : "Error fetching settings",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Save configuration
  const onSubmit = async (values: z.infer<typeof newsApiFormSchema>) => {
    setLoading(true);
    try {
      const configData = {
        project_id: projectId,
        api_key: values.api_key,
        sources: values.sources,
        keywords: values.keywords.filter(k => k.trim() !== ''),
        language: values.language,
        is_active: values.is_active,
        updated_at: new Date().toISOString(),
      };

      let savedConfig = null;

      if (config && config.id) {
        // تحديث السجل الحالي
        const { data, error } = await supabase
          .from("news_configs")
          .update(configData)
          .eq("id", config.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        savedConfig = data;
      } else {
        // إنشاء سجل جديد
        const { data, error } = await supabase
          .from("news_configs")
          .insert(configData)
          .select()
          .maybeSingle();
        if (error) throw error;
        savedConfig = data;
      }

      setConfig(savedConfig);
      toast({
        title: isRTL ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving NewsAPI config:', error);
      toast({
        title: isRTL ? "خطأ في حفظ الإعدادات" : "Error saving settings",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Start scraping
  const startScraping = async () => {
    if (!config) {
      toast({
        title: isRTL ? "يجب حفظ الإعدادات أولاً" : "Save settings first",
        variant: "destructive",
      });
      return;
    }
    
    setScrapingActive(true);
    try {
      // ملاحظة: يجب استخدام رابط الوظيفة edge كاملاً وليس متغيرات .env
      const response = await fetch(
        `https://hgsdcoqgvdjuxvcscqzn.supabase.co/functions/v1/scrape-newsapi`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnc2Rjb3FndmRqdXh2Y3NjcXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNTMxNDEsImV4cCI6MjA2NDcyOTE0MX0.pYigfNha5pge2DMj9sMOwQ1RUqwh2Cy_zQws3A5IwRo`,
          },
          body: JSON.stringify({ project_id: projectId, config_id: config.id }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to start scraping");
      }

      toast({
        title: isRTL ? "تم بدء عملية الاستخراج بنجاح" : "Scraping started successfully",
        description: isRTL
          ? `تم استخراج ${result.articles?.length ?? 0} مقالة`
          : `Scraped ${result.articles?.length ?? 0} articles`,
      });

      // تحديث بيانات التكوين (لتجديد last_run_at)، ولو بعد فترة ليتزامن مع backend (اختياري)
      fetchConfig();
    } catch (error) {
      console.error("Error starting NewsAPI scraper:", error);
      toast({
        title: isRTL ? "خطأ في بدء عملية الاستخراج" : "Error starting scraping",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setScrapingActive(false);
    }
  };
  
  // Add keyword field
  const addKeyword = () => {
    const currentKeywords = form.getValues('keywords');
    form.setValue('keywords', [...currentKeywords, '']);
  };
  
  // Remove keyword field
  const removeKeyword = (index: number) => {
    const currentKeywords = form.getValues('keywords');
    if (currentKeywords.length > 1) {
      form.setValue('keywords', currentKeywords.filter((_, i) => i !== index));
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          {isRTL ? 'إعدادات NewsAPI' : 'NewsAPI Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'تكوين استخراج البيانات من مصادر الأخبار باستخدام NewsAPI'
            : 'Configure news data scraping using NewsAPI'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isRTL ? 'مفتاح API' : 'API Key'}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={isRTL ? "أدخل مفتاح NewsAPI" : "Enter NewsAPI key"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {isRTL 
                      ? 'مفتاح API الافتراضي هو 482cb9523dff462ebd58db6177d3af91' 
                      : 'Default API key is 482cb9523dff462ebd58db6177d3af91'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sources"
              render={() => (
                <FormItem>
                  <FormLabel>{isRTL ? 'مصادر الأخبار' : 'News Sources'}</FormLabel>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {newsSources.map((source) => (
                        <div key={source.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`source-${source.id}`}
                            checked={form.watch('sources').includes(source.id)}
                            onChange={(e) => {
                              const currentSources = form.getValues('sources');
                              if (e.target.checked) {
                                form.setValue('sources', [...currentSources, source.id]);
                              } else {
                                form.setValue('sources', currentSources.filter(s => s !== source.id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`source-${source.id}`} className="text-sm">
                            {source.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormDescription>
                      {isRTL 
                        ? 'اختر مصادر الأخبار التي تريد استخراج البيانات منها' 
                        : 'Select news sources to scrape from'}
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="keywords"
              render={() => (
                <FormItem>
                  <FormLabel>{isRTL ? 'الكلمات المفتاحية' : 'Keywords'}</FormLabel>
                  <div className="space-y-2">
                    {form.watch('keywords').map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`keywords.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  placeholder={isRTL ? "أدخل كلمة مفتاحية" : "Enter keyword"}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeKeyword(index)}
                          disabled={form.watch('keywords').length <= 1}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addKeyword}
                    >
                      {isRTL ? '+ إضافة كلمة مفتاحية' : '+ Add Keyword'}
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isRTL ? 'اللغة' : 'Language'}</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                    >
                      <option value="ar">{isRTL ? 'العربية' : 'Arabic'}</option>
                      <option value="en">{isRTL ? 'الإنجليزية' : 'English'}</option>
                      <option value="fr">{isRTL ? 'الفرنسية' : 'French'}</option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    {isRTL 
                      ? 'لغة المقالات التي تريد استخراجها' 
                      : 'Language of articles to scrape'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {isRTL ? 'تفعيل الاستخراج' : 'Enable Scraping'}
                    </FormLabel>
                    <FormDescription>
                      {isRTL 
                        ? 'تمكين استخراج البيانات من مصادر الأخبار' 
                        : 'Enable scraping data from news sources'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={startScraping}
                disabled={scrapingActive || !config}
              >
                {scrapingActive ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {isRTL ? 'جاري الاستخراج...' : 'Scraping...'}
                  </>
                ) : (
                  <>
                    <Newspaper className="mr-2 h-4 w-4" />
                    {isRTL ? 'بدء الاستخراج' : 'Start Scraping'}
                  </>
                )}
              </Button>
              
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        {config && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">
                {isRTL ? 'حالة التكوين' : 'Configuration Status'}
              </h3>
              <Badge variant={config.is_active ? 'default' : 'secondary'}>
                {config.is_active 
                  ? (isRTL ? 'نشط' : 'Active') 
                  : (isRTL ? 'غير نشط' : 'Inactive')}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>
                {isRTL ? 'آخر تحديث:' : 'Last updated:'} {config.updated_at ? new Date(config.updated_at).toLocaleString() : "-"}
              </p>
              {config.last_run_at && (
                <p>
                  {isRTL ? 'آخر تشغيل:' : 'Last run:'} {new Date(config.last_run_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">
                {isRTL ? 'معلومات عن NewsAPI' : 'About NewsAPI'}
              </h3>
              <p className="text-sm">
                {isRTL 
                  ? 'NewsAPI هي خدمة تتيح لك البحث عن المقالات الإخبارية وتصفيتها من آلاف المصادر الإخبارية.' 
                  : 'NewsAPI is a service that lets you search and filter news articles from thousands of sources.'}
              </p>
              <p className="text-sm mt-2">
                {isRTL 
                  ? 'المفتاح الافتراضي هو مفتاح تجريبي مع قيود. للاستخدام الكامل، يرجى الحصول على مفتاح API الخاص بك من NewsAPI.org.' 
                  : 'The default key is a demo key with limitations. For full usage, please get your own API key from NewsAPI.org.'}
              </p>
              <div className="mt-2">
                <a 
                  href="https://newsapi.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  NewsAPI.org →
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsApiConfig;
