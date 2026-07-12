import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColumnConfig, DEFAULT_COLUMNS, GroupByKey, RepoSortKey } from '../components/repository/repositoryColumnTypes';
import { QuickFilterKey, RepositoryFilters, isFiltersEmpty } from '../components/repository/repositoryFilterTypes';

export interface SavedView {
  id: string;
  name: string;
  filters: RepositoryFilters;
  quickFilter: QuickFilterKey;
  sortKey: RepoSortKey;
  sortDir: 'asc' | 'desc';
  groupByKey: GroupByKey | null;
  createdAt: string;
}

export interface SavedFilterPreset {
  id: string;
  name: string;
  filters: RepositoryFilters;
  createdAt: string;
}

const MAX_RECENT_FILTERS = 5;

interface RepositoryViewState {
  columns: ColumnConfig[];
  savedViews: SavedView[];
  savedFilterPresets: SavedFilterPreset[];
  recentFilters: RepositoryFilters[];

  toggleColumnVisibility: (key: RepoSortKey) => void;
  moveColumn: (key: RepoSortKey, direction: 'up' | 'down') => void;
  setColumnWidth: (key: RepoSortKey, width: number) => void;
  resetColumns: () => void;

  saveView: (view: Omit<SavedView, 'id' | 'createdAt'>) => void;
  deleteView: (id: string) => void;

  saveFilterPreset: (preset: Omit<SavedFilterPreset, 'id' | 'createdAt'>) => void;
  deleteFilterPreset: (id: string) => void;

  pushRecentFilter: (filters: RepositoryFilters) => void;
}

export const useRepositoryViewStore = create<RepositoryViewState>()(
  persist(
    (set) => ({
      columns: DEFAULT_COLUMNS,
      savedViews: [],
      savedFilterPresets: [],
      recentFilters: [],

      toggleColumnVisibility: (key) => {
        set((state) => ({
          columns: state.columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)),
        }));
      },

      moveColumn: (key, direction) => {
        set((state) => {
          const index = state.columns.findIndex((c) => c.key === key);
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (index === -1 || targetIndex < 0 || targetIndex >= state.columns.length) return state;

          const columns = [...state.columns];
          [columns[index], columns[targetIndex]] = [columns[targetIndex], columns[index]];
          return { columns };
        });
      },

      setColumnWidth: (key, width) => {
        set((state) => ({
          columns: state.columns.map((c) => (c.key === key ? { ...c, width: Math.max(60, width) } : c)),
        }));
      },

      resetColumns: () => set({ columns: DEFAULT_COLUMNS }),

      saveView: (view) => {
        set((state) => ({
          savedViews: [
            ...state.savedViews,
            { ...view, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        }));
      },

      deleteView: (id) => {
        set((state) => ({ savedViews: state.savedViews.filter((v) => v.id !== id) }));
      },

      saveFilterPreset: (preset) => {
        set((state) => ({
          savedFilterPresets: [
            ...state.savedFilterPresets,
            { ...preset, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        }));
      },

      deleteFilterPreset: (id) => {
        set((state) => ({ savedFilterPresets: state.savedFilterPresets.filter((p) => p.id !== id) }));
      },

      pushRecentFilter: (filters) => {
        if (isFiltersEmpty(filters)) return;
        set((state) => {
          const withoutDup = state.recentFilters.filter(
            (f) => JSON.stringify(f) !== JSON.stringify(filters)
          );
          return { recentFilters: [filters, ...withoutDup].slice(0, MAX_RECENT_FILTERS) };
        });
      },
    }),
    {
      name: 'repository-view-storage',
      migrate: (persistedState) => {
        const state = persistedState as RepositoryViewState;
        if (!state?.columns || state.columns.length === 0) {
          state.columns = DEFAULT_COLUMNS;
        }
        if (!state?.savedViews) state.savedViews = [];
        if (!state?.savedFilterPresets) state.savedFilterPresets = [];
        if (!state?.recentFilters) state.recentFilters = [];
        return state;
      },
    }
  )
);
