import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface ProjectStats {
  upload_count: number;
  analysis_count: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  dialect_distribution: Record<string, number>;
  source_distribution: Record<string, number>;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  projectStats: ProjectStats | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<string | null>;
  updateProject: (id: string, data: { name?: string; description?: string; is_active?: boolean }) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  setCurrentProject: (project: Project | null) => void;
  fetchProjectStats: (projectId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('get_user_projects');
      
      if (error) throw error;
      
      setProjects(data || []);
      
      // Set current project to the first one if none is selected
      if (!currentProject && data && data.length > 0) {
        setCurrentProject(data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description?: string): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase.rpc('create_project', {
        name_param: name,
        description_param: description || null
      });
      
      if (error) throw error;
      
      toast.success('Project created successfully');
      await fetchProjects();
      return data;
    } catch (err: any) {
      console.error('Error creating project:', err);
      toast.error('Failed to create project');
      return null;
    }
  };

  const updateProject = async (
    id: string, 
    { name, description, is_active }: { name?: string; description?: string; is_active?: boolean }
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('update_project', {
        project_id_param: id,
        name_param: name || null,
        description_param: description || null,
        is_active_param: is_active === undefined ? null : is_active
      });
      
      if (error) throw error;
      
      if (data) {
        toast.success('Project updated successfully');
        await fetchProjects();
        
        // Update current project if it's the one being updated
        if (currentProject && currentProject.id === id) {
          const updatedProject = projects.find(p => p.id === id);
          if (updatedProject) {
            setCurrentProject(updatedProject);
          }
        }
      } else {
        toast.error('Project not found or you do not have permission to update it');
      }
      
      return data;
    } catch (err: any) {
      console.error('Error updating project:', err);
      toast.error('Failed to update project');
      return false;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('delete_project', {
        project_id_param: id
      });
      
      if (error) throw error;
      
      if (data) {
        toast.success('Project deleted successfully');
        
        // If the deleted project is the current one, set current to null
        if (currentProject && currentProject.id === id) {
          setCurrentProject(null);
        }
        
        await fetchProjects();
      } else {
        toast.error('Project not found or you do not have permission to delete it');
      }
      
      return data;
    } catch (err: any) {
      console.error('Error deleting project:', err);
      toast.error('Failed to delete project');
      return false;
    }
  };

  const fetchProjectStats = async (projectId: string) => {
    if (!user || !projectId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_project_stats', {
        project_id_param: projectId
      });
      
      if (error) throw error;
      
      setProjectStats(data);
    } catch (err: any) {
      console.error('Error fetching project stats:', err);
      toast.error('Failed to fetch project statistics');
    }
  };

  // Fetch projects when user changes
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setProjectStats(null);
    }
  }, [user]);

  // Fetch stats when current project changes
  useEffect(() => {
    if (currentProject) {
      fetchProjectStats(currentProject.id);
    } else {
      setProjectStats(null);
    }
  }, [currentProject]);

  const value = {
    projects,
    currentProject,
    projectStats,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    fetchProjectStats
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};