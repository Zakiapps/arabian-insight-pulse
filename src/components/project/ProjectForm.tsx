
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProject } from '@/contexts/ProjectContext';

const formSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  projectId?: string;
  defaultValues?: {
    name: string;
    description?: string;
  };
  onSuccess?: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  projectId, 
  defaultValues = { name: '', description: '' },
  onSuccess 
}) => {
  const { createProject, updateProject } = useProject();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const onSubmit = async (values: FormValues) => {
    try {
      if (projectId) {
        // Update existing project
        await updateProject(projectId, {
          name: values.name,
          description: values.description,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Create new project
        await createProject(values.name, values.description);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter project description" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          {projectId ? 'Update Project' : 'Create Project'}
        </Button>
      </form>
    </Form>
  );
};

export default ProjectForm;
