
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { socialMediaService, type ScrapingConfig } from "@/services/socialMediaService";
import { Play, Pause, Settings, Clock, TrendingUp, AlertTriangle, Activity, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SocialMediaScraping = () => {
  const [configs, setConfigs] = useState<ScrapingConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrapingActive, setScrapingActive] = useState(false);
  const [autoScraping, setAutoScraping] = useState(false);
  const [scrapingInterval, setScrapingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ScrapingConfig | null>(null);
  const [newConfig, setNewConfig] = useState({
    platform: 'twitter',
    search_terms: '',
    hashtags: '',
    location_filters: '',
    is_active: true
  });
  const [stats, setStats] = useState({
    total: 0,
    byPlatform: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    bySentiment: {} as Record<string, number>,
    jordanianDialect: 0,
    viral: 0
  });

  useEffect(() => {
    fetchConfigs();
    fetchStats();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await socialMediaService.getScrapingConfigs();
      setConfigs(data);
    } catch (error: any) {
      console.error('Error fetching configs:', error);
      toast.error('خطأ في جلب إعدادات الاستخراج');
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await socialMediaService.getPostStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const startScraping = async () => {
    setScrapingActive(true);
    try {
      const result = await socialMediaService.triggerScraping();
      toast.success(`تم معالجة ${result.processed} منشور بنجاح`);
      fetchStats();
    } catch (error: any) {
      console.error('Error starting scraping:', error);
      toast.error('خطأ في بدء عملية الاستخراج');
    } finally {
      setScrapingActive(false);
    }
  };

  const toggleAutoScraping = () => {
    if (autoScraping) {
      if (scrapingInterval) {
        clearInterval(scrapingInterval);
        setScrapingInterval(null);
      }
      setAutoScraping(false);
      toast.info('تم إيقاف الاستخراج التلقائي');
    } else {
      const interval = setInterval(() => {
        startScraping();
      }, 30 * 60 * 1000); // 30 minutes
      setScrapingInterval(interval);
      setAutoScraping(true);
      toast.success('تم تفعيل الاستخراج التلقائي (كل 30 دقيقة)');
    }
  };

  const saveConfig = async () => {
    try {
      const configData = {
        platform: newConfig.platform,
        search_terms: newConfig.search_terms.split(',').map(term => term.trim()),
        hashtags: newConfig.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
        location_filters: newConfig.location_filters.split(',').map(loc => loc.trim()).filter(loc => loc),
        is_active: newConfig.is_active
      };

      if (editingConfig) {
        await socialMediaService.updateScrapingConfig(editingConfig.id, configData);
        toast.success('تم تحديث الإعدادات بنجاح');
      } else {
        await socialMediaService.createScrapingConfig(configData);
        toast.success('تم إضافة الإعدادات بنجاح');
      }

      setIsConfigDialogOpen(false);
      setEditingConfig(null);
      setNewConfig({
        platform: 'twitter',
        search_terms: '',
        hashtags: '',
        location_filters: '',
        is_active: true
      });
      fetchConfigs();
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast.error('خطأ في حفظ الإعدادات');
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      await socialMediaService.deleteScrapingConfig(id);
      toast.success('تم حذف الإعدادات بنجاح');
      fetchConfigs();
    } catch (error: any) {
      console.error('Error deleting config:', error);
      toast.error('خطأ في حذف الإعدادات');
    }
  };

  const toggleConfigStatus = async (config: ScrapingConfig) => {
    try {
      await socialMediaService.updateScrapingConfig(config.id, { 
        is_active: !config.is_active 
      });
      toast.success('تم تحديث حالة الإعدادات');
      fetchConfigs();
    } catch (error: any) {
      console.error('Error updating config status:', error);
      toast.error('خطأ في تحديث حالة الإعدادات');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold">إعدادات استخراج وسائل التواصل</h2>
        <p className="text-muted-foreground">إدارة استخراج المحتوى وتحليل المشاعر من المنصات الاجتماعية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنشورات</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تويتر</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byPlatform.twitter || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فيسبوك</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byPlatform.facebook || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">لهجة أردنية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.jordanianDialect}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رائج</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.viral}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيجابي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.bySentiment.positive || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="control" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="control">لوحة التحكم</TabsTrigger>
          <TabsTrigger value="configs">إعدادات الاستخراج</TabsTrigger>
          <TabsTrigger value="monitoring">المراقبة</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التحكم في الاستخراج</CardTitle>
              <CardDescription>إدارة عمليات استخراج المحتوى</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    checked={autoScraping}
                    onCheckedChange={toggleAutoScraping}
                  />
                  <Label>الاستخراج التلقائي (كل 30 دقيقة)</Label>
                </div>
                {autoScraping && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    نشط
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={startScraping} 
                  disabled={scrapingActive}
                  className="flex items-center gap-2"
                >
                  {scrapingActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {scrapingActive ? 'جاري الاستخراج...' : 'بدء الاستخراج'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>إعدادات الاستخراج</CardTitle>
                  <CardDescription>إدارة مصادر البيانات والكلمات المفتاحية</CardDescription>
                </div>
                <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      إضافة إعدادات
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingConfig ? 'تعديل' : 'إضافة'} إعدادات الاستخراج</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="platform">المنصة</Label>
                        <Select value={newConfig.platform} onValueChange={(value) => setNewConfig({ ...newConfig, platform: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="twitter">تويتر</SelectItem>
                            <SelectItem value="facebook">فيسبوك</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="search_terms">المصطلحات البحثية (مفصولة بفواصل)</Label>
                        <Input
                          id="search_terms"
                          value={newConfig.search_terms}
                          onChange={(e) => setNewConfig({ ...newConfig, search_terms: e.target.value })}
                          placeholder="الأردن, اقتصاد الأردن, السياسة الأردنية"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hashtags">الهاشتاغات (مفصولة بفواصل)</Label>
                        <Input
                          id="hashtags"
                          value={newConfig.hashtags}
                          onChange={(e) => setNewConfig({ ...newConfig, hashtags: e.target.value })}
                          placeholder="#الأردن, #اقتصاد_الأردن"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location_filters">فلاتر الموقع (مفصولة بفواصل)</Label>
                        <Input
                          id="location_filters"
                          value={newConfig.location_filters}
                          onChange={(e) => setNewConfig({ ...newConfig, location_filters: e.target.value })}
                          placeholder="عمان, الأردن"
                        />
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          checked={newConfig.is_active}
                          onCheckedChange={(checked) => setNewConfig({ ...newConfig, is_active: checked })}
                        />
                        <Label>نشط</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={saveConfig}>
                        حفظ
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنصة</TableHead>
                    <TableHead>المصطلحات البحثية</TableHead>
                    <TableHead>الهاشتاغات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>آخر استخراج</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Badge variant={config.platform === 'twitter' ? 'default' : 'secondary'}>
                          {config.platform === 'twitter' ? 'تويتر' : 'فيسبوك'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {config.search_terms.join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {config.hashtags?.join(', ') || 'لا يوجد'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={config.is_active}
                            onCheckedChange={() => toggleConfigStatus(config)}
                          />
                          <span className="text-sm">
                            {config.is_active ? 'نشط' : 'معطل'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {config.last_scrape_at 
                          ? new Date(config.last_scrape_at).toLocaleDateString('ar-SA')
                          : 'لم يتم بعد'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingConfig(config);
                              setNewConfig({
                                platform: config.platform,
                                search_terms: config.search_terms.join(', '),
                                hashtags: config.hashtags?.join(', ') || '',
                                location_filters: config.location_filters?.join(', ') || '',
                                is_active: config.is_active
                              });
                              setIsConfigDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteConfig(config.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مراقبة المنشورات</CardTitle>
              <CardDescription>عرض المنشورات المستخرجة وحذفها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>انتقل إلى صفحة المراقبة لعرض وإدارة المنشورات</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/admin'}>
                  عرض المنشورات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMediaScraping;
