
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import ConfigTabs from './ConfigTabs';
import { ArrowLeft, Settings } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const ProjectConfigPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  
  // Temporarily disabled until projects table is created
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      // Temporarily return mock data until projects table is created
      return {
        id: projectId,
        name: 'Sample Project',
        description: 'Sample project description',
        created_at: new Date().toISOString()
      } as Project;
      
      // Original code commented out until projects table exists:
      // const { data, error } = await supabase
      //   .from('projects')
      //   .select('*')
      //   .eq('id', projectId)
      //   .single();
      // 
      // if (error) throw error;
      // return data as Project;
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
        <Button 
          onClick={() => navigate('/projects')}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isRTL ? 'العودة إلى المشاريع' : 'Back to Projects'}
        </Button>
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
  
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إعدادات المشروع' : 'Project Settings'}
            </p>
          </div>
        </div>
      </div>
      
      <ConfigTabs projectId={projectId} />
    </div>
  );
};

export default ProjectConfigPage;
