import React from 'react';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { TASK_TYPE_SHORT } from './TaskTypeSelector';

export type RepoSortKey =
  | 'id' | 'title' | 'taskType' | 'status' | 'priority'
  | 'assignee' | 'createdBy' | 'createdAt' | 'dueDate' | 'lastModified';

interface RepositoryTableProps {
  tasks: Task[];
  sortKey: RepoSortKey;
  sortDir: 'asc' | 'desc';
  onSort: (key: RepoSortKey) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityStyles: Record<string, string> = {
  high:   'bg-red-500/15   text-red-400   border border-red-500/20',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  low:    'bg-jade/15      text-jade      border border-jade/20',
};

const statusStyles: Record<string, string> = {
  completed:    'bg-jade/15      text-jade',
  'in-progress': 'bg-blue-500/15 text-blue-400',
  pending:      'bg-white/5      text-white/40',
};

const COLUMNS: { key: RepoSortKey; label: string }[] = [
  { key: 'id',          label: 'Task ID' },
  { key: 'title',       label: 'Task Title' },
  { key: 'taskType',    label: 'Task Category' },
  { key: 'status',      label: 'Status' },
  { key: 'priority',    label: 'Priority' },
  { key: 'assignee',    label: 'Assignee' },
  { key: 'createdBy',   label: 'Created By' },
  { key: 'createdAt',   label: 'Created Date' },
  { key: 'dueDate',     label: 'Due Date' },
  { key: 'lastModified', label: 'Last Updated' },
];

function safeDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'MMM d, yyyy');
}

export function RepositoryTable({ tasks, sortKey, sortDir, onSort, onView, onEdit, onDelete }: RepositoryTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-white/30 text-sm border-b border-white/[0.07]">
        No tasks match the current search and filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1100px]">
        <thead>
          <tr className="border-b-2 border-white/[0.12]">
            {COLUMNS.map(({ key, label }) => (
              <th key={key} scope="col" className="p-0">
                <button
                  type="button"
                  onClick={() => onSort(key)}
                  className="w-full flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 hover:text-white/70 px-4 py-3 transition-colors whitespace-nowrap"
                >
                  {label}
                  {sortKey === key ? (
                    sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </button>
              </th>
            ))}
            <th scope="col" className="text-[11px] font-semibold uppercase tracking-widest text-white/40 px-4 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.03] transition-colors"
            >
              <td className="px-4 py-3 text-xs text-white/40 font-mono whitespace-nowrap" title={task.id}>
                {task.id.slice(0, 8)}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-white/85 max-w-[220px] truncate" title={task.title}>
                {task.title}
              </td>
              <td className="px-4 py-3">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-white/50 uppercase tracking-wide whitespace-nowrap">
                  {TASK_TYPE_SHORT[task.taskType]}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap ${statusStyles[task.status]}`}>
                  {task.status.replace('-', ' ')}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${priorityStyles[task.priority]}`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-white/55 max-w-[160px] truncate">
                {task.assignees.length > 0 ? task.assignees.join(', ') : '—'}
              </td>
              <td className="px-4 py-3 text-xs text-white/45 whitespace-nowrap">{task.createdBy}</td>
              <td className="px-4 py-3 text-xs text-white/45 whitespace-nowrap">{safeDate(task.createdAt)}</td>
              <td className="px-4 py-3 text-xs text-white/45 whitespace-nowrap">{safeDate(task.dueDate)}</td>
              <td className="px-4 py-3 text-xs text-white/45 whitespace-nowrap">{safeDate(task.lastModified)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onView(task.id)}
                    title="View Task"
                    aria-label="View Task"
                    className="p-1.5 rounded-lg text-white/40 hover:text-jade hover:bg-white/5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(task.id)}
                    title="Edit Task"
                    aria-label="Edit Task"
                    className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(task.id)}
                    title="Delete Task"
                    aria-label="Delete Task"
                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
