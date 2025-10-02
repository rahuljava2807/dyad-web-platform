import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
  isNew?: boolean;
  isModified?: boolean;
}

export interface Project {
  id: string;
  name: string;
  industry: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  files: ProjectFile[];
  yaviNamespace?: string;
  status: 'draft' | 'generating' | 'generated' | 'deployed';
  prompt?: string;
  settings?: {
    useYaviContext: boolean;
    selectedProvider?: string;
  };
}

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createProject: (name: string, industry: string, description?: string) => Project;
  selectProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectFiles: (id: string, files: ProjectFile[]) => void;
  updateProjectStatus: (id: string, status: Project['status']) => void;
  deleteProject: (id: string) => void;
  clearCurrentProject: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      createProject: (name, industry, description) => {
        const newProject: Project = {
          id: `project-${Date.now()}`,
          name,
          industry,
          description,
          createdAt: new Date(),
          updatedAt: new Date(),
          files: [],
          status: 'draft'
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
          error: null
        }));

        return newProject;
      },

      selectProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        set({
          currentProject: project || null,
          error: project ? null : 'Project not found'
        });
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date() }
              : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates, updatedAt: new Date() }
              : state.currentProject
        }));
      },

      updateProjectFiles: (id, files) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, files, updatedAt: new Date(), status: 'generated' as const }
              : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, files, updatedAt: new Date(), status: 'generated' as const }
              : state.currentProject
        }));
      },

      updateProjectStatus: (id, status) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, status, updatedAt: new Date() } : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, status, updatedAt: new Date() }
              : state.currentProject
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
          error: null
        }));
      },

      clearCurrentProject: () => {
        set({ currentProject: null });
      },

      setError: (error) => {
        set({ error });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      }
    }),
    {
      name: 'yavi-studio-projects',
      partialize: (state) => ({
        projects: state.projects,
        // Don't persist currentProject, isLoading, or error
      })
    }
  )
);
