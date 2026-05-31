import React from 'react';
import { LayoutGrid, List, Calendar, BarChart2 } from 'lucide-react';
import { ViewMode } from '../types';
import { useTaskStore } from '../store/taskStore';
import { motion } from 'framer-motion';

export function ViewToggle() {
  const { filters, updateFilters } = useTaskStore();

  const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'list',      icon: <List className="w-4 h-4" />,      label: 'List' },
    { mode: 'grid',      icon: <LayoutGrid className="w-4 h-4" />, label: 'Grid' },
    { mode: 'kanban',    icon: <Calendar className="w-4 h-4" />,   label: 'Kanban' },
    { mode: 'analytics', icon: <BarChart2 className="w-4 h-4" />,  label: 'Analytics' },
  ];

  return (
    <div className="flex gap-1">
      {views.map(({ mode, icon, label }) => (
        <motion.button
          key={mode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => updateFilters({ viewMode: mode })}
          title={label}
          className={filters.viewMode === mode
            ? 'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-jade/10 text-jade border border-jade/25'
            : 'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors'}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </motion.button>
      ))}
    </div>
  );
}