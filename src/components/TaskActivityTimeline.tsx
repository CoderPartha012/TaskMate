import React, { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import {
  PlusCircle, UserPlus, RefreshCw, Pencil, Paperclip,
  MessageSquare, CalendarClock, Sparkles, Workflow, FileSignature,
} from 'lucide-react';
import { ActivityType, Task } from '../types';

const ACTIVITY_ICON: Record<ActivityType, React.ReactNode> = {
  created: <PlusCircle className="w-3.5 h-3.5 text-jade" />,
  assigned: <UserPlus className="w-3.5 h-3.5 text-blue-400" />,
  status_changed: <RefreshCw className="w-3.5 h-3.5 text-blue-400" />,
  metadata_updated: <Pencil className="w-3.5 h-3.5 text-white/50" />,
  attachment_added: <Paperclip className="w-3.5 h-3.5 text-amber-400" />,
  comment_added: <MessageSquare className="w-3.5 h-3.5 text-purple-400" />,
  due_date_changed: <CalendarClock className="w-3.5 h-3.5 text-amber-400" />,
  ai_execution_started: <Sparkles className="w-3.5 h-3.5 text-blue-400" />,
  ai_execution_completed: <Sparkles className="w-3.5 h-3.5 text-jade" />,
  workflow_stage_changed: <Workflow className="w-3.5 h-3.5 text-blue-400" />,
  contract_signed: <FileSignature className="w-3.5 h-3.5 text-jade" />,
};

const IMPORTANT_TYPES = new Set<ActivityType>([
  'created', 'status_changed', 'due_date_changed', 'workflow_stage_changed', 'ai_execution_completed', 'contract_signed',
]);

function dayLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

interface TaskActivityTimelineProps {
  task: Task;
}

export function TaskActivityTimeline({ task }: TaskActivityTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'important'>('all');

  const entries = [...task.activityLog]
    .filter((e) => filter === 'all' || IMPORTANT_TYPES.has(e.type))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  let lastDayLabel = '';

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm text-white">Activity Timeline</h3>
        <div className="flex items-center gap-1 bg-noir-600 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors ${
              filter === 'all' ? 'bg-jade/15 text-jade' : 'text-white/40 hover:text-white/70'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('important')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors ${
              filter === 'important' ? 'bg-jade/15 text-jade' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Important
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-white/30">
          {filter === 'important' ? 'No important activity yet.' : 'No activity yet.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => {
            const entryDate = new Date(entry.timestamp);
            const label = dayLabel(entryDate);
            const showHeader = label !== lastDayLabel;
            lastDayLabel = label;
            return (
              <React.Fragment key={entry.id}>
                {showHeader && (
                  <li aria-hidden="true" className="list-none">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 pt-1 first:pt-0">{label}</p>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">{ACTIVITY_ICON[entry.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70">
                      <span className="font-semibold text-white/85">{entry.user}</span>{' '}
                      {entry.message}
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {format(entryDate, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
}
