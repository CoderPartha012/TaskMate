import React from 'react';
import { Task, Status } from '../../types';

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

  const metrics: { label: string; value: number; colorClass: string; onClick: () => void }[] = [
    { label: 'Total Tasks', value: tasks.length, colorClass: 'text-white', onClick: onSelectTotal },
    { label: 'Pending', value: pending, colorClass: 'text-amber-400', onClick: () => onSelectStatus('pending') },
    { label: 'In Progress', value: inProgress, colorClass: 'text-blue-400', onClick: () => onSelectStatus('in-progress') },
    { label: 'Completed', value: completed, colorClass: 'text-jade', onClick: () => onSelectStatus('completed') },
  ];
  if (overdue > 0) {
    metrics.push({ label: 'Overdue', value: overdue, colorClass: 'text-red-500', onClick: onSelectOverdue });
  }

  return (
    <div className="flex flex-wrap items-stretch gap-1">
      {metrics.map((m) => (
        <button
          key={m.label}
          type="button"
          onClick={m.onClick}
          className="flex flex-col items-start gap-1 px-3.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">{m.label}</span>
          <span className={`text-xl font-bold font-display leading-none ${m.colorClass}`}>{m.value}</span>
        </button>
      ))}
    </div>
  );
}
