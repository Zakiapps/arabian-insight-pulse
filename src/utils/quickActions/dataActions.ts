
import { supabase } from '@/integrations/supabase/client';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const createDataActions = (user: User, { startTask, completeTask }: ReturnType<typeof useTaskHistory>) => ({
  exportData: async (setIsExporting: (loading: boolean) => void) => {
    console.log('Export data button clicked');
    
    setIsExporting(true);
    
    try {
      const taskId = await startTask('export', 'تصدير البيانات إلى CSV');
      
      const { data: postsData, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('user_id', user.id)
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
  }
});
