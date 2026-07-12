import React from 'react';
import { motion } from 'framer-motion';
import { List, User, CalendarClock, CalendarDays, AlertTriangle, Flame, CheckCircle2 } from 'lucide-react';
import { QuickFilterKey } from './repositoryFilterTypes';

const QUICK_FILTERS: { key: QuickFilterKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'all', label: 'All Tasks', icon: List },
  { key: 'my-tasks', label: 'My Tasks', icon: User },
  { key: 'due-today', label: 'Due Today', icon: CalendarClock },
  { key: 'due-week', label: 'Due This Week', icon: CalendarDays },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { key: 'high-priority', label: 'High Priority', icon: Flame },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

interface RepositoryQuickFiltersProps {
  active: QuickFilterKey;
  onSelect: (key: QuickFilterKey) => void;
}

export function RepositoryQuickFilters({ active, onSelect }: RepositoryQuickFiltersProps) {
  return (
    <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto">
      {QUICK_FILTERS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-colors ${
              isActive ? 'text-jade bg-jade/5' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.03]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
            {isActive && (
              <motion.div
                layoutId="repoQuickFilterIndicator"
                className="absolute left-0 right-0 -bottom-px h-0.5 bg-jade rounded-full"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
