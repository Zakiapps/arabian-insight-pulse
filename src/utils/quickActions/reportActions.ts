
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const createReportActions = (user: User, navigate: ReturnType<typeof useNavigate>, { startTask, completeTask }: ReturnType<typeof useTaskHistory>) => ({
  createReport: async () => {
    console.log('Create report button clicked');
    
    try {
      const taskId = await startTask('report_generation', 'إنشاء تقرير جديد');
      
      // Fetch user's data for report
      const { data: postsData, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching posts:', error);
        throw new Error('فشل في جلب البيانات');
      }

      // Create report entry
      const { data: reportData, error: reportError } = await supabase
        .from('user_reports')
        .insert({
          user_id: user.id,
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
  },

  downloadReports: async () => {
    console.log('Download reports button clicked');
    
    try {
      const taskId = await startTask('download_reports', 'تنزيل التقارير');
      
      const { data: reports, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('user_id', user.id)
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
  }
});
