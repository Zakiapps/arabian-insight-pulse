
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';

interface TaskHistoryItem {
  id: string;
  task_type: string;
  task_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters?: any;
  result?: any;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

export const useTaskHistory = () => {
  const { profile } = useAuth();
  const { createNotification } = useNotifications();
  const [tasks, setTasks] = useState<TaskHistoryItem[]>([]);

  const startTask = async (
    taskType: string,
    taskName: string,
    parameters?: any
  ): Promise<string> => {
    if (!profile?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('task_history')
      .insert({
        user_id: profile.id,
        task_type: taskType,
        task_name: taskName,
        status: 'running',
        parameters,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification for task start
    await createNotification(
      'بدء المهمة',
      `تم بدء تنفيذ ${taskName}`,
      'info'
    );

    fetchTasks();
    return data.id;
  };

  const completeTask = async (
    taskId: string,
    result?: any,
    errorMessage?: string
  ) => {
    const status = errorMessage ? 'failed' : 'completed';
    
    const { error } = await supabase
      .from('task_history')
      .update({
        status,
        result,
        error_message: errorMessage,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) throw error;

    // Get task details for notification
    const { data: task } = await supabase
      .from('task_history')
      .select('task_name')
      .eq('id', taskId)
      .single();

    // Create notification for task completion
    await createNotification(
      status === 'completed' ? 'تم إنجاز المهمة' : 'فشل في المهمة',
      status === 'completed' 
        ? `تم إنجاز ${task?.task_name} بنجاح`
        : `فشل في تنفيذ ${task?.task_name}: ${errorMessage}`,
      status === 'completed' ? 'success' : 'error'
    );

    fetchTasks();
  };

  const fetchTasks = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from('task_history')
      .select('*')
      .eq('user_id', profile.id)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, [profile?.id]);

  return {
    tasks,
    startTask,
    completeTask,
    refreshTasks: fetchTasks
  };
};
