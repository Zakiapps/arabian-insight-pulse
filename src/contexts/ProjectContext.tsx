
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  uploadCount: number;
  analysisCount: number;
}

interface ProjectStats {
  uploadCount: number;
  analysisCount: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  projectStats: ProjectStats | null;
  loading: boolean;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  loadProjectStats: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setProjectStats(null);
      setLoading(false);
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_projects');
      
      if (error) throw error;

      const formattedProjects: Project[] = (data || []).map((project: any) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        isActive: project.is_active,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        uploadCount: parseInt(project.upload_count) || 0,
        analysisCount: parseInt(project.analysis_count) || 0,
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description?: string): Promise<Project> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const projectId = await supabase.rpc('create_project', {
        name_param: name,
        description_param: description || null,
      });

      const newProject: Project = {
        id: projectId,
        name,
        description: description || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadCount: 0,
        analysisCount: 0,
      };

      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const success = await supabase.rpc('update_project', {
        project_id_param: id,
        name_param: updates.name,
        description_param: updates.description,
        is_active_param: updates.isActive,
      });

      if (success) {
        setProjects(prev => prev.map(project => 
          project.id === id ? { ...project, ...updates } : project
        ));
        
        if (currentProject?.id === id) {
          setCurrentProject(prev => prev ? { ...prev, ...updates } : null);
        }
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const success = await supabase.rpc('delete_project', {
        project_id_param: id,
      });

      if (success) {
        setProjects(prev => prev.filter(project => project.id !== id));
        
        if (currentProject?.id === id) {
          setCurrentProject(null);
          setProjectStats(null);
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const loadProjectStats = async (projectId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_project_stats', {
        project_id_param: projectId,
      });

      if (error) throw error;

      if (data && typeof data === 'object') {
        const stats = data as any;
        setProjectStats({
          uploadCount: stats.upload_count || 0,
          analysisCount: stats.analysis_count || 0,
          sentimentDistribution: {
            positive: stats.sentiment_distribution?.positive || 0,
            negative: stats.sentiment_distribution?.negative || 0,
            neutral: stats.sentiment_distribution?.neutral || 0,
          },
        });
      }
    } catch (error) {
      console.error('Error loading project stats:', error);
    }
  };

  const refreshProjects = async () => {
    await loadProjects();
  };

  const value = {
    projects,
    currentProject,
    projectStats,
    loading,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    loadProjectStats,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
