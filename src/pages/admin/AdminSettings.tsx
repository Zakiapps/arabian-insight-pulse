import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Globe, CreditCard, BellRing, Shield, Mail, TestTube, RefreshCw, AlertTriangle } from "lucide-react";

export default function AdminSettings() {
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "رؤى عربية",
    siteDescription: "منصة تحليل النصوص العربية والمشاعر",
    supportEmail: "support@example.com",
    enableRegistration: true,
    requireEmailVerification: true,
    defaultLanguage: "ar"
  });
  
  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    stripeLiveMode: false,
    stripeLiveKey: "",
    stripeTestKey: "sk_test_...", // Partial key for demo
    currency: "usd",
    taxPercent: 0
  });
  
  // Email settings state
  const [emailSettings, setEmailSettings] = useState({
    emailProvider: "smtp",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    senderName: "رؤى عربية",
    senderEmail: "no-reply@example.com",
    welcomeEmailEnabled: true,
    paymentReceiptEnabled: true
  });
  
  // API settings state
  const [apiSettings, setApiSettings] = useState({
    enableApiAccess: true,
    rateLimitPerMinute: 60,
    requireApiKeys: true,
    logApiCalls: true
  });

  // Enhanced system settings with maintenance mode
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: "النظام تحت الصيانة حالياً. يرجى المحاولة لاحقاً.",
    maxFileSize: 10,
    allowedFileTypes: "csv,xlsx,txt",
    sessionTimeout: 24,
    enableLogging: true,
    enableAnalytics: true,
  });

  // Handle general settings form submission
  const saveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the database
    toast.success("تم حفظ الإعدادات العامة بنجاح");
  };
  
  // Handle payment settings form submission
  const savePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the database
    toast.success("تم حفظ إعدادات الدفع بنجاح");
  };
  
  // Handle email settings form submission
  const saveEmailSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the database
    toast.success("تم حفظ إعدادات البريد الإلكتروني بنجاح");
  };
  
  // Handle API settings form submission
  const saveAPISettings = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the database
    toast.success("تم حفظ إعدادات واجهة برمجة التطبيقات بنجاح");
  };

  // Send test email
  const sendTestEmail = () => {
    // In a real app, this would send a test email
    toast.success("تم إرسال بريد إلكتروني تجريبي بنجاح");
  };

  // Synchronize Stripe webhooks
  const syncStripeWebhooks = () => {
    // In a real app, this would sync Stripe webhooks
    toast.success("تم مزامنة Stripe Webhooks بنجاح");
  };

  // Handle system settings form submission
  const saveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تم حفظ إعدادات النظام بنجاح");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إعدادات النظام</h1>
      
      <Tabs defaultValue="system">
        <TabsList className="grid grid-cols-5 w-full sm:w-auto">
          <TabsTrigger value="system">النظام</TabsTrigger>
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="payment">المدفوعات</TabsTrigger>
          <TabsTrigger value="email">البريد الإلكتروني</TabsTrigger>
          <TabsTrigger value="api">واجهة API</TabsTrigger>
        </TabsList>
        
        {/* System Settings Tab */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                إعدادات النظام
              </CardTitle>
              <CardDescription>
                إعدادات النظام العامة ووضع الصيانة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveSystemSettings} className="space-y-6">
                <div className="space-y-4 p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenance-mode"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                    />
                    <Label htmlFor="maintenance-mode" className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      تفعيل وضع الصيانة
                    </Label>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="maintenance-message">رسالة الصيانة</Label>
                    <Input 
                      id="maintenance-message"
                      value={systemSettings.maintenanceMessage}
                      onChange={(e) => setSystemSettings({...systemSettings, maintenanceMessage: e.target.value})}
                      disabled={!systemSettings.maintenanceMode}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="max-file-size">الحد الأقصى لحجم الملف (MB)</Label>
                    <Input 
                      id="max-file-size"
                      type="number"
                      value={systemSettings.maxFileSize}
                      onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: parseInt(e.target.value)})}
                      min={1}
                      max={100}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="allowed-types">أنواع الملفات المسموحة</Label>
                    <Input 
                      id="allowed-types"
                      value={systemSettings.allowedFileTypes}
                      onChange={(e) => setSystemSettings({...systemSettings, allowedFileTypes: e.target.value})}
                      placeholder="csv,xlsx,txt"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="session-timeout">مهلة انتهاء الجلسة (ساعات)</Label>
                  <Input 
                    id="session-timeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                    min={1}
                    max={168}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-logging"
                      checked={systemSettings.enableLogging}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableLogging: checked})}
                    />
                    <Label htmlFor="enable-logging">
                      تمكين تسجيل العمليات
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-analytics"
                      checked={systemSettings.enableAnalytics}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableAnalytics: checked})}
                    />
                    <Label htmlFor="enable-analytics">
                      تمكين تحليلات الاستخدام
                    </Label>
                  </div>
                </div>
                
                <Button type="submit" className="mt-4">حفظ إعدادات النظام</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* General Settings Tab */}
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
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="site-description">وصف الموقع</Label>
                  <Input 
                    id="site-description"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="support-email">البريد الإلكتروني للدعم</Label>
                  <Input 
                    id="support-email"
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, supportEmail: e.target.value})}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-registration"
                      checked={generalSettings.enableRegistration}
                      onCheckedChange={(checked) => setGeneralSettings({...generalSettings, enableRegistration: checked})}
                    />
                    <Label htmlFor="enable-registration">
                      السماح بالتسجيل الجديد
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-email-verification"
                      checked={generalSettings.requireEmailVerification}
                      onCheckedChange={(checked) => setGeneralSettings({...generalSettings, requireEmailVerification: checked})}
                    />
                    <Label htmlFor="require-email-verification">
                      طلب تأكيد البريد الإلكتروني
                    </Label>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>اللغة الافتراضية</Label>
                  <RadioGroup
                    value={generalSettings.defaultLanguage}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, defaultLanguage: value})}
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
        
        {/* Payment Settings Tab */}
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
                      checked={paymentSettings.stripeEnabled}
                      onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, stripeEnabled: checked})}
                    />
                    <Label htmlFor="stripe-enabled">
                      تمكين Stripe لمعالجة المدفوعات
                    </Label>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>وضع Stripe</Label>
                  <RadioGroup
                    value={paymentSettings.stripeLiveMode ? "live" : "test"}
                    onValueChange={(value) => setPaymentSettings({...paymentSettings, stripeLiveMode: value === "live"})}
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
                    value={paymentSettings.stripeTestKey}
                    onChange={(e) => setPaymentSettings({...paymentSettings, stripeTestKey: e.target.value})}
                    type="password"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="stripe-live-key">مفتاح Stripe الإنتاجي</Label>
                  <Input 
                    id="stripe-live-key"
                    value={paymentSettings.stripeLiveKey}
                    onChange={(e) => setPaymentSettings({...paymentSettings, stripeLiveKey: e.target.value})}
                    type="password"
                    disabled={!paymentSettings.stripeLiveMode}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="currency">العملة الافتراضية</Label>
                  <Select 
                    options={[
                      { value: "usd", label: "دولار أمريكي (USD)" },
                      { value: "eur", label: "يورو (EUR)" },
                      { value: "gbp", label: "جنيه إسترليني (GBP)" },
                      { value: "sar", label: "ريال سعودي (SAR)" },
                      { value: "aed", label: "درهم إماراتي (AED)" }
                    ]}
                    value={paymentSettings.currency}
                    onChange={(value) => setPaymentSettings({...paymentSettings, currency: value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tax-percent">نسبة الضريبة (%)</Label>
                  <Input 
                    id="tax-percent"
                    type="number"
                    value={paymentSettings.taxPercent}
                    onChange={(e) => setPaymentSettings({...paymentSettings, taxPercent: parseInt(e.target.value)})}
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
        
        {/* Email Settings Tab */}
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
                    value={emailSettings.emailProvider}
                    onValueChange={(value) => setEmailSettings({...emailSettings, emailProvider: value})}
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
                
                {emailSettings.emailProvider === "smtp" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-host">خادم SMTP</Label>
                      <Input 
                        id="smtp-host"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-port">منفذ SMTP</Label>
                      <Input 
                        id="smtp-port"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-user">اسم المستخدم SMTP</Label>
                      <Input 
                        id="smtp-user"
                        value={emailSettings.smtpUser}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-password">كلمة المرور SMTP</Label>
                      <Input 
                        id="smtp-password"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="sender-name">اسم المرسل</Label>
                  <Input 
                    id="sender-name"
                    value={emailSettings.senderName}
                    onChange={(e) => setEmailSettings({...emailSettings, senderName: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="sender-email">بريد المرسل الإلكتروني</Label>
                  <Input 
                    id="sender-email"
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, senderEmail: e.target.value})}
                  />
                </div>
                
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-medium">إعدادات الإشعارات</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="welcome-email"
                      checked={emailSettings.welcomeEmailEnabled}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, welcomeEmailEnabled: checked})}
                    />
                    <Label htmlFor="welcome-email">
                      إرسال بريد الترحيب بعد التسجيل
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="payment-receipt"
                      checked={emailSettings.paymentReceiptEnabled}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, paymentReceiptEnabled: checked})}
                    />
                    <Label htmlFor="payment-receipt">
                      إرسال إيصالات الدفع
                    </Label>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button type="submit">حفظ الإعدادات</Button>
                  <Button type="button" variant="outline" onClick={sendTestEmail} className="flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    إرسال بريد تجريبي
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* API Settings Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                إعدادات واجهة برمجة التطبيقات API
              </CardTitle>
              <CardDescription>
                تكوين وصول API وإعدادات الأمان
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveAPISettings} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-api"
                      checked={apiSettings.enableApiAccess}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, enableApiAccess: checked})}
                    />
                    <Label htmlFor="enable-api">
                      تمكين الوصول إلى API
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-api-keys"
                      checked={apiSettings.requireApiKeys}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, requireApiKeys: checked})}
                    />
                    <Label htmlFor="require-api-keys">
                      طلب مفاتيح API
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-api-calls"
                      checked={apiSettings.logApiCalls}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, logApiCalls: checked})}
                    />
                    <Label htmlFor="log-api-calls">
                      تسجيل استدعاءات API
                    </Label>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="rate-limit">حد الطلبات لكل دقيقة</Label>
                  <Input 
                    id="rate-limit"
                    type="number"
                    value={apiSettings.rateLimitPerMinute}
                    onChange={(e) => setApiSettings({...apiSettings, rateLimitPerMinute: parseInt(e.target.value)})}
                    min={1}
                  />
                </div>
                
                <div className="grid gap-2 pt-2">
                  <h3 className="text-sm font-medium">مفاتيح API النشطة</h3>
                  <div className="bg-muted/50 p-4 rounded-md text-center">
                    <p className="text-muted-foreground">لا توجد مفاتيح API نشطة حالياً.</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      إنشاء مفتاح API جديد
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="mt-4">حفظ الإعدادات</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Temporary Select component since we don't have access to the real select component
function Select({ options, value, onChange }) {
  return (
    <select 
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
