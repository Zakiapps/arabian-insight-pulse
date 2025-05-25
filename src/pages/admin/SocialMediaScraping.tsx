import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Settings, Play, Pause } from 'lucide-react';

interface ScrapingConfig {
  id: string;
  platform: string;
  search_terms: string[];
  hashtags?: string[];
  location_filters?: string[];
  is_active: boolean;
  created_at: string;
  last_scrape_at?: string;
}

const SocialMediaScraping = () => {
  const [configs, setConfigs] = useState<ScrapingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [newConfig, setNewConfig] = useState({
    platform: 'twitter',
    search_terms: '',
    hashtags: '',
    location_filters: '',
    is_active: true
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      
      // Fetch scraping configs directly without joins to avoid RLS issues
      const { data, error } = await supabase
        .from('scraping_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConfigs(data || []);
    } catch (error: any) {
      console.error('Error fetching configs:', error);
      toast.error('خطأ في جلب إعدادات الاستخراج');
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async () => {
    if (!newConfig.search_terms.trim()) {
      toast.error('يرجى إدخال كلمات البحث');
      return;
    }

    try {
      const { error } = await supabase
        .from('scraping_configs')
        .insert({
          platform: newConfig.platform,
          search_terms: newConfig.search_terms.split(',').map(term => term.trim()),
          hashtags: newConfig.hashtags ? newConfig.hashtags.split(',').map(tag => tag.trim()) : [],
          location_filters: newConfig.location_filters ? newConfig.location_filters.split(',').map(loc => loc.trim()) : [],
          is_active: newConfig.is_active
        });

      if (error) throw error;

      toast.success('تم إنشاء إعداد الاستخراج بنجاح');
      setNewConfig({
        platform: 'twitter',
        search_terms: '',
        hashtags: '',
        location_filters: '',
        is_active: true
      });
      fetchConfigs();
    } catch (error: any) {
      console.error('Error creating config:', error);
      toast.error('خطأ في إنشاء إعداد الاستخراج');
    }
  };

  const toggleConfig = async (configId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('scraping_configs')
        .update({ is_active: isActive })
        .eq('id', configId);

      if (error) throw error;

      toast.success(isActive ? 'تم تفعيل الاستخراج' : 'تم إيقاف الاستخراج');
      fetchConfigs();
    } catch (error: any) {
      console.error('Error toggling config:', error);
      toast.error('خطأ في تحديث حالة الاستخراج');
    }
  };

  const deleteConfig = async (configId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعداد؟')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('scraping_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      toast.success('تم حذف الإعداد بنجاح');
      fetchConfigs();
    } catch (error: any) {
      console.error('Error deleting config:', error);
      toast.error('خطأ في حذف الإعداد');
    }
  };

  const startScraping = async (configId: string) => {
    try {
      const { error } = await supabase.functions.invoke('scrape-social-media', {
        body: { config_id: configId }
      });

      if (error) throw error;

      toast.success('تم بدء عملية الاستخراج');
    } catch (error: any) {
      console.error('Error starting scraping:', error);
      toast.error('خطأ في بدء الاستخراج');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">استخراج وسائل التواصل الاجتماعي</h1>
        <p className="text-muted-foreground">إدارة إعدادات استخراج البيانات من المنصات الاجتماعية</p>
      </div>

      {/* Create New Config */}
      <Card>
        <CardHeader>
          <CardTitle>إنشاء إعداد جديد</CardTitle>
          <CardDescription>أضف إعداد جديد لاستخراج البيانات من المنصات الاجتماعية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform">المنصة</Label>
              <Select value={newConfig.platform} onValueChange={(value) => setNewConfig(prev => ({ ...prev, platform: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">تويتر</SelectItem>
                  <SelectItem value="facebook">فيسبوك</SelectItem>
                  <SelectItem value="instagram">إنستغرام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search_terms">كلمات البحث (مفصولة بفواصل)</Label>
              <Input
                id="search_terms"
                value={newConfig.search_terms}
                onChange={(e) => setNewConfig(prev => ({ ...prev, search_terms: e.target.value }))}
                placeholder="الأردن، عمان، السياسة"
              />
            </div>

            <div>
              <Label htmlFor="hashtags">الهاشتاغات (مفصولة بفواصل)</Label>
              <Input
                id="hashtags"
                value={newConfig.hashtags}
                onChange={(e) => setNewConfig(prev => ({ ...prev, hashtags: e.target.value }))}
                placeholder="#الأردن، #عمان، #السياسة"
              />
            </div>

            <div>
              <Label htmlFor="location_filters">فلاتر الموقع (مفصولة بفواصل)</Label>
              <Input
                id="location_filters"
                value={newConfig.location_filters}
                onChange={(e) => setNewConfig(prev => ({ ...prev, location_filters: e.target.value }))}
                placeholder="عمان، الأردن، إربد"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={newConfig.is_active}
              onCheckedChange={(checked) => setNewConfig(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">تفعيل الاستخراج</Label>
          </div>

          <Button onClick={createConfig} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            إنشاء إعداد الاستخراج
          </Button>
        </CardContent>
      </Card>

      {/* Existing Configs */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الاستخراج الحالية</CardTitle>
          <CardDescription>إدارة إعدادات الاستخراج الموجودة</CardDescription>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد إعدادات استخراج
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium capitalize">{config.platform}</h3>
                      <Badge variant={config.is_active ? "default" : "secondary"}>
                        {config.is_active ? "نشط" : "متوقف"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startScraping(config.id)}
                        disabled={!config.is_active}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleConfig(config.id, !config.is_active)}
                      >
                        {config.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteConfig(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">كلمات البحث:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {config.search_terms.map((term, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {config.hashtags && config.hashtags.length > 0 && (
                      <div>
                        <span className="font-medium">الهاشتاغات:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {config.hashtags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {config.location_filters && config.location_filters.length > 0 && (
                      <div>
                        <span className="font-medium">المواقع:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {config.location_filters.map((location, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-muted-foreground">
                    تم الإنشاء: {new Date(config.created_at).toLocaleString('ar-SA')}
                    {config.last_scrape_at && (
                      <span className="ml-4">
                        آخر استخراج: {new Date(config.last_scrape_at).toLocaleString('ar-SA')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaScraping;
