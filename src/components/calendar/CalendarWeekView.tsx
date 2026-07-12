import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarEvent, dateToKey } from '../../utils/calendarEvents';
import { CalendarEventChip } from './CalendarEventChip';

interface CalendarWeekViewProps {
  cursorDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export function CalendarWeekView({ cursorDate, events, onSelectEvent }: CalendarWeekViewProps) {
  const days = useMemo(() => {
    const start = new Date(cursorDate);
    start.setDate(cursorDate.getDate() - cursorDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursorDate]);

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
    <div className="grid grid-cols-7 gap-3">
      {days.map((date) => {
        const key = dateToKey(date);
        const dayEvents = eventsByDate.get(key) ?? [];
        const isToday = key === todayKey;
        return (
          <div key={key} className="min-w-0">
            <div className={`text-center mb-2 pb-2 border-b border-white/[0.06] ${isToday ? 'text-jade' : 'text-white/50'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest">{format(date, 'EEE')}</p>
              <p className="text-sm font-bold">{date.getDate()}</p>
            </div>
            <div className="space-y-1">
              {dayEvents.length === 0 ? (
                <p className="text-[10px] text-white/15 text-center">—</p>
              ) : (
                dayEvents.map((event) => (
                  <CalendarEventChip key={event.id} event={event} onClick={() => onSelectEvent(event)} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
