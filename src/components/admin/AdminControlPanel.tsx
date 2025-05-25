
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Database, 
  Users, 
  Shield, 
  Activity,
  BarChart3,
  Mail,
  Bell,
  Key,
  Server,
  HardDrive,
  Wifi,
  RefreshCw
} from 'lucide-react';
import { FluidContainer, ModernLayout, ModernGrid } from '@/components/layouts/ModernLayout';
import { ModernButton } from '@/components/ui/modern-button';
import { toast } from 'sonner';

const AdminControlPanel = () => {
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    autoBackupEnabled: true,
    analyticsEnabled: true,
    notificationsEnabled: true
  });

  const [apiSettings, setApiSettings] = useState({
    rateLimitEnabled: true,
    maxRequestsPerMinute: 1000,
    cacheEnabled: true,
    cacheTtl: 3600
  });

  const handleSystemToggle = (setting: string, value: boolean) => {
    setSystemSettings(prev => ({ ...prev, [setting]: value }));
    toast.success(`تم ${value ? 'تفعيل' : 'إلغاء'} ${setting}`);
  };

  const handleApiSettingChange = (setting: string, value: any) => {
    setApiSettings(prev => ({ ...prev, [setting]: value }));
    toast.success('تم حفظ إعدادات API');
  };

  const systemStats = [
    { label: 'الخادم', value: 'متصل', status: 'active', icon: Server },
    { label: 'قاعدة البيانات', value: '99.9%', status: 'active', icon: Database },
    { label: 'التخزين', value: '73%', status: 'warning', icon: HardDrive },
    { label: 'الشبكة', value: 'مستقر', status: 'active', icon: Wifi }
  ];

  return (
    <FluidContainer>
      <ModernLayout spacing="lg">
        {/* Header */}
        <div className="text-center py-6" dir="rtl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Settings className="h-10 w-10 text-primary" />
            لوحة التحكم الرئيسية
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            تحكم كامل في جميع جوانب النظام والإعدادات المتقدمة
          </p>
        </div>

        {/* System Status Overview */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-3" dir="rtl">
              <Activity className="h-6 w-6 text-primary" />
              حالة النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ModernGrid cols={4}>
              {systemStats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <stat.icon className={`h-8 w-8 ${
                      stat.status === 'active' ? 'text-green-500' : 
                      stat.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <Badge 
                    variant={stat.status === 'active' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {stat.status === 'active' ? 'نشط' : stat.status === 'warning' ? 'تحذير' : 'خطأ'}
                  </Badge>
                </div>
              ))}
            </ModernGrid>
          </CardContent>
        </Card>

        {/* Control Tabs */}
        <Tabs defaultValue="system" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              النظام
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              الأمان
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="mt-6">
            <ModernGrid cols={2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    إعدادات النظام العامة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">وضع الصيانة</Label>
                      <p className="text-sm text-gray-500">تعطيل الوصول للمستخدمين</p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(value) => handleSystemToggle('maintenanceMode', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">تسجيل المستخدمين الجدد</Label>
                      <p className="text-sm text-gray-500">السماح للمستخدمين بإنشاء حسابات جديدة</p>
                    </div>
                    <Switch
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(value) => handleSystemToggle('registrationEnabled', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">تأكيد البريد الإلكتروني</Label>
                      <p className="text-sm text-gray-500">مطالبة المستخدمين بتأكيد بريدهم الإلكتروني</p>
                    </div>
                    <Switch
                      checked={systemSettings.emailVerificationRequired}
                      onCheckedChange={(value) => handleSystemToggle('emailVerificationRequired', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">النسخ الاحتياطي التلقائي</Label>
                      <p className="text-sm text-gray-500">إنشاء نسخ احتياطية يومية</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoBackupEnabled}
                      onCheckedChange={(value) => handleSystemToggle('autoBackupEnabled', value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5" />
                    إعدادات التحليلات والإشعارات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">التحليلات المتقدمة</Label>
                      <p className="text-sm text-gray-500">تفعيل تتبع المستخدمين والإحصائيات</p>
                    </div>
                    <Switch
                      checked={systemSettings.analyticsEnabled}
                      onCheckedChange={(value) => handleSystemToggle('analyticsEnabled', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">الإشعارات</Label>
                      <p className="text-sm text-gray-500">إرسال إشعارات النظام</p>
                    </div>
                    <Switch
                      checked={systemSettings.notificationsEnabled}
                      onCheckedChange={(value) => handleSystemToggle('notificationsEnabled', value)}
                    />
                  </div>

                  <div className="pt-4 space-y-4">
                    <ModernButton className="w-full">
                      <RefreshCw className="h-4 w-4 ml-2" />
                      تحديث إعدادات النظام
                    </ModernButton>
                    <ModernButton variant="outline" className="w-full">
                      <Database className="h-4 w-4 ml-2" />
                      إنشاء نسخة احتياطية الآن
                    </ModernButton>
                  </div>
                </CardContent>
              </Card>
            </ModernGrid>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  إدارة المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">إدارة المستخدمين</h3>
                  <p className="text-gray-500 mb-6">يمكنك الوصول إلى إدارة المستخدمين من الصفحة المخصصة</p>
                  <ModernButton onClick={() => window.location.href = '/admin/users'}>
                    <Users className="h-4 w-4 ml-2" />
                    الانتقال إلى إدارة المستخدمين
                  </ModernButton>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <ModernGrid cols={2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    إعدادات الأمان
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>مدة انتهاء الجلسة (بالدقائق)</Label>
                    <Input type="number" defaultValue="60" />
                  </div>
                  <div className="space-y-2">
                    <Label>عدد محاولات تسجيل الدخول المسموحة</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>مدة حظر IP (بالدقائق)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <ModernButton className="w-full">
                    <Shield className="h-4 w-4 ml-2" />
                    حفظ إعدادات الأمان
                  </ModernButton>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Activity className="h-5 w-5" />
                    مراقبة النشاط
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>الجلسات النشطة</span>
                      <Badge>23</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>محاولات تسجيل دخول فاشلة اليوم</span>
                      <Badge variant="destructive">7</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>عناوين IP محظورة</span>
                      <Badge variant="secondary">2</Badge>
                    </div>
                    <ModernButton variant="outline" className="w-full">
                      <Activity className="h-4 w-4 ml-2" />
                      عرض تقرير مفصل
                    </ModernButton>
                  </div>
                </CardContent>
              </Card>
            </ModernGrid>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Key className="h-5 w-5" />
                  إعدادات API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">تحديد معدل الطلبات</Label>
                        <p className="text-sm text-gray-500">تفعيل حدود API</p>
                      </div>
                      <Switch
                        checked={apiSettings.rateLimitEnabled}
                        onCheckedChange={(value) => handleApiSettingChange('rateLimitEnabled', value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الحد الأقصى للطلبات في الدقيقة</Label>
                      <Input 
                        type="number" 
                        value={apiSettings.maxRequestsPerMinute}
                        onChange={(e) => handleApiSettingChange('maxRequestsPerMinute', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">التخزين المؤقت</Label>
                        <p className="text-sm text-gray-500">تفعيل cache للـ API</p>
                      </div>
                      <Switch
                        checked={apiSettings.cacheEnabled}
                        onCheckedChange={(value) => handleApiSettingChange('cacheEnabled', value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>مدة التخزين المؤقت (بالثواني)</Label>
                      <Input 
                        type="number" 
                        value={apiSettings.cacheTtl}
                        onChange={(e) => handleApiSettingChange('cacheTtl', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <ModernButton className="w-full">
                    <Key className="h-4 w-4 ml-2" />
                    حفظ إعدادات API
                  </ModernButton>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ModernLayout>
    </FluidContainer>
  );
};

export default AdminControlPanel;
