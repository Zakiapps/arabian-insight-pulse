
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const createAlertActions = (user: User, navigate: ReturnType<typeof useNavigate>, { startTask, completeTask }: ReturnType<typeof useTaskHistory>) => ({
  setupAlert: async () => {
    console.log('Setup alert button clicked');
    
    try {
      const taskId = await startTask('alert_setup', 'إعداد تنبيه جديد');
      
      // Create a default alert
      const { data: alertData, error } = await supabase
        .from('user_alerts')
        .insert({
          user_id: user.id,
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
  }
});
