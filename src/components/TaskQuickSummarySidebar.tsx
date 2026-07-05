import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Plus, Eye } from 'lucide-react';
import { Task } from '../types';
import { useTaskStore } from '../store/taskStore';
import { getTaskProgress, getRemainingDays } from '../utils/taskProgress';

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/30';

function safeDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'MMM d, yyyy');
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-b-0">
      <span className={labelClass}>{label}</span>
      <span className="text-xs text-white/70 text-right">{value}</span>
    </div>
  );
}

interface TaskQuickSummarySidebarProps {
  task: Task;
}

export function TaskQuickSummarySidebar({ task }: TaskQuickSummarySidebarProps) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const [watcherInput, setWatcherInput] = useState('');

  const progress = getTaskProgress(task);
  const remainingDays = getRemainingDays(task);
  const watchers = task.watchers ?? [];

  const addWatcher = () => {
    const name = watcherInput.trim();
    if (!name || watchers.includes(name)) return;
    updateTask(task.id, { watchers: [...watchers, name] });
    setWatcherInput('');
  };

  const removeWatcher = (name: string) => {
    updateTask(task.id, { watchers: watchers.filter((w) => w !== name) });
  };

  return (
    <div className="lg:sticky lg:top-24 bg-noir-700 border border-white/[0.06] rounded-xl p-5 space-y-4">
      <h3 className="font-display font-bold text-sm text-white">Quick Summary</h3>

      <div>
        <SummaryRow label="Status" value={<span className="capitalize">{task.status.replace('-', ' ')}</span>} />
        <SummaryRow label="Priority" value={<span className="capitalize">{task.priority}</span>} />
        <SummaryRow label="Assignee" value={task.assignees.length > 0 ? task.assignees.join(', ') : '—'} />
        <SummaryRow label="Created By" value={task.createdBy} />
        <SummaryRow label="Created On" value={safeDate(task.createdAt)} />
        <SummaryRow label="Last Updated" value={safeDate(task.lastModified)} />
        <SummaryRow label="Due Date" value={safeDate(task.dueDate)} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={labelClass}>Progress</span>
          <span className="text-xs font-bold text-jade">{progress}%</span>
        </div>
        <div className="h-[6px] bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-jade rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <SummaryRow
        label="Remaining Days"
        value={remainingDays === null ? '—' : remainingDays < 0 ? `${Math.abs(remainingDays)}d overdue` : `${remainingDays}d`}
      />

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Eye className="w-3 h-3 text-white/30" />
          <span className={labelClass}>Followers / Watchers</span>
        </div>
        {watchers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {watchers.map((w) => (
              <span key={w} className="flex items-center gap-1 text-[10px] bg-noir-600 border border-white/[0.07] rounded-full px-2 py-0.5 text-white/60">
                {w}
                <button type="button" onClick={() => removeWatcher(w)} aria-label={`Remove ${w}`} className="text-white/30 hover:text-red-400">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <input
            type="text"
            value={watcherInput}
            onChange={(e) => setWatcherInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addWatcher(); } }}
            placeholder="Add watcher…"
            className="flex-1 min-w-0 rounded-lg bg-noir-600 text-white/80 text-xs px-2.5 py-1.5 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors placeholder:text-white/25"
          />
          <button
            type="button"
            onClick={addWatcher}
            disabled={!watcherInput.trim()}
            className="p-1.5 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
