import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  completedAt: string | null;
  subject: string | null;
  tags: string[];
  order: number;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string | null;
  startTime: string;
  endTime: string | null;
  duration: number;
  focusScore: number | null;
  notes: string | null;
  productivity: number;
  createdAt: string;
}

export interface ProductivityLog {
  id: string;
  date: string;
  studyHours: number;
  tasksCompleted: number;
  focusScore: number;
  pomodoroSessions: number;
  peakHours: number[];
  mood: number | null;
  notes: string | null;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  level: number;
  progress: number;
  targetLevel: number | null;
  notes: string | null;
}

export interface Schedule {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  startDate: string;
  endDate: string;
  hoursPerDay: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  scheduleData: any;
  aiGenerated: boolean;
  createdAt: string;
}

export type PageType = 
  | 'dashboard' 
  | 'planner' 
  | 'tasks' 
  | 'productivity' 
  | 'insights' 
  | 'analytics' 
  | 'settings';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Navigation
  currentPage: PageType;
  sidebarOpen: boolean;
  
  // Tasks
  tasks: Task[];
  tasksLoading: boolean;
  taskFilters: {
    status: string;
    priority: string;
    subject: string;
    search: string;
  };
  
  // Study Sessions
  studySessions: StudySession[];
  
  // Productivity
  productivityLogs: ProductivityLog[];
  currentPomodoro: {
    isRunning: boolean;
    type: 'work' | 'break';
    timeLeft: number;
    totalDuration: number;
    sessionsCompleted: number;
  };
  
  // Skills
  skills: Skill[];
  
  // Schedules
  schedules: Schedule[];
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  
  // Actions
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setCurrentPage: (page: PageType) => void;
  setSidebarOpen: (open: boolean) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskFilters: (filters: Partial<AppState['taskFilters']>) => void;
  setStudySessions: (sessions: StudySession[]) => void;
  setProductivityLogs: (logs: ProductivityLog[]) => void;
  updatePomodoro: (updates: Partial<AppState['currentPomodoro']>) => void;
  resetPomodoro: () => void;
  setSkills: (skills: Skill[]) => void;
  setSchedules: (schedules: Schedule[]) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  logout: () => void;
}

const defaultPomodoro = {
  isRunning: false,
  type: 'work' as const,
  timeLeft: 25 * 60, // 25 minutes in seconds
  totalDuration: 25 * 60,
  sessionsCompleted: 0,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      currentPage: 'dashboard',
      sidebarOpen: true,
      
      tasks: [],
      tasksLoading: false,
      taskFilters: {
        status: 'all',
        priority: 'all',
        subject: 'all',
        search: '',
      },
      
      studySessions: [],
      
      productivityLogs: [],
      currentPomodoro: defaultPomodoro,
      
      skills: [],
      schedules: [],
      
      theme: 'system',
      
      notifications: [],
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setIsLoading: (value) => set({ isLoading: value }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),
      setTaskFilters: (filters) => set((state) => ({
        taskFilters: { ...state.taskFilters, ...filters },
      })),
      
      setStudySessions: (sessions) => set({ studySessions: sessions }),
      setProductivityLogs: (logs) => set({ productivityLogs: logs }),
      
      updatePomodoro: (updates) => set((state) => ({
        currentPomodoro: { ...state.currentPomodoro, ...updates },
      })),
      resetPomodoro: () => set({ currentPomodoro: defaultPomodoro }),
      
      setSkills: (skills) => set({ skills }),
      setSchedules: (schedules) => set({ schedules }),
      
      setTheme: (theme) => set({ theme }),
      
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id, timestamp: Date.now() },
          ],
        }));
        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
      
      logout: () => set({
        user: null,
        isAuthenticated: false,
        tasks: [],
        studySessions: [],
        productivityLogs: [],
        skills: [],
        schedules: [],
        notifications: [],
      }),
    }),
    {
      name: 'study-planner-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        currentPomodoro: state.currentPomodoro,
      }),
    }
  )
);
