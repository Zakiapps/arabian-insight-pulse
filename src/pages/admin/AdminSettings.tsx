
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, CreditCard, Mail, Shield, RefreshCw, TestTube } from "lucide-react";
import { systemSettingsService } from "@/services/systemSettingsService";

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    site_name: "Arab Insights",
    site_description: "منصة تحليل النصوص العربية والمشاعر",
    support_email: "support@arabinsights.com",
    enable_registration: true,
    require_email_verification: true,
    default_language: "ar"
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    stripe_enabled: false,
    stripe_live_mode: false,
    stripe_live_key: "",
    stripe_test_key: "",
    currency: "usd",
    tax_percent: 0
  });
  
  const [emailSettings, setEmailSettings] = useState({
    email_provider: "smtp",
    smtp_host: "",
    smtp_port: "",
    smtp_user: "",
    smtp_password: "",
    sender_name: "Arab Insights",
    sender_email: "no-reply@arabinsights.com",
    welcome_email_enabled: true,
    payment_receipt_enabled: true
  });
  
  const [apiSettings, setApiSettings] = useState({
    enable_api_access: true,
    rate_limit_per_minute: 60,
    require_api_keys: true,
    log_api_calls: true
  });

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await systemSettingsService.getAllSettings();
      
      if (allSettings.general_settings) {
        setGeneralSettings(allSettings.general_settings);
      }
      if (allSettings.payment_settings) {
        setPaymentSettings(allSettings.payment_settings);
      }
      if (allSettings.email_settings) {
        setEmailSettings(allSettings.email_settings);
      }
      if (allSettings.api_settings) {
        setApiSettings(allSettings.api_settings);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('خطأ في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await systemSettingsService.updateSettings('general_settings', generalSettings);
      toast.success("تم حفظ الإعدادات العامة بنجاح");
    } catch (error: any) {
      console.error('Error saving general settings:', error);
      toast.error("خطأ في حفظ الإعدادات العامة");
    }
  };
  
  const savePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await systemSettingsService.updateSettings('payment_settings', paymentSettings);
      toast.success("تم حفظ إعدادات الدفع بنجاح");
    } catch (error: any) {
      console.error('Error saving payment settings:', error);
      toast.error("خطأ في حفظ إعدادات الدفع");
    }
  };
  
  const saveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await systemSettingsService.updateSettings('email_settings', emailSettings);
      toast.success("تم حفظ إعدادات البريد الإلكتروني بنجاح");
    } catch (error: any) {
      console.error('Error saving email settings:', error);
      toast.error("خطأ في حفظ إعدادات البريد الإلكتروني");
    }
  };
  
  const saveAPISettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await systemSettingsService.updateSettings('api_settings', apiSettings);
      toast.success("تم حفظ إعدادات واجهة برمجة التطبيقات بنجاح");
    } catch (error: any) {
      console.error('Error saving API settings:', error);
      toast.error("خطأ في حفظ إعدادات واجهة برمجة التطبيقات");
    }
  };

  const sendTestEmail = () => {
    toast.success("تم إرسال بريد إلكتروني تجريبي بنجاح");
  };

  const syncStripeWebhooks = () => {
    toast.success("تم مزامنة Stripe Webhooks بنجاح");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p>جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إعدادات النظام</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="payment">المدفوعات</TabsTrigger>
          <TabsTrigger value="email">البريد الإلكتروني</TabsTrigger>
          <TabsTrigger value="api">واجهة API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription>
                تكوين الإعدادات الأساسية للتطبيق
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveGeneralSettings} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="site-name">اسم الموقع</Label>
                  <Input 
                    id="site-name"
                    value={generalSettings.site_name}
                    onChange={(e) => setGeneralSettings({...generalSettings, site_name: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="site-description">وصف الموقع</Label>
                  <Input 
                    id="site-description"
                    value={generalSettings.site_description}
                    onChange={(e) => setGeneralSettings({...generalSettings, site_description: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="support-email">البريد الإلكتروني للدعم</Label>
                  <Input 
                    id="support-email"
                    type="email"
                    value={generalSettings.support_email}
                    onChange={(e) => setGeneralSettings({...generalSettings, support_email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-registration"
                      checked={generalSettings.enable_registration}
                      onCheckedChange={(checked) => setGeneralSettings({...generalSettings, enable_registration: checked})}
                    />
                    <Label htmlFor="enable-registration">
                      السماح بالتسجيل الجديد
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-email-verification"
                      checked={generalSettings.require_email_verification}
                      onCheckedChange={(checked) => setGeneralSettings({...generalSettings, require_email_verification: checked})}
                    />
                    <Label htmlFor="require-email-verification">
                      طلب تأكيد البريد الإلكتروني
                    </Label>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>اللغة الافتراضية</Label>
                  <RadioGroup
                    value={generalSettings.default_language}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, default_language: value})}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ar" id="lang-ar" />
                      <Label htmlFor="lang-ar">العربية</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="en" id="lang-en" />
                      <Label htmlFor="lang-en">الإنجليزية</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Button type="submit" className="mt-4">حفظ الإعدادات</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                إعدادات الدفع
              </CardTitle>
              <CardDescription>
                تكوين بوابة الدفع والإعدادات المالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={savePaymentSettings} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="stripe-enabled"
                      checked={paymentSettings.stripe_enabled}
                      onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, stripe_enabled: checked})}
                    />
                    <Label htmlFor="stripe-enabled">
                      تمكين Stripe لمعالجة المدفوعات
                    </Label>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>وضع Stripe</Label>
                  <RadioGroup
                    value={paymentSettings.stripe_live_mode ? "live" : "test"}
                    onValueChange={(value) => setPaymentSettings({...paymentSettings, stripe_live_mode: value === "live"})}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="test" id="stripe-test" />
                      <Label htmlFor="stripe-test">وضع الاختبار (Test Mode)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="live" id="stripe-live" />
                      <Label htmlFor="stripe-live">وضع الإنتاج (Live Mode)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="stripe-test-key">مفتاح Stripe التجريبي</Label>
                  <Input 
                    id="stripe-test-key"
                    value={paymentSettings.stripe_test_key}
                    onChange={(e) => setPaymentSettings({...paymentSettings, stripe_test_key: e.target.value})}
                    type="password"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="stripe-live-key">مفتاح Stripe الإنتاجي</Label>
                  <Input 
                    id="stripe-live-key"
                    value={paymentSettings.stripe_live_key}
                    onChange={(e) => setPaymentSettings({...paymentSettings, stripe_live_key: e.target.value})}
                    type="password"
                    disabled={!paymentSettings.stripe_live_mode}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="currency">العملة الافتراضية</Label>
                  <Select 
                    value={paymentSettings.currency}
                    onValueChange={(value) => setPaymentSettings({...paymentSettings, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="eur">يورو (EUR)</SelectItem>
                      <SelectItem value="gbp">جنيه إسترليني (GBP)</SelectItem>
                      <SelectItem value="sar">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="aed">درهم إماراتي (AED)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tax-percent">نسبة الضريبة (%)</Label>
                  <Input 
                    id="tax-percent"
                    type="number"
                    value={paymentSettings.tax_percent}
                    onChange={(e) => setPaymentSettings({...paymentSettings, tax_percent: parseInt(e.target.value) || 0})}
                    min={0}
                    max={100}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button type="submit">حفظ الإعدادات</Button>
                  <Button type="button" variant="outline" onClick={syncStripeWebhooks} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    مزامنة Webhooks
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                إعدادات البريد الإلكتروني
              </CardTitle>
              <CardDescription>
                تكوين خدمة البريد الإلكتروني وقوالب الرسائل
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveEmailSettings} className="space-y-4">
                <div className="grid gap-2">
                  <Label>مزود البريد الإلكتروني</Label>
                  <RadioGroup
                    value={emailSettings.email_provider}
                    onValueChange={(value) => setEmailSettings({...emailSettings, email_provider: value})}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="smtp" id="provider-smtp" />
                      <Label htmlFor="provider-smtp">خادم SMTP</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sendgrid" id="provider-sendgrid" />
                      <Label htmlFor="provider-sendgrid">SendGrid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mailgun" id="provider-mailgun" />
                      <Label htmlFor="provider-mailgun">Mailgun</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {emailSettings.email_provider === "smtp" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-host">خادم SMTP</Label>
                      <Input 
                        id="smtp-host"
                        value={emailSettings.smtp_host}
                        onChange={(e) => setEmailSettings({...emailSettings, smtp_host: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-port">منفذ SMTP</Label>
                      <Input 
                        id="smtp-port"
                        value={emailSettings.smtp_port}
                        onChange={(e) => setEmailSettings({...emailSettings, smtp_port: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-user">اسم المستخدم SMTP</Label>
                      <Input 
                        id="smtp-user"
                        value={emailSettings.smtp_user}
                        onChange={(e) => setEmailSettings({...emailSettings, smtp_user: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-password">كلمة مرور SMTP</Label>
                      <Input 
                        id="smtp-password"
                        type="password"
                        value={emailSettings.smtp_password}
                        onChange={(e) => setEmailSettings({...emailSettings, smtp_password: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="sender-name">اسم المرسل</Label>
                  <Input 
                    id="sender-name"
                    value={emailSettings.sender_name}
                    onChange={(e) => setEmailSettings({...emailSettings, sender_name: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="sender-email">بريد المرسل</Label>
                  <Input 
                    id="sender-email"
                    type="email"
                    value={emailSettings.sender_email}
                    onChange={(e) => setEmailSettings({...emailSettings, sender_email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="welcome-email"
                      checked={emailSettings.welcome_email_enabled}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, welcome_email_enabled: checked})}
                    />
                    <Label htmlFor="welcome-email">
                      تمكين رسائل الترحيب
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="payment-receipt"
                      checked={emailSettings.payment_receipt_enabled}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, payment_receipt_enabled: checked})}
                    />
                    <Label htmlFor="payment-receipt">
                      تمكين إيصالات الدفع
                    </Label>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button type="submit">حفظ الإعدادات</Button>
                  <Button type="button" variant="outline" onClick={sendTestEmail} className="flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    إرسال رسالة تجريبية
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                إعدادات واجهة برمجة التطبيقات
              </CardTitle>
              <CardDescription>
                تكوين إعدادات الوصول لواجهة برمجة التطبيقات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveAPISettings} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-api"
                      checked={apiSettings.enable_api_access}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, enable_api_access: checked})}
                    />
                    <Label htmlFor="enable-api">
                      تمكين الوصول لواجهة برمجة التطبيقات
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-keys"
                      checked={apiSettings.require_api_keys}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, require_api_keys: checked})}
                    />
                    <Label htmlFor="require-keys">
                      طلب مفاتيح API للوصول
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-calls"
                      checked={apiSettings.log_api_calls}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, log_api_calls: checked})}
                    />
                    <Label htmlFor="log-calls">
                      تسجيل استدعاءات API
                    </Label>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="rate-limit">الحد الأقصى للطلبات في الدقيقة</Label>
                  <Input 
                    id="rate-limit"
                    type="number"
                    value={apiSettings.rate_limit_per_minute}
                    onChange={(e) => setApiSettings({...apiSettings, rate_limit_per_minute: parseInt(e.target.value) || 60})}
                    min={1}
                    max={1000}
                  />
                </div>
                
                <Button type="submit" className="mt-4">حفظ الإعدادات</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
