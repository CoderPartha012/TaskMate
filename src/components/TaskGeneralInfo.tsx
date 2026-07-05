import React from 'react';
import { format } from 'date-fns';
import { Task, Priority, Status, Category } from '../types';
import { getTaskProgress, getRemainingDays, getEstimatedHours, getActualHours } from '../utils/taskProgress';
import { GeneralDraft } from './taskDetailTypes';

const inputBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/30';

function safeDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'MMM d, yyyy');
}

interface FieldRowProps {
  label: string;
  value: React.ReactNode;
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-b-0">
      <span className={labelClass}>{label}</span>
      <span className="text-xs text-white/70 text-right">{value}</span>
    </div>
  );
}

interface TaskGeneralInfoProps {
  task: Task;
  editing: boolean;
  draft: GeneralDraft;
  onChange: (patch: Partial<GeneralDraft>) => void;
}

export function TaskGeneralInfo({ task, editing, draft, onChange }: TaskGeneralInfoProps) {
  const progress = getTaskProgress(task);
  const remainingDays = getRemainingDays(task);
  const estimatedHours = getEstimatedHours(task);
  const actualHours = getActualHours(task);

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <h3 className="font-display font-bold text-sm text-white mb-4">General Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column — editable core fields */}
        <div>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Assignee</label>
                <input
                  type="text"
                  value={draft.assignee}
                  onChange={(e) => onChange({ assignee: e.target.value })}
                  placeholder="Name or email"
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select
                  value={draft.priority}
                  onChange={(e) => onChange({ priority: e.target.value as Priority })}
                  className={inputBase}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={draft.status}
                  onChange={(e) => onChange({ status: e.target.value as Status })}
                  className={inputBase}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => onChange({ startDate: e.target.value })}
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelClass}>Due Date</label>
                <input
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => onChange({ dueDate: e.target.value })}
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={draft.category}
                  onChange={(e) => onChange({ category: e.target.value as Category })}
                  className={inputBase}
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="urgent">Urgent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <FieldRow label="Assignee" value={task.assignees.length > 0 ? task.assignees.join(', ') : '—'} />
              <FieldRow label="Priority" value={<span className="capitalize">{task.priority}</span>} />
              <FieldRow label="Status" value={<span className="capitalize">{task.status.replace('-', ' ')}</span>} />
              <FieldRow label="Start Date" value={safeDate(task.startDate)} />
              <FieldRow label="Due Date" value={safeDate(task.dueDate)} />
              <FieldRow label="Category" value={<span className="capitalize">{task.category}</span>} />
            </div>
          )}
        </div>

        {/* Right column — computed summary fields */}
        <div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className={labelClass}>Progress</span>
              <span className="text-xs font-bold text-jade">{progress}%</span>
            </div>
            <div className="h-[6px] bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-jade rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <FieldRow
            label="Remaining Days"
            value={remainingDays === null ? '—' : remainingDays < 0 ? `${Math.abs(remainingDays)}d overdue` : `${remainingDays}d`}
          />
          <FieldRow label="Estimated Hours" value={estimatedHours != null ? `${estimatedHours}h` : '—'} />
          <FieldRow label="Actual Hours" value={actualHours != null ? `${actualHours}h` : '—'} />
          <FieldRow label="Last Updated" value={safeDate(task.lastModified)} />
        </div>
      </div>
    </div>
  );
}
