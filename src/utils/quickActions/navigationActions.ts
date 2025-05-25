
import { useNavigate } from 'react-router-dom';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { toast } from 'sonner';

export const createNavigationAction = (navigate: ReturnType<typeof useNavigate>, { startTask, completeTask }: ReturnType<typeof useTaskHistory>) => ({
  uploadData: async () => {
    console.log('Upload data button clicked');
    
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى صفحة رفع البيانات');
      navigate('/upload');
      await completeTask(taskId, { page: 'upload' });
      toast.success('تم الانتقال إلى صفحة رفع البيانات');
    } catch (error) {
      console.error('Error navigating to upload:', error);
      toast.error('فشل في الانتقال إلى صفحة رفع البيانات');
    }
  },

  analysisSettings: async () => {
    console.log('Analysis settings button clicked');
    
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى إعدادات التحليل');
      navigate('/analysis-settings');
      await completeTask(taskId, { page: 'analysis-settings' });
      toast.success('تم الانتقال إلى إعدادات التحليل');
    } catch (error) {
      console.error('Error navigating to analysis settings:', error);
      toast.error('فشل في الانتقال إلى إعدادات التحليل');
    }
  },

  filterData: async () => {
    console.log('Filter data button clicked');
    
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى صفحة المنشورات');
      navigate('/posts');
      await completeTask(taskId, { page: 'posts' });
      toast.success('تم الانتقال إلى صفحة المنشورات');
    } catch (error) {
      console.error('Error navigating to posts:', error);
      toast.error('فشل في الانتقال إلى صفحة المنشورات');
    }
  }
});
