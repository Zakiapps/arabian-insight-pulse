import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProjectDashboard from '@/components/project/ProjectDashboard';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  
  // Fetch project details
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    retry: false
  });
  
  // Handle error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-bold mb-2">
          {isRTL ? 'خطأ في تحميل المشروع' : 'Error Loading Project'}
        </h2>
        <p className="text-muted-foreground mb-4">
          {(error as Error).message}
        </p>
        <button 
          onClick={() => window.history.back()}
          className="text-primary hover:underline"
        >
          {isRTL ? 'العودة إلى المشاريع' : 'Back to Projects'}
        </button>
      </div>
    );
  }
  
  // Loading state
  if (isLoading || !projectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  return <ProjectDashboard projectId={projectId} />;
};

export default ProjectPage;