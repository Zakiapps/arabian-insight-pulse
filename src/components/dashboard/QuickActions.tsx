
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
import { toast } from 'sonner';
import Papa from 'papaparse';

export const QuickActions = () => {
  const navigate = useNavigate();
  const { startTask, completeTask } = useTaskHistory();
  const { createNotification } = useNotifications();
  const { profile } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleUploadData = async () => {
    console.log('Upload data button clicked');
    
    if (!profile?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى صفحة رفع البيانات');
      navigate('/upload');
      await completeTask(taskId, { page: 'upload' });
      toast.success('تم الانتقال إلى صفحة رفع البيانات');
    } catch (error) {
      console.error('Error navigating to upload:', error);
      toast.error('فشل في الانتقال إلى صفحة رفع البيانات');
    }
  };

  const handleCreateReport = async () => {
    console.log('Create report button clicked');
    
    if (!profile?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    
    try {
      const taskId = await startTask('report_generation', 'إنشاء تقرير جديد');
      
      // Fetch user's data for report
      const { data: postsData, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('user_id', profile.id);

      if (error) {
        console.error('Error fetching posts:', error);
        throw new Error('فشل في جلب البيانات');
      }

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

      if (reportError) {
        console.error('Error creating report:', reportError);
        throw new Error('فشل في إنشاء التقرير');
      }

      await completeTask(taskId, { reportId: reportData.id });
      toast.success('تم إنشاء التقرير بنجاح');
      navigate('/reports');
    } catch (error) {
      console.error('Error creating report:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل في إنشاء التقرير';
      toast.error(errorMessage);
    }
  };

  const handleSetupAlert = async () => {
    console.log('Setup alert button clicked');
    
    if (!profile?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    
    try {
      const taskId = await startTask('alert_setup', 'إعداد تنبيه جديد');
      
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

      if (error) {
        console.error('Error creating alert:', error);
        throw new Error('فشل في إنشاء التنبيه');
      }

      await completeTask(taskId, { alertId: alertData.id });
      toast.success('تم إنشاء تنبيه جديد بنجاح');
      navigate('/alerts');
    } catch (error) {
      console.error('Error setting up alert:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل في إعداد التنبيه';
      toast.error(errorMessage);
    }
  };

  const handleAnalysisSettings = async () => {
    console.log('Analysis settings button clicked');
    
    if (!profile?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى إعدادات التحليل');
      navigate('/analysis-settings');
      await completeTask(taskId, { page: 'analysis-settings' });
      toast.success('تم الانتقال إلى إعدادات التحليل');
    } catch (error) {
      console.error('Error navigating to analysis settings:', error);
      toast.error('فشل في الانتقال إلى إعدادات التحليل');
    }
  };

  const handleExportData = async () => {
    console.log('Export data button clicked');
    
    if (!profile?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    
    setIsExporting(true);
    
    try {
      const taskId = await startTask('export', 'تصدير البيانات إلى CSV');
      
      const { data: postsData, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts for export:', error);
        throw new Error('فشل في جلب البيانات للتصدير');
      }

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
        toast.success(`تم تصدير ${postsData.length} سجل بنجاح`);
      } else {
        await completeTask(taskId, null, 'لا توجد بيانات للتصدير');
        toast.warning('لا توجد بيانات للتصدير');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل في تصدير البيانات';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterData = async () => {
    console.log('Filter data button clicked');
    
    if (!profile?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى صفحة المنشورات');
      navigate('/posts');
      await completeTask(taskId, { page: 'posts' });
      toast.success('تم الانتقال إلى صفحة المنشورات');
    } catch (error) {
      console.error('Error navigating to posts:', error);
      toast.error('فشل في الانتقال إلى صفحة المنشورات');
    }
  };

  const handleDownloadReports = async () => {
    console.log('Download reports button clicked');
    
    if (!profile?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    
    try {
      const taskId = await startTask('download_reports', 'تنزيل التقارير');
      
      const { data: reports, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        throw new Error('فشل في جلب التقارير');
      }

      if (reports && reports.length > 0) {
        await completeTask(taskId, { reportsCount: reports.length });
        toast.success(`لديك ${reports.length} تقرير متاح`);
        navigate('/reports');
      } else {
        await completeTask(taskId, null, 'لا توجد تقارير');
        toast.warning('لا توجد تقارير متاحة للتنزيل');
      }
    } catch (error) {
      console.error('Error downloading reports:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل في تنزيل التقارير';
      toast.error(errorMessage);
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
