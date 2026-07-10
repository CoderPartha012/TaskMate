import React from 'react';
import { Task, Status } from '../types';

interface RepositorySummaryBarProps {
  tasks: Task[];
  onSelectStatus: (status: Status) => void;
  onSelectOverdue: () => void;
  onSelectTotal: () => void;
}

export function RepositorySummaryBar({ tasks, onSelectStatus, onSelectOverdue, onSelectTotal }: RepositorySummaryBarProps) {
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const now = new Date();
  const overdue = tasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < now).length;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs mb-3">
      <button
        type="button"
        onClick={onSelectTotal}
        className="font-semibold text-white/70 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
      >
        Total: <span className="font-bold text-white">{tasks.length}</span>
      </button>
      <span className="text-white/15">|</span>
      <button
        type="button"
        onClick={() => onSelectStatus('pending')}
        className="font-semibold text-white/50 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
      >
        Pending: <span className="font-bold text-white/80">{pending}</span>
      </button>
      <span className="text-white/15">|</span>
      <button
        type="button"
        onClick={() => onSelectStatus('in-progress')}
        className="font-semibold text-blue-400/70 hover:text-blue-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
      >
        In Progress: <span className="font-bold text-blue-400">{inProgress}</span>
      </button>
      <span className="text-white/15">|</span>
      <button
        type="button"
        onClick={() => onSelectStatus('completed')}
        className="font-semibold text-jade/70 hover:text-jade transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
      >
        Completed: <span className="font-bold text-jade">{completed}</span>
      </button>
      {overdue > 0 && (
        <>
          <span className="text-white/15">|</span>
          <button
            type="button"
            onClick={onSelectOverdue}
            className="font-semibold text-red-400/80 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            Overdue: <span className="font-bold text-red-400">{overdue}</span>
          </button>
        </>
      )}
    </div>
  );
}
