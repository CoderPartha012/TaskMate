import React from 'react';
import { X, Filter } from 'lucide-react';
import { TASK_TYPE_LABELS } from './TaskTypeSelector';
import { RepositoryFilters } from './repositoryFilterTypes';

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/40';
const inputBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';

interface RepositoryFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  draft: RepositoryFilters;
  onDraftChange: (patch: Partial<RepositoryFilters>) => void;
  onApply: () => void;
  onReset: () => void;
  onClearAll: () => void;
}

export function RepositoryFilterDrawer({
  open, onClose, draft, onDraftChange, onApply, onReset, onClearAll,
}: RepositoryFilterDrawerProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-noir-700 border-l border-white/[0.08] z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-jade" aria-hidden="true" />
            Filters
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className={labelClass}>Task ID</label>
            <input
              type="text"
              value={draft.taskId}
              onChange={(e) => onDraftChange({ taskId: e.target.value })}
              placeholder="e.g. a1b2c3d4"
              className={inputBase}
            />
          </div>

          <div>
            <label className={labelClass}>Task Title</label>
            <input
              type="text"
              value={draft.taskTitle}
              onChange={(e) => onDraftChange({ taskTitle: e.target.value })}
              placeholder="Search by title"
              className={inputBase}
            />
          </div>

          <div>
            <label className={labelClass}>Task Category</label>
            <select
              value={draft.taskCategory}
              onChange={(e) => onDraftChange({ taskCategory: e.target.value as RepositoryFilters['taskCategory'] })}
              className={inputBase}
            >
              <option value="">All categories</option>
              {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              value={draft.status}
              onChange={(e) => onDraftChange({ status: e.target.value as RepositoryFilters['status'] })}
              className={inputBase}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Priority</label>
            <select
              value={draft.priority}
              onChange={(e) => onDraftChange({ priority: e.target.value as RepositoryFilters['priority'] })}
              className={inputBase}
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Assignee</label>
            <input
              type="text"
              value={draft.assignee}
              onChange={(e) => onDraftChange({ assignee: e.target.value })}
              placeholder="Name or email"
              className={inputBase}
            />
          </div>

          <div>
            <label className={labelClass}>Created By</label>
            <input
              type="text"
              value={draft.createdBy}
              onChange={(e) => onDraftChange({ createdBy: e.target.value })}
              placeholder="Name"
              className={inputBase}
            />
          </div>

          <div>
            <label className={labelClass}>Created Date (Range)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={draft.createdFrom}
                onChange={(e) => onDraftChange({ createdFrom: e.target.value })}
                aria-label="Created date from"
                className={inputBase}
              />
              <input
                type="date"
                value={draft.createdTo}
                onChange={(e) => onDraftChange({ createdTo: e.target.value })}
                aria-label="Created date to"
                className={inputBase}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Due Date (Range)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={draft.dueFrom}
                onChange={(e) => onDraftChange({ dueFrom: e.target.value })}
                aria-label="Due date from"
                className={inputBase}
              />
              <input
                type="date"
                value={draft.dueTo}
                onChange={(e) => onDraftChange({ dueTo: e.target.value })}
                aria-label="Due date to"
                className={inputBase}
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/[0.07] space-y-2">
          <button
            type="button"
            onClick={onApply}
            className="w-full text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors"
          >
            Apply Filter
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 text-xs font-semibold px-4 py-2 rounded-lg border border-white/[0.1] text-white/60 hover:text-white transition-colors"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="flex-1 text-xs font-semibold px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
