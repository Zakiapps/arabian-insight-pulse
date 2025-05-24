
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { supabase } from '@/integrations/supabase/client';
import { ButtonRTL } from '@/components/ui/button-rtl';
import Papa from 'papaparse';

export const QuickActions = () => {
  const navigate = useNavigate();
  const { startTask, completeTask } = useTaskHistory();
  const { createNotification } = useNotifications();
  const { profile } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleUploadData = async () => {
    if (!profile?.id) return;
    
    const taskId = await startTask('navigation', 'الانتقال إلى صفحة رفع البيانات');
    try {
      navigate('/dashboard/upload');
      await completeTask(taskId, { page: 'upload' });
      await createNotification('تم الانتقال', 'تم الانتقال إلى صفحة رفع البيانات', 'info');
    } catch (error) {
      await completeTask(taskId, null, 'فشل في الانتقال');
    }
  };

  const handleCreateReport = async () => {
    if (!profile?.id) return;
    
    const taskId = await startTask('report_generation', 'إنشاء تقرير جديد');
    try {
      // Fetch user's data for report
      const { data: postsData, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('user_id', profile.id);

      if (error) throw error;

      // Create report entry
      const { data: reportData, error: reportError } = await supabase
        .from('user_reports')
        .insert({
          user_id: profile.id,
          name: `تقرير ${new Date().toLocaleDateString('ar')}`,
          report_type: 'comprehensive',
          format: 'pdf',
          parameters: {
            total_posts: postsData?.length || 0,
            date_range: 'all_time'
          }
        })
        .select()
        .single();

      if (reportError) throw reportError;

      await completeTask(taskId, { reportId: reportData.id });
      await createNotification('تم إنشاء التقرير', 'تم إنشاء التقرير بنجاح', 'success');
      navigate('/dashboard/reports');
    } catch (error) {
      await completeTask(taskId, null, error.message);
      await createNotification('خطأ في إنشاء التقرير', 'فشل في إنشاء التقرير', 'error');
    }
  };

  const handleSetupAlert = async () => {
    if (!profile?.id) return;
    
    const taskId = await startTask('alert_setup', 'إعداد تنبيه جديد');
    try {
      // Create a default alert
      const { data: alertData, error } = await supabase
        .from('user_alerts')
        .insert({
          user_id: profile.id,
          name: 'تنبيه المشاعر الإيجابية',
          metric: 'sentiment',
          condition: 'greater_than',
          value: 70,
          timeframe: 'daily'
        })
        .select()
        .single();

      if (error) throw error;

      await completeTask(taskId, { alertId: alertData.id });
      await createNotification('تم إعداد التنبيه', 'تم إنشاء تنبيه جديد بنجاح', 'success');
      navigate('/dashboard/alerts');
    } catch (error) {
      await completeTask(taskId, null, error.message);
      await createNotification('خطأ في إعداد التنبيه', 'فشل في إعداد التنبيه', 'error');
    }
  };

  const handleAnalysisSettings = async () => {
    if (!profile?.id) return;
    
    const taskId = await startTask('navigation', 'الانتقال إلى إعدادات التحليل');
    try {
      navigate('/dashboard/analysis-settings');
      await completeTask(taskId, { page: 'analysis-settings' });
    } catch (error) {
      await completeTask(taskId, null, 'فشل في الانتقال');
    }
  };

  const handleExportData = async () => {
    if (!profile?.id) return;
    
    setIsExporting(true);
    const taskId = await startTask('export', 'تصدير البيانات إلى CSV');
    
    try {
      const { data: postsData, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (postsData && postsData.length > 0) {
        // Create CSV content
        const csvContent = [
          ['المحتوى', 'المشاعر', 'النتيجة', 'اللهجة الأردنية', 'المصدر', 'التاريخ'],
          ...postsData.map(post => [
            post.content,
            post.sentiment === 'positive' ? 'إيجابي' : post.sentiment === 'negative' ? 'سلبي' : 'محايد',
            post.sentiment_score || '',
            post.is_jordanian_dialect ? 'نعم' : 'لا',
            post.source || '',
            new Date(post.created_at).toLocaleDateString('ar')
          ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        // Download file
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `تحليل_البيانات_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await completeTask(taskId, { recordsExported: postsData.length });
        await createNotification('تم التصدير', `تم تصدير ${postsData.length} سجل بنجاح`, 'success');
      } else {
        await completeTask(taskId, null, 'لا توجد بيانات للتصدير');
        await createNotification('لا توجد بيانات', 'لا توجد بيانات للتصدير', 'warning');
      }
    } catch (error) {
      await completeTask(taskId, null, 'فشل في التصدير');
      await createNotification('خطأ في التصدير', 'فشل في تصدير البيانات', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterData = async () => {
    if (!profile?.id) return;
    
    const taskId = await startTask('navigation', 'الانتقال إلى صفحة المنشورات');
    try {
      navigate('/dashboard/posts');
      await completeTask(taskId, { page: 'posts' });
    } catch (error) {
      await completeTask(taskId, null, 'فشل في الانتقال');
    }
  };

  const handleDownloadReports = async () => {
    if (!profile?.id) return;
    
    const taskId = await startTask('download_reports', 'تنزيل التقارير');
    try {
      const { data: reports, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (reports && reports.length > 0) {
        await completeTask(taskId, { reportsCount: reports.length });
        await createNotification('التقارير متاحة', `لديك ${reports.length} تقرير متاح`, 'info');
        navigate('/dashboard/reports');
      } else {
        await completeTask(taskId, null, 'لا توجد تقارير');
        await createNotification('لا توجد تقارير', 'لا توجد تقارير متاحة للتنزيل', 'warning');
      }
    } catch (error) {
      await completeTask(taskId, null, error.message);
      await createNotification('خطأ في التنزيل', 'فشل في تنزيل التقارير', 'error');
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
        <ButtonRTL 
          variant="outline" 
          className="w-full justify-start hover:bg-primary/5" 
          onClick={handleUploadData}
        >
          <Upload className="h-4 w-4 mr-2" />
          رفع بيانات جديدة
        </ButtonRTL>
        
        <ButtonRTL 
          variant="outline" 
          className="w-full justify-start hover:bg-blue-500/5" 
          onClick={handleCreateReport}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          إنشاء تقرير
        </ButtonRTL>
        
        <ButtonRTL 
          variant="outline" 
          className="w-full justify-start hover:bg-yellow-500/5" 
          onClick={handleSetupAlert}
        >
          <Bell className="h-4 w-4 mr-2" />
          إعداد تنبيه
        </ButtonRTL>
        
        <ButtonRTL 
          variant="outline" 
          className="w-full justify-start hover:bg-purple-500/5" 
          onClick={handleAnalysisSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          إعدادات التحليل المتقدمة
        </ButtonRTL>

        <ButtonRTL 
          variant="outline" 
          className="w-full justify-start hover:bg-green-500/5" 
          onClick={handleExportData}
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'جاري التصدير...' : 'التصدير'}
        </ButtonRTL>

        <ButtonRTL 
          variant="outline" 
          className="w-full justify-start hover:bg-orange-500/5" 
          onClick={handleFilterData}
        >
          <Filter className="h-4 w-4 mr-2" />
          التصفية
        </ButtonRTL>

        <ButtonRTL 
          variant="outline" 
          className="w-full justify-start hover:bg-indigo-500/5" 
          onClick={handleDownloadReports}
        >
          <FileText className="h-4 w-4 mr-2" />
          تنزيل التقارير
        </ButtonRTL>
      </CardContent>
    </Card>
  );
};
