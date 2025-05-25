
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Play, 
  Pause, 
  Plus, 
  Settings, 
  Trash2, 
  Activity, 
  Database,
  Download,
  RefreshCw
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { FluidContainer, ModernLayout, ModernGrid } from '@/components/layouts/ModernLayout';
import { ModernButton } from '@/components/ui/modern-button';

interface ScrapingConfig {
  id: string;
  platform: string;
  search_terms: string[];
  hashtags?: string[];
  location_filters?: string[];
  is_active: boolean;
  last_scrape_at?: string;
  created_at: string;
}

const SocialMediaScraping = () => {
  const [configs, setConfigs] = useState<ScrapingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newConfig, setNewConfig] = useState({
    platform: 'twitter',
    search_terms: '',
    hashtags: '',
    location_filters: '',
    is_active: true
  });

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scraping_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scraping configs:', error);
        throw error;
      }

      setConfigs(data || []);
    } catch (error: any) {
      console.error('Error fetching configs:', error);
      toast.error('خطأ في جلب إعدادات الاستخراج: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async () => {
    try {
      if (!newConfig.search_terms.trim()) {
        toast.error('يرجى إدخال كلمات البحث');
        return;
      }

      const { error } = await supabase
        .from('scraping_configs')
        .insert({
          platform: newConfig.platform,
          search_terms: newConfig.search_terms.split(',').map(term => term.trim()),
          hashtags: newConfig.hashtags ? newConfig.hashtags.split(',').map(tag => tag.trim()) : [],
          location_filters: newConfig.location_filters ? newConfig.location_filters.split(',').map(loc => loc.trim()) : [],
          is_active: newConfig.is_active
        });

      if (error) {
        console.error('Error creating config:', error);
        throw error;
      }

      toast.success('تم إنشاء إعداد الاستخراج بنجاح');
      setIsCreateDialogOpen(false);
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
      toast.error('خطأ في إنشاء إعداد الاستخراج: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  const toggleConfig = async (configId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('scraping_configs')
        .update({ is_active: !isActive })
        .eq('id', configId);

      if (error) {
        console.error('Error toggling config:', error);
        throw error;
      }

      toast.success(isActive ? 'تم إيقاف الاستخراج' : 'تم تفعيل الاستخراج');
      fetchConfigs();
    } catch (error: any) {
      console.error('Error toggling config:', error);
      toast.error('خطأ في تغيير حالة الاستخراج');
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

      if (error) {
        console.error('Error deleting config:', error);
        throw error;
      }

      toast.success('تم حذف الإعداد بنجاح');
      fetchConfigs();
    } catch (error: any) {
      console.error('Error deleting config:', error);
      toast.error('خطأ في حذف الإعداد');
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  if (loading) {
    return (
      <FluidContainer>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </FluidContainer>
    );
  }

  return (
    <FluidContainer>
      <ModernLayout spacing="lg">
        {/* Header */}
        <div className="flex items-center justify-between" dir="rtl">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              استخراج وسائل التواصل الاجتماعي
            </h1>
            <p className="text-muted-foreground mt-2">إدارة وتكوين استخراج المحتوى من منصات التواصل الاجتماعي</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <ModernButton className="shadow-lg">
                <Plus className="h-5 w-5 ml-2" />
                إضافة إعداد جديد
              </ModernButton>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Plus className="h-5 w-5" />
                  إعداد استخراج جديد
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>المنصة</Label>
                  <Select value={newConfig.platform} onValueChange={(value) => setNewConfig(prev => ({ ...prev, platform: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">تويتر</SelectItem>
                      <SelectItem value="facebook">فيسبوك</SelectItem>
                      <SelectItem value="instagram">إنستغرام</SelectItem>
                      <SelectItem value="youtube">يوتيوب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>كلمات البحث (مفصولة بفواصل)</Label>
                  <Input
                    value={newConfig.search_terms}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, search_terms: e.target.value }))}
                    placeholder="الأردن، عمان، السياسة"
                  />
                </div>
                <div>
                  <Label>الهاشتاجز (اختيارية)</Label>
                  <Input
                    value={newConfig.hashtags}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, hashtags: e.target.value }))}
                    placeholder="#الأردن، #عمان، #السياسة"
                  />
                </div>
                <div>
                  <Label>فلاتر المواقع (اختيارية)</Label>
                  <Input
                    value={newConfig.location_filters}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, location_filters: e.target.value }))}
                    placeholder="عمان، الأردن، الزرقاء"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newConfig.is_active}
                    onCheckedChange={(checked) => setNewConfig(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>تفعيل الاستخراج</Label>
                </div>
                <div className="flex gap-3 pt-4">
                  <ModernButton onClick={createConfig} className="flex-1">
                    إنشاء الإعداد
                  </ModernButton>
                  <ModernButton variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                    إلغاء
                  </ModernButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <ModernGrid cols={4}>
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">إجمالي الإعدادات</p>
                  <p className="text-3xl font-bold text-blue-900">{configs.length}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">الإعدادات النشطة</p>
                  <p className="text-3xl font-bold text-green-900">{configs.filter(c => c.is_active).length}</p>
                </div>
                <Play className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">المنصات المدعومة</p>
                  <p className="text-3xl font-bold text-purple-900">4</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">آخر استخراج</p>
                  <p className="text-sm font-bold text-orange-900">منذ ساعة</p>
                </div>
                <RefreshCw className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </ModernGrid>

        {/* Configs Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-right" dir="rtl">
              إعدادات الاستخراج ({configs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-right" dir="rtl">
                    <TableHead className="text-right">المنصة</TableHead>
                    <TableHead className="text-right">كلمات البحث</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">آخر استخراج</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline">
                          {config.platform === 'twitter' ? 'تويتر' : 
                           config.platform === 'facebook' ? 'فيسبوك' :
                           config.platform === 'instagram' ? 'إنستغرام' :
                           config.platform === 'youtube' ? 'يوتيوب' : config.platform}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {config.search_terms.slice(0, 3).join(', ')}
                          {config.search_terms.length > 3 && '...'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${config.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm">
                            {config.is_active ? 'نشط' : 'متوقف'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {config.last_scrape_at ? 
                            new Date(config.last_scrape_at).toLocaleString('ar-SA') : 
                            'لم يتم بعد'
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleConfig(config.id, config.is_active)}
                          >
                            {config.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteConfig(config.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </ModernLayout>
    </FluidContainer>
  );
};

export default SocialMediaScraping;
