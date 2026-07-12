import React, { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import {
  PlusCircle, UserPlus, RefreshCw, Pencil, Paperclip,
  MessageSquare, CalendarClock, Sparkles, Workflow, FileSignature,
} from 'lucide-react';
import { ActivityType, Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { getGlobalActivity } from '../../utils/analyticsData';
import { EmptyState } from '../common/analyticsShared';

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

type FeedTab = 'all' | 'status' | 'comments' | 'assignments' | 'ai' | 'contract';

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'status', label: 'Status Changes' },
  { key: 'comments', label: 'Comments' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'ai', label: 'AI Executions' },
  { key: 'contract', label: 'Contract Events' },
];

const TAB_TYPES: Partial<Record<FeedTab, ActivityType[]>> = {
  status: ['status_changed'],
  comments: ['comment_added'],
  assignments: ['assigned'],
  ai: ['ai_execution_started', 'ai_execution_completed'],
  contract: ['contract_signed'],
};

function dayLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

const PAGE_SIZE = 30;

export function AnalyticsActivityFeed({ tasks }: { tasks: Task[] }) {
  const setViewingTaskId = useTaskStore((s) => s.setViewingTaskId);
  const setActiveSection = useTaskStore((s) => s.setActiveSection);

  const [tab, setTab] = useState<FeedTab>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allEntries = getGlobalActivity(tasks, 1000);
  const typeFilter = TAB_TYPES[tab];
  const filtered = typeFilter ? allEntries.filter((e) => typeFilter.includes(e.type)) : allEntries;
  const entries = filtered.slice(0, visibleCount);

  const handleOpenTask = (taskId: string) => {
    setViewingTaskId(taskId);
    setActiveSection('task-detail');
  };

  let lastDayLabel = '';

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <p className="font-display font-bold text-sm text-white/80">Recent Activity Timeline</p>
      <p className="text-[10px] text-white/35 mt-0.5 mb-3">Latest events across all tasks</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setTab(key); setVisibleCount(PAGE_SIZE); }}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
              tab === key ? 'bg-jade/15 text-jade' : 'text-white/40 hover:text-white/70 bg-white/[0.04]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState label={tab === 'all' ? 'No activity yet' : 'No matching activity yet'} />
      ) : (
        <>
          <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
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
                        <span className="text-white/35">
                          {' · '}
                          <button
                            type="button"
                            onClick={() => handleOpenTask(entry.taskId)}
                            className="hover:text-jade transition-colors underline decoration-dotted underline-offset-2"
                          >
                            {entry.taskTitle}
                          </button>
                        </span>
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
          {filtered.length > entries.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="w-full text-center text-[11px] font-semibold text-jade hover:text-jade-light transition-colors mt-3"
            >
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
}
