
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Twitter, Instagram, Youtube, Settings2, Play, Pause, RefreshCw } from "lucide-react";

const apiConfigSchema = z.object({
  platform: z.string(),
  api_key: z.string().min(1, "مفتاح API مطلوب"),
  api_secret: z.string().optional(),
  access_token: z.string().optional(),
  webhook_url: z.string().url("رابط صالح مطلوب").optional(),
  enabled: z.boolean(),
  rate_limit: z.number().min(1).max(1000),
  categories: z.array(z.string()),
});

type ApiConfigData = z.infer<typeof apiConfigSchema>;

interface PlatformConfig {
  id: string;
  platform: string;
  enabled: boolean;
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  webhook_url?: string;
  rate_limit: number;
  categories: string[];
  status: 'active' | 'inactive' | 'error';
  last_sync?: string;
}

const SocialMediaConfig = () => {
  const [configs, setConfigs] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('facebook');

  const form = useForm<ApiConfigData>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      platform: 'facebook',
      api_key: '',
      api_secret: '',
      access_token: '',
      webhook_url: '',
      enabled: false,
      rate_limit: 100,
      categories: [],
    },
  });

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-black' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600' },
  ];

  const categories = [
    'سياسة', 'رياضة', 'اقتصاد', 'تكنولوجيا', 'صحة', 'تعليم', 
    'ترفيه', 'أخبار محلية', 'أخبار عالمية', 'ثقافة', 'فن', 'موضة'
  ];

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      // For now, we'll use mock data since we don't have a social_media_configs table
      const mockConfigs: PlatformConfig[] = [
        {
          id: '1',
          platform: 'facebook',
          enabled: true,
          api_key: 'fb_***************',
          rate_limit: 100,
          categories: ['سياسة', 'اقتصاد'],
          status: 'active',
          last_sync: new Date().toISOString(),
        },
        {
          id: '2',
          platform: 'twitter',
          enabled: false,
          api_key: '',
          rate_limit: 50,
          categories: [],
          status: 'inactive',
        },
        {
          id: '3',
          platform: 'instagram',
          enabled: false,
          api_key: '',
          rate_limit: 75,
          categories: [],
          status: 'inactive',
        },
        {
          id: '4',
          platform: 'youtube',
          enabled: false,
          api_key: '',
          rate_limit: 80,
          categories: [],
          status: 'inactive',
        },
      ];
      setConfigs(mockConfigs);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('خطأ في جلب إعدادات المنصات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSaveConfig = async (data: ApiConfigData) => {
    try {
      // In a real implementation, save to database
      console.log('Saving config:', data);
      toast.success('تم حفظ إعدادات المنصة بنجاح');
      fetchConfigs();
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast.error('خطأ في حفظ إعدادات المنصة');
    }
  };

  const togglePlatform = async (platformId: string, enabled: boolean) => {
    try {
      // Update the platform status
      setConfigs(prev => prev.map(config => 
        config.id === platformId 
          ? { ...config, enabled, status: enabled ? 'active' : 'inactive' }
          : config
      ));
      toast.success(enabled ? 'تم تفعيل المنصة' : 'تم إيقاف المنصة');
    } catch (error: any) {
      console.error('Error toggling platform:', error);
      toast.error('خطأ في تحديث حالة المنصة');
    }
  };

  const testConnection = async (platformId: string) => {
    try {
      toast.info('جاري اختبار الاتصال...');
      // Simulate API test
      setTimeout(() => {
        toast.success('تم الاتصال بنجاح');
        setConfigs(prev => prev.map(config => 
          config.id === platformId 
            ? { ...config, status: 'active', last_sync: new Date().toISOString() }
            : config
        ));
      }, 2000);
    } catch (error: any) {
      console.error('Error testing connection:', error);
      toast.error('فشل في الاتصال');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">نشط</Badge>;
      case 'inactive':
        return <Badge variant="secondary">غير نشط</Badge>;
      case 'error':
        return <Badge variant="destructive">خطأ</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const selectedConfig = configs.find(c => c.platform === selectedPlatform);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold">إعدادات وسائل التواصل الاجتماعي</h2>
        <p className="text-muted-foreground">إدارة APIs ومصادر البيانات من المنصات المختلفة</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {configs.map((config) => {
          const platform = platforms.find(p => p.id === config.platform);
          if (!platform) return null;
          const Icon = platform.icon;
          
          return (
            <Card key={config.id} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{platform.name}</span>
                  </div>
                  {getStatusBadge(config.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">حالة التفعيل</span>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(enabled) => togglePlatform(config.id, enabled)}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  المعدل: {config.rate_limit}/ساعة
                </div>
                <div className="text-xs text-muted-foreground">
                  الفئات: {config.categories.length}
                </div>
                {config.last_sync && (
                  <div className="text-xs text-muted-foreground">
                    آخر مزامنة: {new Date(config.last_sync).toLocaleString('ar-SA')}
                  </div>
                )}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPlatform(config.platform)}
                  >
                    <Settings2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testConnection(config.id)}
                    disabled={!config.enabled}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              إعدادات {platforms.find(p => p.id === selectedPlatform)?.name}
            </CardTitle>
            <CardDescription>
              تكوين API ومعايير جمع البيانات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveConfig)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="api_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مفتاح API</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            placeholder="أدخل مفتاح API"
                            value={selectedConfig.api_key || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="api_secret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سر API (اختياري)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            placeholder="أدخل سر API"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="access_token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رمز الوصول (اختياري)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            placeholder="أدخل رمز الوصول"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rate_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حد المعدل (طلبات/ساعة)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            placeholder="100"
                            value={selectedConfig.rate_limit}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="webhook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط Webhook (اختياري)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="https://your-app.com/webhook"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label className="text-base font-medium">الفئات المُفعلة</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id={category}
                          defaultChecked={selectedConfig.categories.includes(category)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={category} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    حفظ الإعدادات
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => testConnection(selectedConfig.id)}
                  >
                    اختبار الاتصال
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialMediaConfig;
