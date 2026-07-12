import React, { useEffect, useRef, useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import {
  Search, Filter, Download,
  PlusCircle, UserPlus, RefreshCw, Pencil, Paperclip,
  MessageSquare, CalendarClock, Sparkles, Workflow, FileSignature,
} from 'lucide-react';
import { ActivityEntry, ActivityType, Task } from '../../types';
import { AssigneeAvatar } from '../common/analyticsShared';

export const ACTIVITY_ICON: Record<ActivityType, React.ReactNode> = {
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

const ACTIVITY_TITLE: Record<ActivityType, string> = {
  created: 'Task Created',
  assigned: 'Assignee Changed',
  status_changed: 'Status Changed',
  metadata_updated: 'Details Updated',
  attachment_added: 'Attachment Added',
  comment_added: 'Comment Added',
  due_date_changed: 'Due Date Changed',
  ai_execution_started: 'AI Execution Started',
  ai_execution_completed: 'AI Execution Completed',
  workflow_stage_changed: 'Workflow Stage Changed',
  contract_signed: 'Contract Event',
};

const ACTIVITY_TYPES = Object.keys(ACTIVITY_TITLE) as ActivityType[];

function dayLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return 'Earlier';
}

function groupByDay(entries: ActivityEntry[]): { label: string; entries: ActivityEntry[] }[] {
  const groups: { label: string; entries: ActivityEntry[] }[] = [];
  entries.forEach((entry) => {
    const label = dayLabel(new Date(entry.timestamp));
    let group = groups.find((g) => g.label === label);
    if (!group) {
      group = { label, entries: [] };
      groups.push(group);
    }
    group.entries.push(entry);
  });
  return groups;
}

function escapeCSV(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function exportLogsToCSV(entries: ActivityEntry[], taskTitle: string) {
  const header = ['Timestamp', 'Type', 'User', 'Message'];
  const rows = entries.map((e) => [e.timestamp, e.type, e.user, e.message].map(escapeCSV));
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${taskTitle.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-activity-log.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface TaskLogsTabProps {
  task: Task;
}

export function TaskLogsTab({ task }: TaskLogsTabProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<Set<ActivityType>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    if (filterOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const toggleType = (type: ActivityType) => {
    setTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  const filtered = [...task.activityLog]
    .filter((e) => typeFilter.size === 0 || typeFilter.has(e.type))
    .filter((e) => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return e.message.toLowerCase().includes(term) || e.user.toLowerCase().includes(term);
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const groups = groupByDay(filtered);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs…"
            aria-label="Search logs"
            className="w-full bg-noir-700 border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-jade transition-colors"
          />
        </div>

        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="relative flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.06] text-white/60 hover:text-white hover:border-white/[0.15] transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Activity Type
            {typeFilter.size > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-jade text-noir-800 text-[9px] font-bold rounded-full px-1">
                {typeFilter.size}
              </span>
            )}
          </button>
          {filterOpen && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-noir-700 border border-white/[0.08] rounded-xl shadow-2xl z-30 overflow-hidden">
              <div className="max-h-72 overflow-y-auto py-1">
                {ACTIVITY_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/5 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={typeFilter.has(type)}
                      onChange={() => toggleType(type)}
                      className="w-3.5 h-3.5 rounded accent-jade shrink-0"
                    />
                    {ACTIVITY_TITLE[type]}
                  </label>
                ))}
              </div>
              {typeFilter.size > 0 && (
                <button
                  type="button"
                  onClick={() => setTypeFilter(new Set())}
                  className="w-full text-[11px] font-semibold text-white/40 hover:text-white border-t border-white/[0.07] px-3 py-2 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => exportLogsToCSV(filtered, task.title)}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.06] text-white/60 hover:text-white hover:border-white/[0.15] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-8">No activity matches your search and filters.</p>
      ) : (
        groups.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">{group.label}</p>
            <div className="relative">
              <div className="absolute left-[15px] top-1 bottom-1 w-px bg-white/[0.08]" aria-hidden="true" />
              <ul className="space-y-5">
                {group.entries.map((entry) => (
                  <li key={entry.id} className="relative pl-9">
                    <span className="absolute left-0 top-0 w-[30px] h-[30px] rounded-full bg-noir-600 border border-white/[0.08] flex items-center justify-center z-10">
                      {ACTIVITY_ICON[entry.type]}
                    </span>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white/85">{ACTIVITY_TITLE[entry.type]}</p>
                        <p className="text-xs text-white/55 mt-0.5 leading-relaxed">{entry.message}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <AssigneeAvatar name={entry.user} size={20} />
                        <div className="text-right">
                          <p className="text-[11px] font-semibold text-white/60 whitespace-nowrap">{entry.user}</p>
                          <p className="text-[10px] text-white/30 whitespace-nowrap">{format(new Date(entry.timestamp), 'h:mm a')}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
