import React from 'react';
import { TaskFilter } from '../types';
import { useTaskStore } from '../store/taskStore';

const STATUS_OPTIONS: { value: TaskFilter['status']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: TaskFilter['priority']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const CATEGORY_OPTIONS: { value: TaskFilter['category']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'other', label: 'Other' },
];

const SORT_OPTIONS: { value: TaskFilter['sortBy']; label: string }[] = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'createdAt', label: 'Created' },
  { value: 'estimatedTime', label: 'Est. Time' },
];

export function TaskFilters() {
  const { filters, updateFilters } = useTaskStore();

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-white/30 uppercase tracking-widest w-16">Status</span>
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilters({ status: value })}
            className={filters.status === value
              ? 'text-[11px] font-semibold px-4 py-1.5 rounded-full border border-jade/30 text-jade bg-jade/10'
              : 'text-[11px] font-semibold px-4 py-1.5 rounded-full border border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/65 transition-colors'}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-white/30 uppercase tracking-widest w-16">Priority</span>
        {PRIORITY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilters({ priority: value })}
            className={filters.priority === value
              ? 'text-[11px] font-semibold px-4 py-1.5 rounded-full border border-jade/30 text-jade bg-jade/10'
              : 'text-[11px] font-semibold px-4 py-1.5 rounded-full border border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/65 transition-colors'}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-white/30 uppercase tracking-widest w-16">Category</span>
        {CATEGORY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilters({ category: value })}
            className={filters.category === value
              ? 'text-[11px] font-semibold px-4 py-1.5 rounded-full border border-jade/30 text-jade bg-jade/10'
              : 'text-[11px] font-semibold px-4 py-1.5 rounded-full border border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/65 transition-colors'}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-white/30 uppercase tracking-widest w-16">Sort</span>
        {SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilters({ sortBy: value })}
            className={filters.sortBy === value
              ? 'text-[11px] font-semibold px-4 py-1.5 rounded-full border border-jade/30 text-jade bg-jade/10'
              : 'text-[11px] font-semibold px-4 py-1.5 rounded-full border border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/65 transition-colors'}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
