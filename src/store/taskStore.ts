import { create } from 'zustand';
import { Task, TaskFilter, ThemeConfig } from '../types';
import { persist } from 'zustand/middleware';

interface TaskState {
  tasks: Task[];
  filters: TaskFilter;
  theme: ThemeConfig;
  history: {
    past: Task[][];
    future: Task[][];
  };
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  archiveTask: (id: string) => void;
  restoreTask: (id: string) => void;
  updateFilters: (filters: Partial<TaskFilter>) => void;
  undo: () => void;
  redo: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      filters: {
        status: 'all',
        priority: 'all',
        category: 'all',
        sortBy: 'dueDate',
        viewMode: 'list',
        showArchived: false,
      },
      theme: {
        accentColor: '#3B82F6',
      },
      history: {
        past: [],
        future: [],
      },
      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          subtasks: [],
          dependencies: [],
          archived: false,
        };
        set((state) => {
          const newTasks = [...state.tasks, task];
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      updateTask: (id, updates) => {
        set((state) => {
          const newTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          );
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      deleteTask: (id) => {
        set((state) => {
          const newTasks = state.tasks.filter((task) => task.id !== id);
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      archiveTask: (id) => {
        set((state) => {
          const newTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, archived: true } : task
          );
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      restoreTask: (id) => {
        set((state) => {
          const newTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, archived: false } : task
          );
          return {
            tasks: newTasks,
            history: {
              past: [...state.history.past, state.tasks],
              future: [],
            },
          };
        });
      },
      updateFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },
      undo: () => {
        set((state) => {
          const previous = state.history.past[state.history.past.length - 1];
          if (!previous) return state;

          const newPast = state.history.past.slice(0, -1);
          return {
            tasks: previous,
            history: {
              past: newPast,
              future: [state.tasks, ...state.history.future],
            },
          };
        });
      },
      redo: () => {
        set((state) => {
          const next = state.history.future[0];
          if (!next) return state;

          const newFuture = state.history.future.slice(1);
          return {
            tasks: next,
            history: {
              past: [...state.history.past, state.tasks],
              future: newFuture,
            },
          };
        });
      },
    }),
    {
      name: 'task-storage',
    }
  )
);