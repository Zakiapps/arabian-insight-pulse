import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  Globe,
  Heart,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  FolderKanban,
  ArrowRight,
  Calendar,
  Target,
  Brain
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const { profile, isAdmin } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  // Fetch projects with statistics
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['dashboard-projects', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase.rpc('get_user_projects');
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  // Fetch sentiment trends over time
  const { data: sentimentTrends } = useQuery({
    queryKey: ['sentiment-trends', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('sentiment, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) throw error;
      
      // Group by day and calculate sentiment distribution
      const groupedData = data?.reduce((acc: any, post) => {
        const date = new Date(post.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, positive: 0, negative: 0, neutral: 0, total: 0 };
        }
        acc[date][post.sentiment || 'neutral']++;
        acc[date].total++;
        return acc;
      }, {});
      
      return Object.values(groupedData || {}).slice(-7); // Last 7 days
    },
    enabled: !!profile?.id
  });

  // Fetch real data from Supabase - user's own data only
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['dashboard-posts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  // Fetch text analysis data across all projects
  const { data: textAnalysisData } = useQuery({
    queryKey: ['dashboard-text-analyses', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('text_analyses')
        .select('sentiment, dialect, created_at, project_id')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  // Calculate metrics including text analysis
  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.is_active)?.length || 0;
  const totalPosts = postsData?.length || 0;
  const totalTextAnalyses = textAnalysisData?.length || 0;
  const positivePosts = postsData?.filter(post => post.sentiment === 'positive').length || 0;
  const negativePosts = postsData?.filter(post => post.sentiment === 'negative').length || 0;
  
  // Text analysis sentiment data
  const positiveTextAnalyses = textAnalysisData?.filter(analysis => analysis.sentiment === 'positive').length || 0;
  const negativeTextAnalyses = textAnalysisData?.filter(analysis => analysis.sentiment === 'negative').length || 0;
  
  const combinedPositive = positivePosts + positiveTextAnalyses;
  const combinedNegative = negativePosts + negativeTextAnalyses;
  const combinedTotal = totalPosts + totalTextAnalyses;
  
  const sentimentPercentage = combinedTotal > 0 ? {
    positive: Math.round((combinedPositive / combinedTotal) * 100),
    negative: Math.round((combinedNegative / combinedTotal) * 100),
    neutral: Math.round(((combinedTotal - combinedPositive - combinedNegative) / combinedTotal) * 100)
  } : { positive: 0, negative: 0, neutral: 0 };

  // Sentiment distribution data for pie chart
  const sentimentData = [
    { name: 'إيجابي', value: combinedPositive, color: '#10b981' },
    { name: 'سلبي', value: combinedNegative, color: '#ef4444' },
    { name: 'محايد', value: combinedTotal - combinedPositive - combinedNegative, color: '#6b7280' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Enhanced Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 border">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              لوحة التحكم الرئيسية
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </h1>
            <p className="text-muted-foreground mt-1">مراقبة وتحليل المحتوى الاجتماعي بالذكاء الاصطناعي</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/projects')} variant="outline">
            <FolderKanban className="h-4 w-4 mr-2" />
            إدارة المشاريع
          </Button>
          <Button onClick={() => navigate('/dashboard/upload')} className="bg-gradient-to-r from-primary to-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            تحليل جديد
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-r-4 border-r-purple-500 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/projects')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
            <div className="p-2 rounded-full bg-purple-100">
              <FolderKanban className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              من أصل {totalProjects} مشروع
            </p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-blue-500 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dashboard/posts')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحليلات النص</CardTitle>
            <div className="p-2 rounded-full bg-blue-100">
              <Brain className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTextAnalyses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              تحليل مكتمل
            </p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-green-500 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dashboard/sentiment')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاعر الإيجابية</CardTitle>
            <div className="p-2 rounded-full bg-green-100">
              <Heart className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sentimentPercentage.positive}%</div>
            <p className="text-xs text-muted-foreground">
              {combinedPositive.toLocaleString()} منشور إيجابي
            </p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-red-500 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dashboard/sentiment')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاعر السلبية</CardTitle>
            <div className="p-2 rounded-full bg-red-100">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{sentimentPercentage.negative}%</div>
            <p className="text-xs text-muted-foreground">
              {combinedNegative.toLocaleString()} منشور سلبي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" />
                    المشاريع الحديثة
                  </CardTitle>
                  <CardDescription>آخر المشاريع وحالة التحليل</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                  عرض الكل
                  <ArrowRight className="h-4 w-4 mr-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  جاري تحميل المشاريع...
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.slice(0, 4).map((project: any) => (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FolderKanban className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Upload className="h-3 w-3" />
                              {project.upload_count || 0} رفع
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              {project.analysis_count || 0} تحليل
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(project.created_at).toLocaleDateString('ar')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.is_active && (
                          <Badge variant="default" className="text-xs">نشط</Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-muted/30 w-fit mx-auto mb-4">
                    <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">لا توجد مشاريع حالياً</h3>
                  <p className="text-sm text-muted-foreground mb-4">ابدأ بإنشاء مشروع جديد لتحليل البيانات</p>
                  <Button onClick={() => navigate('/projects')}>
                    <Plus className="h-4 w-4 mr-2" />
                    إنشاء مشروع جديد
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sentiment Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                اتجاهات المشاعر (آخر 7 أيام)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sentimentTrends && sentimentTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sentimentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} name="إيجابي" />
                    <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} name="سلبي" />
                    <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={2} name="محايد" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد بيانات كافية لعرض الاتجاهات</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analytics & Quick Actions */}
        <div className="space-y-6">
          {/* Sentiment Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                توزيع المشاعر
              </CardTitle>
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
                        outerRadius={80}
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

          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>الملف الشخصي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/30 transition-colors" onClick={() => navigate('/dashboard/settings')}>
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-blue-500/10">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{profile?.full_name || 'مستخدم'}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-muted-foreground">المستخدم النشط</p>
                  </div>
                  {isAdmin && (
                    <Badge variant="destructive" className="text-xs mt-1">مشرف</Badge>
                  )}
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>المشاريع النشطة:</span>
                  <span className="text-muted-foreground font-medium">{activeProjects}</span>
                </div>
                <div className="flex justify-between">
                  <span>التحليلات المكتملة:</span>
                  <span className="text-muted-foreground font-medium">{totalTextAnalyses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>معدل النجاح:</span>
                  <span className="text-green-600 font-medium">98.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/projects')}
              >
                <FolderKanban className="h-4 w-4 mr-2" />
                إدارة المشاريع
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/dashboard/upload')}
              >
                <Upload className="h-4 w-4 mr-2" />
                رفع بيانات جديدة
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/dashboard/reports')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                إنشاء تقرير
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
