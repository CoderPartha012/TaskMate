import React from 'react';
import { format } from 'date-fns';
import {
  PlusCircle, UserPlus, RefreshCw, Pencil, Paperclip,
  MessageSquare, CalendarClock, Sparkles, Workflow, FileSignature,
} from 'lucide-react';
import { ActivityType, Task } from '../types';
import { getGlobalActivity } from '../utils/analyticsData';
import { EmptyState } from './analyticsShared';

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

export function AnalyticsActivityFeed({ tasks }: { tasks: Task[] }) {
  const entries = getGlobalActivity(tasks, 30);

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <p className="font-display font-bold text-sm text-white/80">Recent Activity Timeline</p>
      <p className="text-[10px] text-white/35 mt-0.5 mb-4">Latest events across all tasks</p>

      {entries.length === 0 ? (
        <EmptyState label="No activity yet" />
      ) : (
        <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">{ACTIVITY_ICON[entry.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70">
                  <span className="font-semibold text-white/85">{entry.user}</span>{' '}
                  {entry.message}
                  <span className="text-white/35"> · {entry.taskTitle}</span>
                </p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
