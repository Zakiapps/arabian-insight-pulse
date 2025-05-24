
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, Mail, Brain, Filter } from "lucide-react";

interface AnalysisSettings {
  sentiment_threshold: number;
  dialect_detection_enabled: boolean;
  auto_categorization: boolean;
  email_notifications: boolean;
}

interface SendGridSettings {
  api_key: string;
  from_email: string;
  from_name: string;
  enabled: boolean;
}

export default function AnalysisSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    sentiment_threshold: 0.7,
    dialect_detection_enabled: true,
    auto_categorization: true,
    email_notifications: false,
  });

  const [sendGridSettings, setSendGridSettings] = useState<SendGridSettings>({
    api_key: "",
    from_email: "notifications@example.com",
    from_name: "تحليل المشاعر",
    enabled: false,
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      // Fetch analysis settings
      const { data: analysisData } = await supabase
        .from('analysis_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (analysisData) {
        setAnalysisSettings({
          sentiment_threshold: analysisData.sentiment_threshold || 0.7,
          dialect_detection_enabled: analysisData.dialect_detection_enabled ?? true,
          auto_categorization: analysisData.auto_categorization ?? true,
          email_notifications: analysisData.email_notifications ?? false,
        });
      }

      // Fetch SendGrid settings
      const { data: sendGridData } = await supabase
        .from('sendgrid_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (sendGridData) {
        setSendGridSettings({
          api_key: sendGridData.api_key || "",
          from_email: sendGridData.from_email || "notifications@example.com",
          from_name: sendGridData.from_name || "تحليل المشاعر",
          enabled: sendGridData.enabled ?? false,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveAnalysisSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('analysis_settings')
        .upsert({
          user_id: user.id,
          ...analysisSettings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("تم حفظ إعدادات التحليل بنجاح");
    } catch (error: any) {
      console.error('Error saving analysis settings:', error);
      toast.error("خطأ في حفظ إعدادات التحليل");
    } finally {
      setLoading(false);
    }
  };

  const saveSendGridSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('sendgrid_settings')
        .upsert({
          user_id: user.id,
          ...sendGridSettings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("تم حفظ إعدادات SendGrid بنجاح");
    } catch (error: any) {
      console.error('Error saving SendGrid settings:', error);
      toast.error("خطأ في حفظ إعدادات SendGrid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">إعدادات التحليل</h1>
        <p className="text-muted-foreground">تخصيص إعدادات تحليل المشاعر والتنبيهات</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Analysis Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              إعدادات التحليل
            </CardTitle>
            <CardDescription>
              تخصيص معايير وخيارات تحليل النصوص
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>عتبة المشاعر ({analysisSettings.sentiment_threshold})</Label>
              <Slider
                value={[analysisSettings.sentiment_threshold]}
                onValueChange={(value) => 
                  setAnalysisSettings(prev => ({ ...prev, sentiment_threshold: value[0] }))
                }
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                الحد الأدنى للثقة في تصنيف المشاعر
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>كشف اللهجة الأردنية</Label>
                <p className="text-sm text-muted-foreground">
                  تمكين كشف النصوص المكتوبة باللهجة الأردنية
                </p>
              </div>
              <Switch
                checked={analysisSettings.dialect_detection_enabled}
                onCheckedChange={(checked) =>
                  setAnalysisSettings(prev => ({ ...prev, dialect_detection_enabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>التصنيف التلقائي</Label>
                <p className="text-sm text-muted-foreground">
                  تصنيف النصوص تلقائياً حسب الموضوع
                </p>
              </div>
              <Switch
                checked={analysisSettings.auto_categorization}
                onCheckedChange={(checked) =>
                  setAnalysisSettings(prev => ({ ...prev, auto_categorization: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>التنبيهات عبر البريد الإلكتروني</Label>
                <p className="text-sm text-muted-foreground">
                  إرسال تنبيهات عند تحقق شروط معينة
                </p>
              </div>
              <Switch
                checked={analysisSettings.email_notifications}
                onCheckedChange={(checked) =>
                  setAnalysisSettings(prev => ({ ...prev, email_notifications: checked }))
                }
              />
            </div>

            <Button onClick={saveAnalysisSettings} disabled={loading} className="w-full">
              حفظ إعدادات التحليل
            </Button>
          </CardContent>
        </Card>

        {/* SendGrid Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              إعدادات SendGrid
            </CardTitle>
            <CardDescription>
              تكوين SendGrid لإرسال التنبيهات عبر البريد الإلكتروني
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">مفتاح API</Label>
              <Input
                id="api-key"
                type="password"
                value={sendGridSettings.api_key}
                onChange={(e) =>
                  setSendGridSettings(prev => ({ ...prev, api_key: e.target.value }))
                }
                placeholder="SG.xxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from-email">البريد الإلكتروني للمرسل</Label>
              <Input
                id="from-email"
                type="email"
                value={sendGridSettings.from_email}
                onChange={(e) =>
                  setSendGridSettings(prev => ({ ...prev, from_email: e.target.value }))
                }
                placeholder="notifications@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from-name">اسم المرسل</Label>
              <Input
                id="from-name"
                value={sendGridSettings.from_name}
                onChange={(e) =>
                  setSendGridSettings(prev => ({ ...prev, from_name: e.target.value }))
                }
                placeholder="تحليل المشاعر"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تمكين SendGrid</Label>
                <p className="text-sm text-muted-foreground">
                  تفعيل إرسال التنبيهات عبر SendGrid
                </p>
              </div>
              <Switch
                checked={sendGridSettings.enabled}
                onCheckedChange={(checked) =>
                  setSendGridSettings(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            <Button onClick={saveSendGridSettings} disabled={loading} className="w-full">
              حفظ إعدادات SendGrid
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
