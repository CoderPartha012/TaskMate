import React from 'react';
import { QuickFilterKey } from './repositoryFilterTypes';

const QUICK_FILTERS: { key: QuickFilterKey; label: string }[] = [
  { key: 'all', label: 'All Tasks' },
  { key: 'my-tasks', label: 'My Tasks' },
  { key: 'due-today', label: 'Due Today' },
  { key: 'due-week', label: 'Due This Week' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'high-priority', label: 'High Priority' },
  { key: 'completed', label: 'Completed' },
];

interface RepositoryQuickFiltersProps {
  active: QuickFilterKey;
  onSelect: (key: QuickFilterKey) => void;
}

export function RepositoryQuickFilters({ active, onSelect }: RepositoryQuickFiltersProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {QUICK_FILTERS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            active === key
              ? 'bg-jade text-noir-800 border-jade'
              : 'bg-transparent text-white/50 border-white/[0.1] hover:text-white hover:border-white/25'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
