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
  RefreshCw
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
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
  
  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    }
  });
  
  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName,
          description: newProjectDescription || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    onSuccess: (newProject) => {
      toast({
        title: isRTL ? "تم إنشاء المشروع بنجاح" : "Project created successfully",
      });
      
      // Reset form
      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreateDialogOpen(false);
      
      // Refetch projects
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Navigate to the new project
      navigate(`/projects/${newProject.id}`);
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
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم حذف المشروع بنجاح" : "Project deleted successfully",
      });
      
      // Refetch projects
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
  
  // Handle create project
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
  
  // Handle delete project
  const handleDeleteProject = (projectId: string) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذا المشروع؟" : "Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(projectId);
    }
  };
  
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isRTL ? 'المشاريع' : 'Projects'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'إدارة مشاريع تحليل المحتوى العربي الخاصة بك'
              : 'Manage your Arabic content analysis projects'}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                    ? 'ابدأ بإنشاء مشروعك الأول'
                    : 'Start by creating your first project'}
                </p>
              </>
            )}
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {isRTL ? 'إنشاء مشروع' : 'Create Project'}
              </Button>
            </DialogTrigger>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects?.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="mt-1">
                        {project.description}
                      </CardDescription>
                    )}
                  </div>
                  {!project.is_active && (
                    <Badge variant="secondary">
                      {isRTL ? 'غير نشط' : 'Inactive'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {isRTL ? 'تم الإنشاء في' : 'Created on'} {new Date(project.created_at).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
                <Button 
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="gap-2"
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