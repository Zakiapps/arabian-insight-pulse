
import { useNavigate } from 'react-router-dom';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { toast } from 'sonner';
import { dashboardRoutes } from '@/utils/routeUtils';

export const createNavigationAction = (navigate: ReturnType<typeof useNavigate>, { startTask, completeTask }: ReturnType<typeof useTaskHistory>) => ({
  uploadData: async () => {
    console.log('Upload data button clicked');
    
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى صفحة رفع البيانات');
      navigate(dashboardRoutes.upload);
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
      navigate(dashboardRoutes.settings);
      await completeTask(taskId, { page: 'settings' });
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
      navigate(dashboardRoutes.posts);
      await completeTask(taskId, { page: 'posts' });
      toast.success('تم الانتقال إلى صفحة المنشورات');
    } catch (error) {
      console.error('Error navigating to posts:', error);
      toast.error('فشل في الانتقال إلى صفحة المنشورات');
    }
  },

  // New navigation actions for analysis tools
  sentimentAnalysis: async () => {
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى تحليل المشاعر');
      navigate(dashboardRoutes.sentimentAnalysis);
      await completeTask(taskId, { page: 'sentiment-analysis' });
      toast.success('تم الانتقال إلى صفحة تحليل المشاعر');
    } catch (error) {
      console.error('Error navigating to sentiment analysis:', error);
      toast.error('فشل في الانتقال إلى تحليل المشاعر');
    }
  },

  categoryDistribution: async () => {
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى توزيع الفئات');
      navigate(dashboardRoutes.categoryDistribution);
      await completeTask(taskId, { page: 'category-distribution' });
      toast.success('تم الانتقال إلى صفحة توزيع الفئات');
    } catch (error) {
      console.error('Error navigating to category distribution:', error);
      toast.error('فشل في الانتقال إلى توزيع الفئات');
    }
  },

  platformDistribution: async () => {
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى توزيع المنصات');
      navigate(dashboardRoutes.platformDistribution);
      await completeTask(taskId, { page: 'platform-distribution' });
      toast.success('تم الانتقال إلى صفحة توزيع المنصات');
    } catch (error) {
      console.error('Error navigating to platform distribution:', error);
      toast.error('فشل في الانتقال إلى توزيع المنصات');
    }
  },

  topTopics: async () => {
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى أهم المواضيع');
      navigate(dashboardRoutes.topTopics);
      await completeTask(taskId, { page: 'top-topics' });
      toast.success('تم الانتقال إلى صفحة أهم المواضيع');
    } catch (error) {
      console.error('Error navigating to top topics:', error);
      toast.error('فشل في الانتقال إلى أهم المواضيع');
    }
  },

  dialectDetection: async () => {
    try {
      const taskId = await startTask('navigation', 'الانتقال إلى كشف اللهجة');
      navigate(dashboardRoutes.dialectDetection);
      await completeTask(taskId, { page: 'dialect-detection' });
      toast.success('تم الانتقال إلى صفحة كشف اللهجة');
    } catch (error) {
      console.error('Error navigating to dialect detection:', error);
      toast.error('فشل في الانتقال إلى كشف اللهجة');
    }
  }
});
