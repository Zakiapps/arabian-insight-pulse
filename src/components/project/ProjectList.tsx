import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Calendar, 
  Edit, 
  FileText, 
  Loader2, 
  MoreHorizontal, 
  Plus, 
  Trash2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectListProps {
  onNewProject: () => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  onNewProject, 
  onEditProject, 
  onDeleteProject 
}) => {
  const { projects, currentProject, setCurrentProject, loading } = useProject();
  const { isRTL } = useLanguage();
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isRTL ? 'المشاريع' : 'Projects'}
        </h2>
        <Button onClick={onNewProject}>
          <Plus className="mr-2 h-4 w-4" />
          {isRTL ? 'مشروع جديد' : 'New Project'}
        </Button>
      </div>
      
      {projects.length === 0 ? (
        <Card className="text-center p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">
              {isRTL ? 'لا توجد مشاريع' : 'No Projects Yet'}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {isRTL 
                ? 'قم بإنشاء مشروع جديد للبدء في تحليل المحتوى العربي وكشف المشاعر واللهجات.' 
                : 'Create a new project to start analyzing Arabic content, sentiment, and dialects.'}
            </p>
            <Button onClick={onNewProject}>
              <Plus className="mr-2 h-4 w-4" />
              {isRTL ? 'إنشاء مشروع جديد' : 'Create First Project'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                currentProject?.id === project.id ? 'border-primary' : ''
              }`}
              onClick={() => setCurrentProject(project)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {project.name}
                      {!project.is_active && (
                        <Badge variant="outline" className="ml-2">
                          {isRTL ? 'غير نشط' : 'Inactive'}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {project.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project.id);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        {isRTL ? 'تعديل' : 'Edit'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isRTL ? 'حذف' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {project.upload_count} {isRTL ? 'تحميل' : 'uploads'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {project.analysis_count} {isRTL ? 'تحليل' : 'analyses'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {format(new Date(project.created_at), 'PPP', { locale: isRTL ? ar : undefined })}
                </div>
                {currentProject?.id === project.id && (
                  <Badge variant="outline" className="bg-primary/10">
                    {isRTL ? 'نشط' : 'Active'}
                  </Badge>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;