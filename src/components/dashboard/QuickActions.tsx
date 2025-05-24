
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
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { createNavigationAction } from '@/utils/quickActions/navigationActions';
import { createDataActions } from '@/utils/quickActions/dataActions';
import { createReportActions } from '@/utils/quickActions/reportActions';
import { createAlertActions } from '@/utils/quickActions/alertActions';
import { QuickActionButton } from './QuickActionButton';

export const QuickActions = () => {
  const navigate = useNavigate();
  const taskHistory = useTaskHistory();
  const { createNotification } = useNotifications();
  const { checkAuth, user } = useAuthCheck();
  const [isExporting, setIsExporting] = useState(false);

  // Create action handlers with complete task history object
  const navigationActions = createNavigationAction(navigate, taskHistory);
  const dataActions = user ? createDataActions(user, taskHistory) : null;
  const reportActions = user ? createReportActions(user, navigate, taskHistory) : null;
  const alertActions = user ? createAlertActions(user, navigate, taskHistory) : null;

  // Wrapper function to check auth before executing actions
  const executeWithAuth = (action: () => Promise<void>) => async () => {
    if (!checkAuth()) return;
    await action();
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
