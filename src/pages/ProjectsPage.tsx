
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Folder, 
  BarChart3, 
  Calendar, 
  ArrowRight, 
  Trash2, 
  Edit, 
  Search,
  RefreshCw,
  Upload,
  Activity,
  TrendingUp,
  Globe,
  Target,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface Project {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  upload_count: number;
  analysis_count: number;
  created_at: string;
  updated_at: string;
}

const ProjectsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch projects with enhanced statistics
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_projects');
      if (error) throw error;
      return data as Project[];
    }
  });

  // Fetch project analytics summary
  const { data: projectAnalytics } = useQuery({
    queryKey: ['project-analytics'],
    queryFn: async () => {
      if (!projects || projects.length === 0) return null;
      
      // Get analytics for each project
      const analyticsPromises = projects.slice(0, 5).map(async (project) => {
        const { data: posts } = await supabase
          .from('analyzed_posts')
          .select('sentiment, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        
        const positiveCount = posts?.filter(p => p.sentiment === 'positive').length || 0;
        const totalCount = posts?.length || 0;
        const sentimentScore = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;
        
        return {
          name: project.name.substring(0, 10) + '...',
          uploads: project.upload_count || 0,
          analyses: project.analysis_count || 0,
          sentiment: sentimentScore
        };
      });
      
      return Promise.all(analyticsPromises);
    },
    enabled: !!projects && projects.length > 0
  });
  
  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('create_project', {
        name_param: newProjectName,
        description_param: newProjectDescription || null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (projectId) => {
      toast({
        title: isRTL ? "تم إنشاء المشروع بنجاح" : "Project created successfully",
      });
      
      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      if (projectId) {
        navigate(`/projects/${projectId}`);
      }
    },
    onError: (error) => {
      toast({
        title: isRTL ? "فشل في إنشاء المشروع" : "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { data, error } = await supabase.rpc('delete_project', {
        project_id_param: projectId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (success) => {
      if (success) {
        toast({
          title: isRTL ? "تم حذف المشروع بنجاح" : "Project deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
    },
    onError: (error) => {
      toast({
        title: isRTL ? "فشل في حذف المشروع" : "Failed to delete project",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter projects based on search term
  const filteredProjects = projects?.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: isRTL ? "اسم المشروع مطلوب" : "Project name is required",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate();
  };
  
  const handleDeleteProject = (projectId: string) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذا المشروع؟" : "Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  // Calculate summary statistics
  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.is_active)?.length || 0;
  const totalUploads = projects?.reduce((sum, p) => sum + (p.upload_count || 0), 0) || 0;
  const totalAnalyses = projects?.reduce((sum, p) => sum + (p.analysis_count || 0), 0) || 0;
  
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Enhanced Header with Statistics */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {isRTL ? 'إدارة المشاريع' : 'Project Management'}
              <Activity className="h-8 w-8 text-primary" />
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'إدارة مشاريع تحليل المحتوى العربي والذكاء الاصطناعي'
                : 'Manage your Arabic content analysis and AI projects'}
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                {isRTL ? 'مشروع جديد' : 'New Project'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isRTL ? 'إنشاء مشروع جديد' : 'Create New Project'}
                </DialogTitle>
                <DialogDescription>
                  {isRTL 
                    ? 'أدخل تفاصيل المشروع الجديد الخاص بك'
                    : 'Enter details for your new project'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {isRTL ? 'اسم المشروع' : 'Project Name'}
                  </Label>
                  <Input 
                    id="name" 
                    placeholder={isRTL ? "أدخل اسم المشروع" : "Enter project name"}
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {isRTL ? 'وصف المشروع (اختياري)' : 'Project Description (Optional)'}
                  </Label>
                  <Textarea 
                    id="description" 
                    placeholder={isRTL ? "أدخل وصف المشروع" : "Enter project description"}
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                    </>
                  ) : (
                    isRTL ? 'إنشاء المشروع' : 'Create Project'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-r-4 border-r-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {activeProjects} مشروع نشط
              </p>
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الرفوعات</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUploads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ملف مرفوع
              </p>
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي التحليلات</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAnalyses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                تحليل مكتمل
              </p>
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل النشاط</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                من المشاريع نشطة
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Chart */}
      {projectAnalytics && projectAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              تحليل أداء المشاريع
            </CardTitle>
            <CardDescription>مقارنة المشاريع من حيث الرفوعات والتحليلات ونسبة المشاعر الإيجابية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="uploads" fill="#3b82f6" name="الرفوعات" />
                <Bar dataKey="analyses" fill="#10b981" name="التحليلات" />
                <Bar dataKey="sentiment" fill="#f59e0b" name="المشاعر الإيجابية %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={isRTL ? "البحث في المشاريع..." : "Search projects..."}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredProjects?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            {searchTerm ? (
              <>
                <h3 className="text-lg font-medium mb-2">
                  {isRTL ? 'لا توجد مشاريع تطابق بحثك' : 'No projects match your search'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isRTL 
                    ? 'حاول تعديل مصطلحات البحث الخاصة بك'
                    : 'Try adjusting your search terms'}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">
                  {isRTL ? 'لا توجد مشاريع بعد' : 'No projects yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isRTL 
                    ? 'ابدأ بإنشاء مشروعك الأول لتحليل المحتوى العربي'
                    : 'Start by creating your first project to analyze Arabic content'}
                </p>
              </>
            )}
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-primary to-blue-600">
              <Plus className="mr-2 h-4 w-4" />
              {isRTL ? 'إنشاء مشروع' : 'Create Project'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects?.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-primary" />
                      {project.name}
                    </CardTitle>
                    {project.description && (
                      <CardDescription className="mt-2 line-clamp-2">
                        {project.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {project.is_active ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {isRTL ? 'نشط' : 'Active'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {isRTL ? 'غير نشط' : 'Inactive'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm">
                    <Upload className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="font-medium">{project.upload_count || 0}</span>
                    <span className="text-muted-foreground mr-1">{isRTL ? 'رفع' : 'uploads'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <BarChart3 className="mr-2 h-4 w-4 text-green-500" />
                    <span className="font-medium">{project.analysis_count || 0}</span>
                    <span className="text-muted-foreground mr-1">{isRTL ? 'تحليل' : 'analyses'}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {isRTL ? 'تم الإنشاء في' : 'Created on'} {new Date(project.created_at).toLocaleDateString('ar-SA')}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                  disabled={deleteProjectMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
                <Button 
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="gap-2 bg-gradient-to-r from-primary to-blue-600"
                >
                  {isRTL ? 'عرض المشروع' : 'View Project'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
