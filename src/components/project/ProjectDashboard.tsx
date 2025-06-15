
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, FileText, Brain } from 'lucide-react';
import ProjectHeader from './ProjectHeader';
import SentimentChart from './SentimentChart';
import DialectDistribution from './DialectDistribution';
import TextSummarizer from './TextSummarizer';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface ProjectStats {
  upload_count: number;
  analysis_count: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

const ProjectDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { isRTL } = useLanguage();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    enabled: !!projectId,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['project-stats', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      const { data, error } = await supabase.rpc('get_project_stats', {
        project_id_param: projectId,
      });
      
      if (error) throw error;
      return data as ProjectStats;
    },
    enabled: !!projectId,
  });

  const { data: analyses } = useQuery({
    queryKey: ['project-analyses', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      const { data, error } = await supabase.rpc('get_project_analyses', {
        project_id_param: projectId,
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });

  if (projectLoading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <ProjectHeader project={project} />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'إجمالي التحليلات' : 'Total Analyses'}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.analysis_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'إجمالي الرفوعات' : 'Total Uploads'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.upload_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'المشاعر الإيجابية' : 'Positive Sentiment'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.sentiment_distribution?.positive || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">
            {isRTL ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
          <TabsTrigger value="sentiment">
            {isRTL ? 'المشاعر' : 'Sentiment'}
          </TabsTrigger>
          <TabsTrigger value="dialect">
            {isRTL ? 'اللهجات' : 'Dialects'}
          </TabsTrigger>
          <TabsTrigger value="summary">
            {isRTL ? 'الملخصات' : 'Summaries'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'تحليل البيانات' : 'Data Analysis'}</CardTitle>
              <CardDescription>
                {isRTL ? 'عرض شامل لتحليل البيانات' : 'Comprehensive data analysis overview'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyses && analyses.length > 0 ? (
                <div className="space-y-4">
                  {analyses.slice(0, 5).map((analysis: any) => (
                    <div key={analysis.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">
                          {isRTL ? 'تحليل' : 'Analysis'} #{analysis.id.slice(0, 8)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          analysis.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                          analysis.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {analysis.sentiment}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {analysis.raw_text?.slice(0, 100)}...
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {isRTL ? 'المصدر:' : 'Source:'} {analysis.source} | 
                        {isRTL ? ' النتيجة:' : ' Score:'} {analysis.sentiment_score?.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'لا توجد تحليلات متاحة' : 'No analyses available'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <SentimentChart data={stats?.sentiment_distribution} />
        </TabsContent>

        <TabsContent value="dialect" className="space-y-4">
          <DialectDistribution analyses={analyses || []} />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <TextSummarizer projectId={projectId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDashboard;
