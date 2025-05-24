
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { useNotifications } from '@/hooks/useNotifications';

const EnhancedSettings = () => {
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { startTask, completeTask } = useTaskHistory();
  const { createNotification } = useNotifications();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const taskId = await startTask('settings', 'حفظ إعدادات المستخدم');

    try {
      await updatePreferences(preferences);
      
      await completeTask(taskId, { preferences });
      await createNotification(
        'تم حفظ الإعدادات',
        'تم حفظ إعداداتك بنجاح',
        'success'
      );
    } catch (error) {
      console.error('Settings save error:', error);
      await completeTask(taskId, null, error.message);
      await createNotification(
        'خطأ في حفظ الإعدادات',
        'فشل في حفظ الإعدادات',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateDashboardLayout = (key: string, value: any) => {
    updatePreferences({
      ...preferences,
      dashboard_layout: {
        ...preferences.dashboard_layout,
        [key]: value
      }
    });
  };

  const updateNotificationSettings = (key: string, value: boolean) => {
    updatePreferences({
      ...preferences,
      notification_settings: {
        ...preferences.notification_settings,
        [key]: value
      }
    });
  };

  const updateAnalysisPreferences = (key: string, value: any) => {
    updatePreferences({
      ...preferences,
      analysis_preferences: {
        ...preferences.analysis_preferences,
        [key]: value
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات لوحة التحكم
          </CardTitle>
          <CardDescription>
            تخصيص مظهر وسلوك لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المظهر</Label>
              <Select 
                value={preferences.dashboard_layout.theme} 
                onValueChange={(value) => updateDashboardLayout('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">افتراضي</SelectItem>
                  <SelectItem value="dark">داكن</SelectItem>
                  <SelectItem value="light">فاتح</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>اللغة</Label>
              <Select 
                value={preferences.dashboard_layout.language} 
                onValueChange={(value) => updateDashboardLayout('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات الإشعارات</CardTitle>
          <CardDescription>
            تحكم في كيفية تلقي الإشعارات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">إشعارات البريد الإلكتروني</Label>
            <Switch 
              id="email-notifications"
              checked={preferences.notification_settings.email}
              onCheckedChange={(checked) => updateNotificationSettings('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">الإشعارات المنبثقة</Label>
            <Switch 
              id="push-notifications"
              checked={preferences.notification_settings.push}
              onCheckedChange={(checked) => updateNotificationSettings('push', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="in-app-notifications">الإشعارات داخل التطبيق</Label>
            <Switch 
              id="in-app-notifications"
              checked={preferences.notification_settings.in_app}
              onCheckedChange={(checked) => updateNotificationSettings('in_app', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات التحليل</CardTitle>
          <CardDescription>
            تخصيص عملية تحليل البيانات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-save">الحفظ التلقائي</Label>
            <Switch 
              id="auto-save"
              checked={preferences.analysis_preferences.auto_save}
              onCheckedChange={(checked) => updateAnalysisPreferences('auto_save', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="real-time">التحليل في الوقت الفعلي</Label>
            <Switch 
              id="real-time"
              checked={preferences.analysis_preferences.real_time}
              onCheckedChange={(checked) => updateAnalysisPreferences('real_time', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedSettings;
