import React, { useMemo, useState } from 'react';
import { CalendarEvent, dateToKey } from '../../utils/calendarEvents';
import { CalendarEventChip } from './CalendarEventChip';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarMonthViewProps {
  cursorDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onRescheduleTask: (taskId: string, newDateKey: string) => void;
}

export function CalendarMonthView({ cursorDate, events, onSelectEvent, onRescheduleTask }: CalendarMonthViewProps) {
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const year = cursorDate.getFullYear();
  const month = cursorDate.getMonth();
  const startOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const cells = useMemo(() => Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1;
    const date = new Date(year, month, dayNum);
    return { date, inMonth: dayNum >= 1 && dayNum <= daysInMonth, key: dateToKey(date) };
  }), [totalCells, startOffset, year, month, daysInMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    });
    return map;
  }, [events]);

  const todayKey = dateToKey(new Date());

  return (
    <div>
      <div className="grid grid-cols-7 gap-px bg-white/[0.05] rounded-t-lg overflow-hidden">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="bg-noir-800 text-center text-[10px] font-bold uppercase tracking-widest text-white/30 py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-white/[0.05] rounded-b-lg overflow-hidden">
        {cells.map(({ date, inMonth, key }) => {
          const dayEvents = eventsByDate.get(key) ?? [];
          const isToday = key === todayKey;
          const isDragOver = dragOverKey === key;
          return (
            <div
              key={key}
              onDragOver={(e) => { e.preventDefault(); setDragOverKey(key); }}
              onDragLeave={() => setDragOverKey((k) => (k === key ? null : k))}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/task-id');
                if (taskId) onRescheduleTask(taskId, key);
                setDragOverKey(null);
              }}
              className={`min-h-[92px] bg-noir-800 p-1.5 transition-colors ${inMonth ? '' : 'opacity-40'} ${
                isDragOver ? 'ring-1 ring-inset ring-jade/50 bg-jade/[0.04]' : ''
              }`}
            >
              <span
                className={`inline-flex items-center justify-center text-[11px] font-semibold w-5 h-5 rounded-full mb-1 ${
                  isToday ? 'bg-jade text-noir-800' : 'text-white/50'
                }`}
              >
                {date.getDate()}
              </span>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <CalendarEventChip
                    key={event.id}
                    event={event}
                    compact
                    draggable={event.kind === 'task'}
                    onDragStart={(e) => e.dataTransfer.setData('text/task-id', event.taskId)}
                    onClick={() => onSelectEvent(event)}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-white/30 px-1.5">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
