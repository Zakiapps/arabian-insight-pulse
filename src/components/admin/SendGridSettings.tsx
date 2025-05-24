
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Mail,
  Key,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Settings,
  Shield
} from "lucide-react";

const SendGridSettings = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [settings, setSettings] = useState({
    api_key: "",
    enabled: false,
    from_email: "notifications@example.com",
    from_name: "تحليل المشاعر"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('sendgrid_settings')
        .select('*')
        .eq('user_id', profile?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          api_key: data.api_key || "",
          enabled: data.enabled || false,
          from_email: data.from_email || "notifications@example.com",
          from_name: data.from_name || "تحليل المشاعر"
        });
      }
    } catch (error) {
      console.error('Error fetching SendGrid settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('sendgrid_settings')
        .upsert({
          user_id: profile?.id,
          api_key: settings.api_key,
          enabled: settings.enabled,
          from_email: settings.from_email,
          from_name: settings.from_name
        });

      if (error) throw error;
      
      toast.success("تم حفظ إعدادات SendGrid بنجاح");
    } catch (error) {
      console.error('Error saving SendGrid settings:', error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const testEmailConfiguration = async () => {
    setTestLoading(true);
    try {
      // Call edge function to test email
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          to_email: profile?.email || 'test@example.com',
          subject: 'اختبار إعدادات البريد الإلكتروني',
          message: 'هذا اختبار لإعدادات SendGrid'
        }
      });

      if (error) throw error;
      
      toast.success("تم إرسال البريد الاختباري بنجاح");
    } catch (error) {
      console.error('Error testing email:', error);
      toast.error("فشل في إرسال البريد الاختباري");
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">إعدادات SendGrid</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              تكوين SendGrid
            </CardTitle>
            <CardDescription>
              قم بتكوين إعدادات SendGrid لإرسال التنبيهات عبر البريد الإلكتروني
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">مفتاح API الخاص بـ SendGrid</Label>
                <div className="relative">
                  <Key className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="SG.xxxxxxxxxxxxxxxxxx"
                    value={settings.api_key}
                    onChange={(e) => setSettings({...settings, api_key: e.target.value})}
                    className="pr-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  يمكنك الحصول على مفتاح API من لوحة تحكم SendGrid
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-email">البريد الإلكتروني للإرسال</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="from-email"
                    type="email"
                    placeholder="notifications@yourdomain.com"
                    value={settings.from_email}
                    onChange={(e) => setSettings({...settings, from_email: e.target.value})}
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-name">اسم المرسل</Label>
                <Input
                  id="from-name"
                  placeholder="تحليل المشاعر"
                  value={settings.from_name}
                  onChange={(e) => setSettings({...settings, from_name: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="enabled">تفعيل إرسال البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    تمكين إرسال التنبيهات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, enabled: checked})
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button 
                onClick={saveSettings} 
                disabled={loading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </Button>
              
              <Button 
                variant="outline"
                onClick={testEmailConfiguration}
                disabled={testLoading || !settings.api_key}
              >
                <Send className="h-4 w-4 mr-2" />
                {testLoading ? "جاري الاختبار..." : "اختبار"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              حالة التكوين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">حالة SendGrid:</span>
                <Badge variant={settings.enabled ? "default" : "secondary"}>
                  {settings.enabled ? "مُفعّل" : "معطل"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">مفتاح API:</span>
                <Badge variant={settings.api_key ? "default" : "destructive"}>
                  {settings.api_key ? "محدد" : "غير محدد"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">البريد الإلكتروني:</span>
                <Badge variant="outline">
                  {settings.from_email}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">ملاحظات مهمة</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• تأكد من التحقق من البريد الإلكتروني في SendGrid</li>
                <li>• يجب أن يكون المجال مُتحقق منه</li>
                <li>• تحقق من حدود الإرسال في حسابك</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SendGridSettings;
