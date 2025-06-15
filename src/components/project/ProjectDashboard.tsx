
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, FileText, Brain, Activity, Upload, MessageSquare, Target, Zap } from 'lucide-react';
import ProjectHeader from './ProjectHeader';
import SentimentChart from './SentimentChart';
import DialectDistribution from './DialectDistribution';
import TextSummarizer from './TextSummarizer';
import ExtractedNewsList from "@/components/project/ExtractedNewsList";
import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  is_active: boolean;
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
  const [newsRefreshKey, setNewsRefreshKey] = useState(0);

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
      return data as unknown as ProjectStats;
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

  // Enhanced analytics data
  const { data: timelineData } = useQuery({
    queryKey: ['project-timeline', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('sentiment, created_at')
        .order('created_at', { ascending: true })
        .limit(30);
      
      if (error) throw error;
      
      // Group by day for better visualization
      const grouped = data?.reduce((acc: any, post) => {
        const date = new Date(post.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, positive: 0, negative: 0, neutral: 0, total: 0 };
        }
        acc[date][post.sentiment || 'neutral']++;
        acc[date].total++;
        return acc;
      }, {});
      
      return Object.values(grouped || {}).slice(-14); // Last 14 days
    },
    enabled: !!projectId,
  });

  const handleUpdateProject = async (updateData: { name: string; description: string }) => {
    if (!projectId) return;
    
    const { error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId);
    
    if (error) throw error;
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
  };

  if (projectLoading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Prepare sentiment pie chart data
  const sentimentData = [
    { name: 'إيجابي', value: stats?.sentiment_distribution?.positive || 0, color: '#10b981' },
    { name: 'سلبي', value: stats?.sentiment_distribution?.negative || 0, color: '#ef4444' },
    { name: 'محايد', value: stats?.sentiment_distribution?.neutral || 0, color: '#6b7280' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <ProjectHeader 
        project={project} 
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
      />
      
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              {isRTL ? 'إجمالي التحليلات' : 'Total Analyses'}
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-200">
              <BarChart3 className="h-4 w-4 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {statsLoading ? '...' : stats?.analysis_count || 0}
            </div>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              تحليل مكتمل
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              {isRTL ? 'إجمالي الرفوعات' : 'Total Uploads'}
            </CardTitle>
            <div className="p-2 rounded-full bg-green-200">
              <FileText className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {statsLoading ? '...' : stats?.upload_count || 0}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <Upload className="h-3 w-3 mr-1" />
              ملف مرفوع
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              {isRTL ? 'المشاعر الإيجابية' : 'Positive Sentiment'}
            </CardTitle>
            <div className="p-2 rounded-full bg-purple-200">
              <TrendingUp className="h-4 w-4 text-purple-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {statsLoading ? '...' : stats?.sentiment_distribution?.positive || 0}
            </div>
            <p className="text-xs text-purple-600 flex items-center mt-1">
              <Target className="h-3 w-3 mr-1" />
              منشور إيجابي
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              {isRTL ? 'معدل النشاط' : 'Activity Rate'}
            </CardTitle>
            <div className="p-2 rounded-full bg-orange-200">
              <Activity className="h-4 w-4 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {project.is_active ? '100%' : '0%'}
            </div>
            <p className="text-xs text-orange-600 flex items-center mt-1">
              <Zap className="h-3 w-3 mr-1" />
              {project.is_active ? 'نشط' : 'غير نشط'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              تطور المشاعر عبر الزمن
            </CardTitle>
            <CardDescription>تتبع اتجاهات المشاعر خلال آخر أسبوعين</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineData && timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="url(#positiveGradient)" name="إيجابي" />
                  <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="url(#negativeGradient)" name="سلبي" />
                  <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.3} name="محايد" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد بيانات كافية لعرض الاتجاهات</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              توزيع المشاعر
            </CardTitle>
            <CardDescription>نسب المشاعر في المشروع</CardDescription>
          </CardHeader>
          <CardContent>
            {sentimentData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {sentimentData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد بيانات للعرض</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Extracted News Section */}
      <ExtractedNewsList projectId={project.id} key={newsRefreshKey} />

      {/* Detailed Analysis Tabs */}
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
              <CardTitle>{isRTL ? 'تحليل البيانات التفصيلي' : 'Detailed Data Analysis'}</CardTitle>
              <CardDescription>
                {isRTL ? 'عرض شامل لجميع التحليلات في المشروع' : 'Comprehensive overview of all project analyses'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyses && analyses.length > 0 ? (
                <div className="space-y-4">
                  {analyses.slice(0, 10).map((analysis: any) => (
                    <div key={analysis.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">
                          {isRTL ? 'تحليل' : 'Analysis'} #{analysis.id.slice(0, 8)}
                        </span>
                        <div className="flex gap-2">
                          <Badge variant={
                            analysis.sentiment === 'positive' ? 'default' : 
                            analysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                          }>
                            {analysis.sentiment === 'positive' ? 'إيجابي' :
                             analysis.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                          </Badge>
                          {analysis.sentiment_score && (
                            <Badge variant="outline">
                              {Math.round(analysis.sentiment_score * 100)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {analysis.raw_text?.slice(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {isRTL ? 'المصدر:' : 'Source:'} {analysis.source || 'غير محدد'}
                        </span>
                        <span>
                          {new Date(analysis.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {analyses.length > 10 && (
                    <div className="text-center">
                      <Button variant="outline">
                        عرض المزيد ({analyses.length - 10} تحليل إضافي)
                      </Button>
                    </div>
                  )}
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
          <SentimentChart analyses={analyses || []} />
        </TabsContent>

        <TabsContent value="dialect" className="space-y-4">
          <DialectDistribution analyses={analyses || []} />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <TextSummarizer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDashboard;
