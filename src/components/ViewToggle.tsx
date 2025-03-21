import React from 'react';
import { LayoutGrid, List, Calendar } from 'lucide-react';
import { ViewMode } from '../types';
import { useTaskStore } from '../store/taskStore';
import { motion } from 'framer-motion';

export function ViewToggle() {
  const { filters, updateFilters } = useTaskStore();

  const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'list', icon: <List className="w-5 h-5" />, label: 'List' },
    { mode: 'grid', icon: <LayoutGrid className="w-5 h-5" />, label: 'Grid' },
    { mode: 'kanban', icon: <Calendar className="w-5 h-5" />, label: 'Kanban' }
  ];

  return (
    <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
      {views.map(({ mode, icon, label }) => (
        <motion.button
          key={mode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => updateFilters({ viewMode: mode })}
          className={`flex items-center px-3 py-2 rounded-md transition-colors ${
            filters.viewMode === mode
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {icon}
          <span className="ml-2">{label}</span>
        </motion.button>
      ))}
    </div>
  );
}