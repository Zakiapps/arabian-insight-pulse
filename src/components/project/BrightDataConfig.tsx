import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, Save, Settings, Shield, Globe, Code } from 'lucide-react';

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

interface BrightDataConfigProps {
  projectId: string;
}

const BrightDataConfig = ({ projectId }: BrightDataConfigProps) => {
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [scrapingActive, setScrapingActive] = useState(false);
  const [config, setConfig] = useState<any>(null);
  
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
  
  // Fetch existing configuration
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('brightdata_configs')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setConfig(data);
          form.reset({
            token: data.token,
            platforms: data.rules.platforms || [],
            keywords: data.rules.keywords || [],
            limit: data.rules.limit || 100,
            is_active: data.is_active,
          });
        }
      } catch (error) {
        console.error('Error fetching BrightData config:', error);
        toast({
          title: isRTL ? "خطأ في جلب الإعدادات" : "Error fetching settings",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, [projectId]);
  
  // Save configuration
  const onSubmit = async (values: z.infer<typeof brightDataFormSchema>) => {
    setLoading(true);
    try {
      const configData = {
        project_id: projectId,
        token: values.token,
        rules: {
          platforms: values.platforms,
          keywords: values.keywords,
          limit: values.limit,
        },
        is_active: values.is_active,
      };
      
      if (config) {
        // Update existing config
        const { error } = await supabase
          .from('brightdata_configs')
          .update(configData)
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        // Create new config
        const { error } = await supabase
          .from('brightdata_configs')
          .insert(configData);
        
        if (error) throw error;
      }
      
      toast({
        title: isRTL ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully",
      });
      
      // Refresh config
      const { data } = await supabase
        .from('brightdata_configs')
        .select('*')
        .eq('project_id', projectId)
        .single();
      
      setConfig(data);
    } catch (error) {
      console.error('Error saving BrightData config:', error);
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
      // Call the BrightData scraper function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-brightdata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ project_id: projectId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start scraping');
      }
      
      const result = await response.json();
      
      toast({
        title: isRTL ? "تم بدء عملية الاستخراج بنجاح" : "Scraping started successfully",
        description: isRTL 
          ? `جاري استخراج البيانات من ${config.rules.platforms.join(', ')}` 
          : `Scraping data from ${config.rules.platforms.join(', ')}`,
      });
    } catch (error) {
      console.error('Error starting BrightData scraper:', error);
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
          <Globe className="h-5 w-5" />
          {isRTL ? 'إعدادات BrightData' : 'BrightData Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL 
            ? 'تكوين استخراج البيانات من وسائل التواصل الاجتماعي باستخدام BrightData' 
            : 'Configure social media data scraping using BrightData'}
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
                disabled={scrapingActive || !config}
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
                {isRTL ? 'آخر تحديث:' : 'Last updated:'} {new Date(config.updated_at).toLocaleString()}
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
            <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">
                {isRTL ? 'ملاحظة مهمة حول BrightData' : 'Important Note About BrightData'}
              </h3>
              <p className="text-sm">
                {isRTL 
                  ? 'يتطلب BrightData اشتراكًا منفصلاً. تأكد من أن لديك حسابًا نشطًا ورمز وصول صالح.' 
                  : 'BrightData requires a separate subscription. Make sure you have an active account and valid access token.'}
              </p>
              <p className="text-sm mt-2">
                {isRTL 
                  ? 'تأكد من الامتثال لشروط خدمة المنصات التي تستخرج منها البيانات.' 
                  : 'Ensure compliance with the terms of service of the platforms you are scraping from.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrightDataConfig;