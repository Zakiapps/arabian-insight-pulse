import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, FileText, Brain, Activity, Globe, Users, Target, MessageSquare, Newspaper, ArrowRight } from 'lucide-react';
import ProjectHeader from './ProjectHeader';
import ExtractedNewsList from "@/components/project/ExtractedNewsList";
import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import AnalysisInsightsCard from './AnalysisInsightsCard';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  is_active: boolean;
}

interface AnalysisStats {
  total_analyses: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  arabic_count: number;
  jordanian_dialect_count: number;
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

  // Fetch text analysis stats
  const { data: analysisStats } = useQuery({
    queryKey: ['project-analysis-stats', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      const { data, error } = await supabase.rpc('get_project_analysis_stats', {
        project_id_param: projectId,
      });
      
      if (error) throw error;
      return data[0] as AnalysisStats;
    },
    enabled: !!projectId,
  });

  // Enhanced query to get recent analyses from both sources
  const { data: recentAnalyses } = useQuery({
    queryKey: ['recent-analyses', projectId, newsRefreshKey],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Get recent text analyses
      const { data: textAnalyses, error: textError } = await supabase
        .from('text_analyses')
        .select('id, input_text, sentiment, emotion, dialect, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (textError) throw textError;

      // Get recent news analyses
      const { data: newsAnalyses, error: newsError } = await supabase
        .from('scraped_news')
        .select('id, title, description, sentiment, emotion, dialect, created_at')
        .eq('project_id', projectId)
        .eq('is_analyzed', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (newsError) throw newsError;

      // Combine and format
      const combined = [
        ...(textAnalyses || []).map(analysis => ({
          id: analysis.id,
          input_text: analysis.input_text,
          sentiment: analysis.sentiment,
          emotion: analysis.emotion,
          dialect: analysis.dialect,
          created_at: analysis.created_at,
          type: 'text' as const
        })),
        ...(newsAnalyses || []).map(news => ({
          id: news.id,
          input_text: news.title + (news.description ? '. ' + news.description : ''),
          sentiment: news.sentiment || 'neutral',
          emotion: news.emotion,
          dialect: news.dialect,
          created_at: news.created_at,
          type: 'news' as const
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return combined.slice(0, 15);
    },
    enabled: !!projectId,
  });

  // Fetch text analyses with real-time refresh
  const { data: textAnalyses, refetch: refetchAnalyses } = useQuery({
    queryKey: ['project-text-analyses', projectId, newsRefreshKey],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      const { data, error } = await supabase
        .from('text_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);
      
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
        .from('text_analyses')
        .select('sentiment, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
        .limit(30);
      
      if (error) throw error;
      
      // Group by day for better visualization
      const grouped = data?.reduce((acc: any, analysis) => {
        const date = new Date(analysis.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, positive: 0, negative: 0, neutral: 0, total: 0 };
        }
        acc[date][analysis.sentiment || 'neutral']++;
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

  // Function to trigger refresh of analyses when news is analyzed
  const handleNewsAnalyzed = () => {
    setNewsRefreshKey(prev => prev + 1);
    refetchAnalyses();
  };

  if (projectLoading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Prepare sentiment pie chart data from text analyses
  const sentimentData = [
    { name: 'إيجابي', value: analysisStats?.positive_count || 0, color: '#10b981' },
    { name: 'سلبي', value: analysisStats?.negative_count || 0, color: '#ef4444' },
    { name: 'محايد', value: analysisStats?.neutral_count || 0, color: '#6b7280' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
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
              {isRTL ? 'تحليلات النص' : 'Text Analyses'}
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-200">
              <Brain className="h-4 w-4 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {analysisStats?.total_analyses || 0}
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
              {isRTL ? 'المشاعر الإيجابية' : 'Positive Sentiment'}
            </CardTitle>
            <div className="p-2 rounded-full bg-green-200">
              <TrendingUp className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {analysisStats?.positive_count || 0}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <Target className="h-3 w-3 mr-1" />
              تحليل إيجابي
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              {isRTL ? 'النصوص العربية' : 'Arabic Texts'}
            </CardTitle>
            <div className="p-2 rounded-full bg-purple-200">
              <Globe className="h-4 w-4 text-purple-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {analysisStats?.arabic_count || 0}
            </div>
            <p className="text-xs text-purple-600 flex items-center mt-1">
              <MessageSquare className="h-3 w-3 mr-1" />
              نص عربي
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              {isRTL ? 'اللهجة الأردنية' : 'Jordanian Dialect'}
            </CardTitle>
            <div className="p-2 rounded-full bg-orange-200">
              <Users className="h-4 w-4 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {analysisStats?.jordanian_dialect_count || 0}
            </div>
            <p className="text-xs text-orange-600 flex items-center mt-1">
              <Globe className="h-3 w-3 mr-1" />
              نص أردني
            </p>
          </CardContent>
        </Card>
      </div>

      {/* New Analysis Insights Card */}
      <AnalysisInsightsCard 
        projectId={project.id}
        stats={analysisStats}
        recentAnalyses={recentAnalyses}
      />

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
      <ExtractedNewsList 
        projectId={project.id} 
        key={newsRefreshKey} 
        onAnalysisComplete={handleNewsAnalyzed}
      />

      {/* Recent Analyses - Enhanced */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            التحليلات الأخيرة
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = `/projects/${project.id}/analyses`}
              className="mr-auto"
            >
              عرض الكل
              <ArrowRight className="h-4 w-4 mr-1" />
            </Button>
          </CardTitle>
          <CardDescription>
            عرض شامل لجميع تحليلات النص والأخبار في المشروع
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAnalyses && recentAnalyses.length > 0 ? (
            <div className="space-y-4">
              {recentAnalyses.slice(0, 8).map((analysis: any) => (
                <div key={analysis.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {analysis.type === 'news' ? (
                        <Newspaper className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      )}
                      <span className="font-medium">
                        تحليل #{analysis.id.slice(0, 8)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {analysis.type === 'news' ? 'أخبار' : 'نص مباشر'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={
                        analysis.sentiment === 'positive' ? 'default' : 
                        analysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                      }>
                        {analysis.sentiment === 'positive' ? 'إيجابي' :
                         analysis.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                      </Badge>
                      {analysis.emotion && (
                        <Badge variant="outline" className="text-xs">
                          {analysis.emotion}
                        </Badge>
                      )}
                      {analysis.dialect === 'jordanian' && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          🇯🇴 أردني
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {analysis.input_text?.slice(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      نوع التحليل: {analysis.type === 'news' ? 'تحليل أخبار' : 'تحليل نص مباشر'}
                    </span>
                    <span>
                      {new Date(analysis.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              ))}
              {recentAnalyses.length > 8 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = `/projects/${project.id}/analyses`}
                  >
                    عرض المزيد ({recentAnalyses.length - 8} تحليل إضافي)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                لا توجد تحليلات متاحة
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDashboard;
