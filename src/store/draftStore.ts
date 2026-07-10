import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskDraft } from '../types/draft.types';

const MAX_DRAFT_AGE_DAYS = 30;

interface DraftState {
  drafts: TaskDraft[];
  saveDraft: (draft: TaskDraft) => void;
  deleteDraft: (id: string) => void;
  getDrafts: () => TaskDraft[];
  loadDraftIntoForm: (id: string) => TaskDraft | undefined;
  expireOldDrafts: () => void;
}

export function sortDraftsByRecency(drafts: TaskDraft[]): TaskDraft[] {
  return [...drafts].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: [],

      saveDraft: (draft) => {
        set((state) => {
          const exists = state.drafts.some((d) => d.id === draft.id);
          const drafts = exists
            ? state.drafts.map((d) => (d.id === draft.id ? draft : d))
            : [...state.drafts, draft];
          return { drafts };
        });
      },

      deleteDraft: (id) => {
        set((state) => ({ drafts: state.drafts.filter((d) => d.id !== id) }));
      },

      getDrafts: () => sortDraftsByRecency(get().drafts),

      loadDraftIntoForm: (id) => get().drafts.find((d) => d.id === id),

      expireOldDrafts: () => {
        const cutoff = Date.now() - MAX_DRAFT_AGE_DAYS * 24 * 60 * 60 * 1000;
        set((state) => ({
          drafts: state.drafts.filter((d) => new Date(d.createdAt).getTime() >= cutoff),
        }));
      },
    }),
    { name: 'draft-storage' }
  )
);
