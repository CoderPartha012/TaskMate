import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Search, Download,
  Sun, CalendarRange, CalendarDays as CalendarDaysIcon, List,
} from 'lucide-react';
import { TaskType } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { buildCalendarEvents, CalendarEvent } from '../../utils/calendarEvents';
import { exportEventsToICS } from '../../utils/icsExport';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarDayView } from './CalendarDayView';
import { CalendarAgendaView } from './CalendarAgendaView';
import { CalendarMiniCalendar } from './CalendarMiniCalendar';
import { CalendarSidePanel } from './CalendarSidePanel';

type CalendarViewMode = 'day' | 'week' | 'month' | 'agenda';

const VIEW_TABS: { key: CalendarViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'day', label: 'Day', icon: Sun },
  { key: 'week', label: 'Week', icon: CalendarRange },
  { key: 'month', label: 'Month', icon: CalendarDaysIcon },
  { key: 'agenda', label: 'Agenda', icon: List },
];

const TYPE_LABELS: Record<TaskType, string> = {
  general: 'General',
  workflow: 'Workflow',
  project: 'Project',
  ai: 'AI',
  contract: 'Contract',
};

export function CalendarPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const setViewingTaskId = useTaskStore((s) => s.setViewingTaskId);
  const setActiveSection = useTaskStore((s) => s.setActiveSection);
  const setPendingTaskDetailTab = useTaskStore((s) => s.setPendingTaskDetailTab);
  const updateTask = useTaskStore((s) => s.updateTask);

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [cursorDate, setCursorDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<Set<TaskType>>(new Set());
  const [hideCompleted, setHideCompleted] = useState(false);

  const allEvents = useMemo(() => buildCalendarEvents(tasks), [tasks]);

  const events = useMemo(() => allEvents.filter((event) => {
    if (typeFilter.size > 0 && !typeFilter.has(event.taskType)) return false;
    if (hideCompleted && event.status === 'completed') return false;
    if (search.trim() && !event.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [allEvents, typeFilter, hideCompleted, search]);

  const eventDateKeys = useMemo(() => new Set(allEvents.map((e) => e.date)), [allEvents]);

  const toggleType = (type: TaskType) => {
    setTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  const shiftCursor = (dir: 1 | -1) => {
    const d = new Date(cursorDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCursorDate(d);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setPendingTaskDetailTab(event.kind === 'obligation' ? 'obligations' : 'details');
    setViewingTaskId(event.taskId);
    setActiveSection('task-detail');
  };

  const handleReschedule = (taskId: string, newDateKey: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.dueDate === newDateKey) return;
    updateTask(
      taskId,
      { dueDate: newDateKey },
      [{
        type: 'due_date_changed',
        message: `Due date changed to ${format(new Date(`${newDateKey}T00:00:00`), 'MMM d, yyyy')} via Calendar`,
        user: 'You',
      }]
    );
  };

  const headerLabel = viewMode === 'month' || viewMode === 'week'
    ? format(cursorDate, 'MMMM yyyy')
    : format(cursorDate, 'MMM d, yyyy');

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-1 border-b border-white/[0.06]">
          {VIEW_TABS.map(({ key, label, icon: Icon }) => {
            const isActive = viewMode === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setViewMode(key)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-colors ${
                  isActive ? 'text-jade' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.03]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="calendarViewIndicator"
                    className="absolute left-0 right-0 -bottom-px h-0.5 bg-jade rounded-full"
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => exportEventsToICS(events)}
          disabled={events.length === 0}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.06] text-white/60 hover:text-white hover:border-white/[0.15] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          Export .ics
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shiftCursor(-1)} aria-label="Previous" className="p-1.5 rounded-lg border border-white/[0.06] text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-bold text-white min-w-[130px] text-center">{headerLabel}</p>
          <button type="button" onClick={() => shiftCursor(1)} aria-label="Next" className="p-1.5 rounded-lg border border-white/[0.06] text-white/50 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setCursorDate(new Date())} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.06] text-white/60 hover:text-white transition-colors">
            Today
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search calendar…"
              aria-label="Search calendar"
              className="w-full bg-noir-700 border border-white/[0.06] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-jade transition-colors"
            />
          </div>
          {(Object.keys(TYPE_LABELS) as TaskType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full border uppercase tracking-wide transition-colors ${
                typeFilter.has(type) ? 'bg-jade/15 text-jade border-jade/30' : 'text-white/40 border-white/[0.08] hover:text-white/70'
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
          <label className="flex items-center gap-1.5 text-[11px] text-white/50 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-jade cursor-pointer"
            />
            Hide Completed
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="min-w-0">
          {viewMode === 'month' && (
            <CalendarMonthView cursorDate={cursorDate} events={events} onSelectEvent={handleSelectEvent} onRescheduleTask={handleReschedule} />
          )}
          {viewMode === 'week' && (
            <CalendarWeekView cursorDate={cursorDate} events={events} onSelectEvent={handleSelectEvent} />
          )}
          {viewMode === 'day' && (
            <CalendarDayView cursorDate={cursorDate} events={events} onSelectEvent={handleSelectEvent} />
          )}
          {viewMode === 'agenda' && (
            <CalendarAgendaView cursorDate={cursorDate} events={events} onSelectEvent={handleSelectEvent} />
          )}
        </div>
        <div className="space-y-6">
          <CalendarMiniCalendar cursorDate={cursorDate} eventDates={eventDateKeys} onSelectDate={setCursorDate} />
          <CalendarSidePanel events={events} onSelectEvent={handleSelectEvent} />
        </div>
      </div>
    </div>
  );
}
