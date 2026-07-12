import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskType } from '../types';

export interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  category?: TaskType;
  favorite: boolean;
  isTemplate: boolean;
  createdAt: string;
}

interface PromptLibraryState {
  prompts: SavedPrompt[];
  addPrompt: (prompt: Omit<SavedPrompt, 'id' | 'createdAt'>) => void;
  updatePrompt: (id: string, updates: Partial<SavedPrompt>) => void;
  deletePrompt: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

export const usePromptLibraryStore = create<PromptLibraryState>()(
  persist(
    (set) => ({
      prompts: [],

      addPrompt: (prompt) => {
        set((state) => ({
          prompts: [
            { ...prompt, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
            ...state.prompts,
          ],
        }));
      },

      updatePrompt: (id, updates) => {
        set((state) => ({
          prompts: state.prompts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      deletePrompt: (id) => {
        set((state) => ({ prompts: state.prompts.filter((p) => p.id !== id) }));
      },

      toggleFavorite: (id) => {
        set((state) => ({
          prompts: state.prompts.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)),
        }));
      },
    }),
    { name: 'prompt-library-storage' }
  )
);
