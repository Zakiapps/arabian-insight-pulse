
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  BarChart3, 
  Bell, 
  Settings, 
  Download,
  Filter,
  Sparkles,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { createNavigationAction } from '@/utils/quickActions/navigationActions';
import { createDataActions } from '@/utils/quickActions/dataActions';
import { createReportActions } from '@/utils/quickActions/reportActions';
import { createAlertActions } from '@/utils/quickActions/alertActions';
import { QuickActionButton } from './QuickActionButton';
import { toast } from 'sonner';

export const QuickActions = () => {
  const navigate = useNavigate();
  const taskHistory = useTaskHistory();
  const { createNotification } = useNotifications();
  const { isAuthenticated, user, profile, loading } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  console.log('QuickActions auth state:', {
    isAuthenticated,
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    userEmail: user?.email,
    profileId: profile?.id
  });

  // Wait for auth to load before showing actions
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">جاري التحميل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create action handlers with complete task history object
  const navigationActions = createNavigationAction(navigate, taskHistory);
  const dataActions = (user && profile) ? createDataActions(user, taskHistory) : null;
  const reportActions = (user && profile) ? createReportActions(user, navigate, taskHistory) : null;
  const alertActions = (user && profile) ? createAlertActions(user, navigate, taskHistory) : null;

  // Wrapper function to check auth before executing actions
  const executeWithAuth = (action: () => Promise<void>) => async () => {
    console.log('Executing action - Auth check:', {
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!profile,
      userEmail: user?.email
    });
    
    if (!isAuthenticated || !user || !profile) {
      console.log('Auth failed, redirecting to login');
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    
    try {
      await action();
    } catch (error) {
      console.error('Error executing action:', error);
      toast.error('حدث خطأ أثناء تنفيذ العملية');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          إجراءات سريعة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <QuickActionButton
          icon={Upload}
          label="رفع بيانات جديدة"
          onClick={executeWithAuth(navigationActions.uploadData)}
        />
        
        <QuickActionButton
          icon={BarChart3}
          label="إنشاء تقرير"
          onClick={executeWithAuth(reportActions?.createReport || (() => Promise.resolve()))}
          colorClass="hover:bg-blue-500/5"
        />
        
        <QuickActionButton
          icon={Bell}
          label="إعداد تنبيه"
          onClick={executeWithAuth(alertActions?.setupAlert || (() => Promise.resolve()))}
          colorClass="hover:bg-yellow-500/5"
        />
        
        <QuickActionButton
          icon={Settings}
          label="إعدادات التحليل المتقدمة"
          onClick={executeWithAuth(navigationActions.analysisSettings)}
          colorClass="hover:bg-purple-500/5"
        />

        <QuickActionButton
          icon={Download}
          label="التصدير"
          onClick={executeWithAuth(() => dataActions?.exportData(setIsExporting) || Promise.resolve())}
          disabled={isExporting}
          colorClass="hover:bg-green-500/5"
        >
          {isExporting ? 'جاري التصدير...' : 'التصدير'}
        </QuickActionButton>

        <QuickActionButton
          icon={Filter}
          label="التصفية"
          onClick={executeWithAuth(navigationActions.filterData)}
          colorClass="hover:bg-orange-500/5"
        />

        <QuickActionButton
          icon={FileText}
          label="تنزيل التقارير"
          onClick={executeWithAuth(reportActions?.downloadReports || (() => Promise.resolve()))}
          colorClass="hover:bg-indigo-500/5"
        />
      </CardContent>
    </Card>
  );
};
