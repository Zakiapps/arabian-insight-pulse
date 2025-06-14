import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import ProjectDashboard from '@/components/project/ProjectDashboard';
import BrightDataConfig from '@/components/project/BrightDataConfig';
import NewsApiConfig from '@/components/project/NewsApiConfig';
import TextSummarizer from '@/components/project/TextSummarizer';
import { ArrowLeft, Settings, Globe, Newspaper, FileText } from 'lucide-react';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
      </div>
      
      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            {isRTL ? 'لوحة التحكم' : 'Dashboard'}
          </TabsTrigger>
          <TabsTrigger value="brightdata">
            <Globe className="mr-2 h-4 w-4" />
            BrightData
          </TabsTrigger>
          <TabsTrigger value="newsapi">
            <Newspaper className="mr-2 h-4 w-4" />
            NewsAPI
          </TabsTrigger>
          <TabsTrigger value="summarizer">
            <FileText className="mr-2 h-4 w-4" />
            {isRTL ? 'الملخص' : 'Summarizer'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <ProjectDashboard projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="brightdata">
          <BrightDataConfig projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="newsapi">
          <NewsApiConfig projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="summarizer">
          <TextSummarizer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectPage;