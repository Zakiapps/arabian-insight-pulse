import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Settings, 
  Globe, 
  Newspaper, 
  FileText, 
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Project {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface ProjectHeaderProps {
  project: Project;
  onUpdate: (data: { name: string; description: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}

const ProjectHeader = ({ project, onUpdate, onDelete }: ProjectHeaderProps) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleUpdate = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate({ name, description });
      setIsEditDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete();
      setIsDeleteDialogOpen(false);
      navigate('/projects');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {!project.is_active && (
              <Badge variant="outline">
                {isRTL ? 'غير نشط' : 'Inactive'}
              </Badge>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/projects/${project.id}/config`)}
          >
            <Settings className="mr-2 h-4 w-4" />
            {isRTL ? 'الإعدادات' : 'Settings'}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                {isRTL ? 'تعديل المشروع' : 'Edit Project'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isRTL ? 'حذف المشروع' : 'Delete Project'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'تعديل المشروع' : 'Edit Project'}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'قم بتعديل تفاصيل المشروع' 
                : 'Update project details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {isRTL ? 'اسم المشروع' : 'Project Name'}
              </Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                {isRTL ? 'وصف المشروع' : 'Project Description'}
              </Label>
              <Textarea 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting 
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Project Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'حذف المشروع' : 'Delete Project'}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع البيانات المرتبطة بهذا المشروع.' 
                : 'This action cannot be undone. All data associated with this project will be deleted.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-destructive font-medium">
              {isRTL 
                ? `هل أنت متأكد من حذف "${project.name}"؟` 
                : `Are you sure you want to delete "${project.name}"?`}
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isRTL ? 'جاري الحذف...' : 'Deleting...') 
                : (isRTL ? 'حذف المشروع' : 'Delete Project')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectHeader;