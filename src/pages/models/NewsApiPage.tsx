import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Newspaper, 
  Loader2, 
  RefreshCw, 
  Save, 
  Info, 
  Check,
  ExternalLink
} from "lucide-react";

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

const NewsApiPage = () => {
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [scrapingActive, setScrapingActive] = useState(false);
  const [savedConfig, setSavedConfig] = useState<any>(null);
  
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
  
  // Save configuration
  const onSubmit = async (values: z.infer<typeof newsApiFormSchema>) => {
    setLoading(true);
    try {
      // In a real implementation, this would save to the database
      // For demo purposes, we'll just simulate saving
      setTimeout(() => {
        setSavedConfig({
          ...values,
          last_updated: new Date().toISOString()
        });
        
        toast({
          title: isRTL ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully",
        });
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving NewsAPI config:', error);
      toast({
        title: isRTL ? "خطأ في حفظ الإعدادات" : "Error saving settings",
        description: (error as Error).message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  // Start scraping
  const startScraping = async () => {
    if (!savedConfig) {
      toast({
        title: isRTL ? "يجب حفظ الإعدادات أولاً" : "Save settings first",
        variant: "destructive",
      });
      return;
    }
    
    setScrapingActive(true);
    try {
      // In a real implementation, this would call the NewsAPI scraper function
      // For demo purposes, we'll just simulate scraping
      setTimeout(() => {
        toast({
          title: isRTL ? "تم بدء عملية الاستخراج بنجاح" : "Scraping started successfully",
          description: isRTL 
            ? `تم استخراج 15 مقالة` 
            : `Scraped 15 articles`,
        });
        
        setScrapingActive(false);
      }, 2000);
    } catch (error) {
      console.error('Error starting NewsAPI scraper:', error);
      toast({
        title: isRTL ? "خطأ في بدء عملية الاستخراج" : "Error starting scraping",
        description: (error as Error).message,
        variant: "destructive",
      });
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
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Newspaper className="h-8 w-8 text-primary" />
          {isRTL ? "خدمة NewsAPI" : "NewsAPI Service"}
        </h1>
        <p className="text-muted-foreground">
          {isRTL 
            ? "استخراج المقالات الإخبارية من مصادر متعددة باستخدام NewsAPI" 
            : "Extract news articles from multiple sources using NewsAPI"}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {isRTL ? "إعدادات NewsAPI" : "NewsAPI Settings"}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? "تكوين استخراج البيانات من مصادر الأخبار" 
                : "Configure news data extraction"}
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
                    disabled={scrapingActive || !savedConfig}
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
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          {savedConfig && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isRTL ? "حالة التكوين" : "Configuration Status"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {isRTL ? "الحالة" : "Status"}
                  </span>
                  <Badge variant={savedConfig.is_active ? 'default' : 'secondary'}>
                    {savedConfig.is_active 
                      ? (isRTL ? 'نشط' : 'Active') 
                      : (isRTL ? 'غير نشط' : 'Inactive')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {isRTL ? "المصادر" : "Sources"}
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {savedConfig.sources.length > 0 ? (
                      savedConfig.sources.map((source: string) => (
                        <Badge key={source} variant="outline">
                          {newsSources.find(s => s.id === source)?.name || source}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {isRTL ? "لم يتم تحديد مصادر" : "No sources selected"}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {isRTL ? "الكلمات المفتاحية" : "Keywords"}
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {savedConfig.keywords.filter((k: string) => k.trim()).map((keyword: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {isRTL ? "اللغة" : "Language"}
                  </span>
                  <Badge variant="outline">
                    {savedConfig.language === 'ar' 
                      ? (isRTL ? 'العربية' : 'Arabic') 
                      : savedConfig.language === 'en' 
                        ? (isRTL ? 'الإنجليزية' : 'English') 
                        : savedConfig.language}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {isRTL ? "آخر تحديث" : "Last Updated"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(savedConfig.last_updated).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {isRTL ? "معلومات عن NewsAPI" : "About NewsAPI"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {isRTL 
                  ? "NewsAPI هي خدمة تتيح لك البحث عن المقالات الإخبارية وتصفيتها من آلاف المصادر الإخبارية. يمكنك الحصول على مقالات من مصادر إخبارية كبرى ومدونات ومجلات ومواقع أخرى." 
                  : "NewsAPI is a service that lets you search and filter news articles from thousands of sources. You can get articles from major news sources, blogs, magazines, and other sites."}
              </p>
              
              <div className="space-y-2">
                <h3 className="font-medium">
                  {isRTL ? "المميزات الرئيسية" : "Key Features"}
                </h3>
                <ul className="space-y-1">
                  {[
                    isRTL ? "الوصول إلى آلاف المصادر الإخبارية" : "Access to thousands of news sources",
                    isRTL ? "البحث عن المقالات بالكلمات المفتاحية" : "Search articles by keywords",
                    isRTL ? "تصفية حسب اللغة والمصدر والتاريخ" : "Filter by language, source, and date",
                    isRTL ? "واجهة برمجة تطبيقات سهلة الاستخدام" : "Easy-to-use API",
                    isRTL ? "تحديثات في الوقت الفعلي" : "Real-time updates"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">
                      {isRTL ? "ملاحظة" : "Note"}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {isRTL 
                        ? "المفتاح الافتراضي هو مفتاح تجريبي مع قيود. للاستخدام الكامل، يرجى الحصول على مفتاح API الخاص بك من NewsAPI.org." 
                        : "The default key is a demo key with limitations. For full usage, please get your own API key from NewsAPI.org."}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <a 
                    href="https://newsapi.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {isRTL ? "زيارة موقع NewsAPI" : "Visit NewsAPI Website"}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewsApiPage;