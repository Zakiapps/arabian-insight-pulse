
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings, BarChart3, Globe, Bell, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { analysisSettingsService } from '@/services/analysisSettingsService';

const AnalysisSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    sentiment_threshold: 0.7,
    dialect_detection_enabled: true,
    auto_categorization: true,
    email_notifications: false,
    accuracy_level: 'advanced',
    language_preference: 'ar',
    enable_advanced_analytics: false
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userSettings = await analysisSettingsService.getUserSettings(user.id);
      
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      if (error.message && !error.message.includes('PGRST116')) {
        toast.error('خطأ في تحميل الإعدادات');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await analysisSettingsService.createOrUpdateSettings(user.id, settings);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('خطأ في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyLabel = (level: string) => {
    switch (level) {
      case 'basic': return 'أساسي';
      case 'advanced': return 'متقدم';
      case 'expert': return 'خبير';
      default: return level;
    }
  };

  const getAccuracyDescription = (level: string) => {
    switch (level) {
      case 'basic': return 'تحليل سريع مع دقة جيدة';
      case 'advanced': return 'تحليل متوازن بين السرعة والدقة';
      case 'expert': return 'تحليل عميق عالي الدقة';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">إعدادات التحليل</h1>
        <p className="text-muted-foreground">
          تخصيص إعدادات تحليل المشاعر واللهجات
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sentiment Analysis Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              تحليل المشاعر
            </CardTitle>
            <CardDescription>
              تكوين إعدادات تحليل المشاعر والدقة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="sentiment-threshold">
                عتبة الثقة في تحليل المشاعر: {Math.round(settings.sentiment_threshold * 100)}%
              </Label>
              <Slider
                id="sentiment-threshold"
                min={0.5}
                max={0.95}
                step={0.05}
                value={[settings.sentiment_threshold]}
                onValueChange={(value) => setSettings({ ...settings, sentiment_threshold: value[0] })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                كلما زادت القيمة، زادت دقة التحليل وقلت حساسيته
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="accuracy-level">مستوى الدقة</Label>
              <Select 
                value={settings.accuracy_level} 
                onValueChange={(value) => setSettings({ ...settings, accuracy_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <div className="flex flex-col items-start">
                      <span>{getAccuracyLabel('basic')}</span>
                      <span className="text-xs text-muted-foreground">{getAccuracyDescription('basic')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex flex-col items-start">
                      <span>{getAccuracyLabel('advanced')}</span>
                      <span className="text-xs text-muted-foreground">{getAccuracyDescription('advanced')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="expert">
                    <div className="flex flex-col items-start">
                      <span>{getAccuracyLabel('expert')}</span>
                      <span className="text-xs text-muted-foreground">{getAccuracyDescription('expert')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-categorization">التصنيف التلقائي</Label>
                <p className="text-xs text-muted-foreground">
                  تصنيف تلقائي للنصوص حسب الموضوع
                </p>
              </div>
              <Switch
                id="auto-categorization"
                checked={settings.auto_categorization}
                onCheckedChange={(checked) => setSettings({ ...settings, auto_categorization: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dialect Detection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              كشف اللهجات
            </CardTitle>
            <CardDescription>
              إعدادات كشف اللهجات العربية المختلفة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dialect-detection">تمكين كشف اللهجات</Label>
                <p className="text-xs text-muted-foreground">
                  كشف اللهجات العربية المختلفة في النصوص
                </p>
              </div>
              <Switch
                id="dialect-detection"
                checked={settings.dialect_detection_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, dialect_detection_enabled: checked })}
              />
            </div>

            {settings.dialect_detection_enabled && (
              <>
                <div className="space-y-3">
                  <Label>اللهجات المتاحة</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">الأردنية</Badge>
                    <Badge variant="outline">المصرية</Badge>
                    <Badge variant="outline">الخليجية</Badge>
                    <Badge variant="outline">الشامية</Badge>
                    <Badge variant="outline">المغاربية</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    حالياً: التركيز الأساسي على اللهجة الأردنية مع إمكانية توسيع التغطية
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="advanced-analytics">التحليل المتقدم للهجات</Label>
                    <p className="text-xs text-muted-foreground">
                      تحليل أعمق لخصائص اللهجة والنبرة
                    </p>
                  </div>
                  <Switch
                    id="advanced-analytics"
                    checked={settings.enable_advanced_analytics}
                    onCheckedChange={(checked) => setSettings({ ...settings, enable_advanced_analytics: checked })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Language and Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              الإعدادات العامة
            </CardTitle>
            <CardDescription>
              إعدادات اللغة والواجهة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="language-preference">لغة التحليل المفضلة</Label>
              <Select 
                value={settings.language_preference} 
                onValueChange={(value) => setSettings({ ...settings, language_preference: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">الإنجليزية</SelectItem>
                  <SelectItem value="auto">اكتشاف تلقائي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              التنبيهات
            </CardTitle>
            <CardDescription>
              إعدادات التنبيهات والإشعارات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">تنبيهات البريد الإلكتروني</Label>
                <p className="text-xs text-muted-foreground">
                  إرسال تنبيهات عبر البريد الإلكتروني
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
              />
            </div>

            <div className="space-y-3">
              <Label>أنواع التنبيهات</Label>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>اكتمال تحليل النصوص</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>تجاوز عتبات المشاعر</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>كشف لهجات جديدة</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AnalysisSettings;
