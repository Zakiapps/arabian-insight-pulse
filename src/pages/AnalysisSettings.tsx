
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Settings,
  Brain,
  Globe,
  Tag,
  Eye,
  Save,
  RotateCcw,
  Zap,
  Shield,
  Target
} from "lucide-react";

const AnalysisSettings = () => {
  const { isRTL } = useLanguage();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    accuracy_level: "advanced",
    dialect_detection: true,
    auto_categorization: true,
    sentiment_threshold: 0.7,
    email_notifications: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_settings')
        .select('*')
        .eq('user_id', profile?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          accuracy_level: data.accuracy_level || "advanced",
          dialect_detection: data.dialect_detection_enabled || true,
          auto_categorization: data.auto_categorization || true,
          sentiment_threshold: data.sentiment_threshold || 0.7,
          email_notifications: data.email_notifications || false
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('analysis_settings')
        .upsert({
          user_id: profile?.id,
          dialect_detection_enabled: settings.dialect_detection,
          auto_categorization: settings.auto_categorization,
          sentiment_threshold: settings.sentiment_threshold,
          email_notifications: settings.email_notifications
        });

      if (error) throw error;
      
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      accuracy_level: "advanced",
      dialect_detection: true,
      auto_categorization: true,
      sentiment_threshold: 0.7,
      email_notifications: false
    });
    toast.info("تم إعادة تعيين الإعدادات الافتراضية");
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          إعدادات التحليل المتقدمة
        </h1>
        <p className="text-muted-foreground">
          تخصيص خوارزميات التحليل وخيارات معالجة البيانات
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis Accuracy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                دقة التحليل
              </CardTitle>
              <CardDescription>
                اختر مستوى دقة خوارزميات التحليل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={settings.accuracy_level} 
                onValueChange={(value) => setSettings({...settings, accuracy_level: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مستوى الدقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      عادي - سريع ومناسب للاستخدام العام
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      متقدم - توازن بين السرعة والدقة
                    </div>
                  </SelectItem>
                  <SelectItem value="precise">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      دقيق - أعلى دقة للتحليل المتخصص
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="font-medium text-green-800">عادي</div>
                  <div className="text-green-600">سرعة عالية</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="font-medium text-blue-800">متقدم</div>
                  <div className="text-blue-600">مُوصى به</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="font-medium text-purple-800">دقيق</div>
                  <div className="text-purple-600">دقة قصوى</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Dialect Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                إعدادات اللغة واللهجة
              </CardTitle>
              <CardDescription>
                تخصيص خيارات كشف وتحليل اللهجة الأردنية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="dialect-detection">كشف اللهجة الأردنية</Label>
                  <p className="text-sm text-muted-foreground">
                    تمكين خوارزمية كشف اللهجة الأردنية المتخصصة
                  </p>
                </div>
                <Switch
                  id="dialect-detection"
                  checked={settings.dialect_detection}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, dialect_detection: checked})
                  }
                />
              </div>
              
              {settings.dialect_detection && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">مُفعّل</Badge>
                    <span className="text-sm font-medium">خوارزمية اللهجة الأردنية نشطة</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    سيتم تحليل النصوص للتعرف على اللهجة الأردنية بدقة عالية
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auto Categorization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                التصنيف التلقائي
              </CardTitle>
              <CardDescription>
                إعدادات تصنيف المحتوى والمواضيع تلقائياً
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-categorization">تصنيف تلقائي للمواضيع</Label>
                  <p className="text-sm text-muted-foreground">
                    تصنيف المحتوى إلى فئات (سياسة، اقتصاد، رياضة، إلخ)
                  </p>
                </div>
                <Switch
                  id="auto-categorization"
                  checked={settings.auto_categorization}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, auto_categorization: checked})
                  }
                />
              </div>

              <div className="space-y-4">
                <Label>عتبة دقة المشاعر: {Math.round(settings.sentiment_threshold * 100)}%</Label>
                <Slider
                  value={[settings.sentiment_threshold]}
                  onValueChange={(value) => 
                    setSettings({...settings, sentiment_threshold: value[0]})
                  }
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>أقل دقة (10%)</span>
                  <span>أعلى دقة (100%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                إعدادات التنبيهات
              </CardTitle>
              <CardDescription>
                تخصيص تنبيهات البريد الإلكتروني والنظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">تنبيهات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    استقبال تنبيهات عبر البريد الإلكتروني عند اكتمال التحليل
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, email_notifications: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                معاينة مباشرة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">دقة التحليل:</span>
                  <Badge variant={settings.accuracy_level === 'precise' ? 'default' : 'secondary'}>
                    {settings.accuracy_level === 'normal' ? 'عادي' : 
                     settings.accuracy_level === 'advanced' ? 'متقدم' : 'دقيق'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">كشف اللهجة:</span>
                  <Badge variant={settings.dialect_detection ? 'default' : 'secondary'}>
                    {settings.dialect_detection ? 'مُفعّل' : 'معطل'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">التصنيف التلقائي:</span>
                  <Badge variant={settings.auto_categorization ? 'default' : 'secondary'}>
                    {settings.auto_categorization ? 'مُفعّل' : 'معطل'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">عتبة المشاعر:</span>
                  <Badge variant="outline">
                    {Math.round(settings.sentiment_threshold * 100)}%
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">مثال على النتيجة:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">إيجابي</Badge>
                    <span className="text-xs">المشاعر مكتشفة</span>
                  </div>
                  {settings.dialect_detection && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">أردني</Badge>
                      <span className="text-xs">اللهجة محددة</span>
                    </div>
                  )}
                  {settings.auto_categorization && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">سياسة</Badge>
                      <span className="text-xs">مصنف تلقائياً</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={saveSettings} 
              disabled={loading}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={resetToDefaults}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              إعادة تعيين افتراضي
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSettings;
