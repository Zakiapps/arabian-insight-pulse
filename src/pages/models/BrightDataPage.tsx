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
  Globe, 
  Loader2, 
  RefreshCw, 
  Save, 
  Info, 
  Shield, 
  Check,
  AlertTriangle
} from "lucide-react";

// Define the form schema
const brightDataFormSchema = z.object({
  token: z.string().min(1, {
    message: "BrightData token is required",
  }),
  platforms: z.array(z.string()).min(1, {
    message: "At least one platform is required",
  }),
  keywords: z.array(z.string()).min(1, {
    message: "At least one keyword is required",
  }),
  limit: z.number().min(1).max(1000),
  is_active: z.boolean().default(true),
});

const BrightDataPage = () => {
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [scrapingActive, setScrapingActive] = useState(false);
  const [savedConfig, setSavedConfig] = useState<any>(null);
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof brightDataFormSchema>>({
    resolver: zodResolver(brightDataFormSchema),
    defaultValues: {
      token: "",
      platforms: ["twitter", "facebook"],
      keywords: [""],
      limit: 100,
      is_active: true,
    },
  });
  
  // Save configuration
  const onSubmit = async (values: z.infer<typeof brightDataFormSchema>) => {
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
      console.error('Error saving BrightData config:', error);
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
      // In a real implementation, this would call the BrightData scraper function
      // For demo purposes, we'll just simulate scraping
      setTimeout(() => {
        toast({
          title: isRTL ? "تم بدء عملية الاستخراج بنجاح" : "Scraping started successfully",
          description: isRTL 
            ? `جاري استخراج البيانات من ${savedConfig.platforms.join(', ')}` 
            : `Scraping data from ${savedConfig.platforms.join(', ')}`,
        });
        
        setScrapingActive(false);
      }, 2000);
    } catch (error) {
      console.error('Error starting BrightData scraper:', error);
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
          <Globe className="h-8 w-8 text-primary" />
          {isRTL ? "خدمة BrightData" : "BrightData Service"}
        </h1>
        <p className="text-muted-foreground">
          {isRTL 
            ? "استخراج البيانات من وسائل التواصل الاجتماعي باستخدام BrightData" 
            : "Scrape data from social media using BrightData"}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {isRTL ? "إعدادات BrightData" : "BrightData Settings"}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? "تكوين استخراج البيانات من وسائل التواصل الاجتماعي" 
                : "Configure social media data scraping"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'رمز الوصول' : 'Access Token'}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isRTL ? "أدخل رمز وصول BrightData" : "Enter BrightData access token"}
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormDescription>
                        {isRTL 
                          ? 'يمكنك الحصول على رمز الوصول من لوحة تحكم BrightData' 
                          : 'You can get your access token from the BrightData dashboard'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="platforms"
                  render={() => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'المنصات' : 'Platforms'}</FormLabel>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {['twitter', 'facebook', 'instagram', 'tiktok', 'youtube'].map((platform) => (
                            <div key={platform} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`platform-${platform}`}
                                checked={form.watch('platforms').includes(platform)}
                                onChange={(e) => {
                                  const currentPlatforms = form.getValues('platforms');
                                  if (e.target.checked) {
                                    form.setValue('platforms', [...currentPlatforms, platform]);
                                  } else {
                                    form.setValue('platforms', currentPlatforms.filter(p => p !== platform));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`platform-${platform}`} className="text-sm">
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
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
                  name="limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الحد الأقصى للمنشورات' : 'Maximum Posts'}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min={1}
                          max={1000}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {isRTL 
                          ? 'الحد الأقصى لعدد المنشورات لاستخراجها في كل عملية' 
                          : 'Maximum number of posts to scrape in each run'}
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
                            ? 'تمكين استخراج البيانات من وسائل التواصل الاجتماعي' 
                            : 'Enable scraping data from social media'}
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
                        <Globe className="mr-2 h-4 w-4" />
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
                    {isRTL ? "المنصات" : "Platforms"}
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {savedConfig.platforms.map((platform: string) => (
                      <Badge key={platform} variant="outline">
                        {platform}
                      </Badge>
                    ))}
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
                    {isRTL ? "الحد الأقصى" : "Limit"}
                  </span>
                  <span>{savedConfig.limit} {isRTL ? "منشور" : "posts"}</span>
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
                {isRTL ? "معلومات عن BrightData" : "About BrightData"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {isRTL 
                  ? "BrightData (المعروف سابقًا باسم Luminati Networks) هي منصة لاستخراج البيانات من الويب توفر حلولًا لجمع البيانات من مواقع الويب ووسائل التواصل الاجتماعي بطريقة موثوقة وفعالة." 
                  : "BrightData (formerly Luminati Networks) is a web data platform that provides solutions for collecting data from websites and social media in a reliable and efficient way."}
              </p>
              
              <div className="space-y-2">
                <h3 className="font-medium">
                  {isRTL ? "المميزات الرئيسية" : "Key Features"}
                </h3>
                <ul className="space-y-1">
                  {[
                    isRTL ? "شبكة واسعة من عناوين IP" : "Extensive IP network",
                    isRTL ? "استخراج البيانات من وسائل التواصل الاجتماعي" : "Social media data scraping",
                    isRTL ? "جمع البيانات المنظمة" : "Structured data collection",
                    isRTL ? "تجاوز قيود الوصول" : "Access restriction bypass",
                    isRTL ? "أدوات تحليل متقدمة" : "Advanced parsing tools"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">
                      {isRTL ? "ملاحظة مهمة" : "Important Note"}
                    </h3>
                    <p className="text-sm text-amber-700">
                      {isRTL 
                        ? "يتطلب BrightData اشتراكًا منفصلاً. تأكد من أن لديك حسابًا نشطًا ورمز وصول صالح قبل استخدام هذه الخدمة." 
                        : "BrightData requires a separate subscription. Make sure you have an active account and valid access token before using this service."}
                    </p>
                    <p className="text-sm text-amber-700 mt-2">
                      {isRTL 
                        ? "تأكد من الامتثال لشروط خدمة المنصات التي تستخرج منها البيانات." 
                        : "Ensure compliance with the terms of service of the platforms you are scraping from."}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <a 
                    href="https://brightdata.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    {isRTL ? "زيارة موقع BrightData" : "Visit BrightData Website"}
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

export default BrightDataPage;