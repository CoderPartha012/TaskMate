import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent, dateToKey, getEventColor } from '../../utils/calendarEvents';

interface CalendarDayViewProps {
  cursorDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export function CalendarDayView({ cursorDate, events, onSelectEvent }: CalendarDayViewProps) {
  const key = dateToKey(cursorDate);
  const dayEvents = events.filter((event) => event.date === key);

  return (
    <div>
      <p className="text-sm font-bold text-white mb-4">{format(cursorDate, 'EEEE, MMMM d, yyyy')}</p>
      {dayEvents.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-10">No events on this day.</p>
      ) : (
        <ul className="space-y-2">
          {dayEvents.map((event) => (
            <li key={event.id} className="flex items-center gap-3 bg-noir-700 border border-white/[0.06] rounded-lg px-4 py-3">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: getEventColor(event) }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onSelectEvent(event)}
                  className={`text-sm font-semibold text-left truncate hover:text-jade transition-colors block w-full ${
                    event.status === 'completed' ? 'text-white/30 line-through' : event.overdue ? 'text-red-400' : 'text-white/85'
                  }`}
                >
                  {event.title}
                </button>
                <p className="text-[10px] text-white/30 uppercase tracking-wide mt-0.5">{event.kind.replace('-', ' ')}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
