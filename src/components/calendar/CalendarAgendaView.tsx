import React, { useMemo } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { CalendarEvent, dateToKey, getEventColor, parseDateKey } from '../../utils/calendarEvents';

interface CalendarAgendaViewProps {
  cursorDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

function dayLabel(date: Date, from: Date): string {
  const diffDays = differenceInCalendarDays(date, from);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) return format(date, 'EEEE');
  return format(date, 'MMM d, yyyy');
}

export function CalendarAgendaView({ cursorDate, events, onSelectEvent }: CalendarAgendaViewProps) {
  const fromKey = dateToKey(cursorDate);

  const groups = useMemo(() => {
    const upcoming = [...events]
      .filter((event) => event.date >= fromKey)
      .sort((a, b) => a.date.localeCompare(b.date));

    const result: { date: string; label: string; events: CalendarEvent[] }[] = [];
    upcoming.forEach((event) => {
      let group = result.find((g) => g.date === event.date);
      if (!group) {
        group = { date: event.date, label: dayLabel(parseDateKey(event.date), cursorDate), events: [] };
        result.push(group);
      }
      group.events.push(event);
    });
    return result;
  }, [events, fromKey, cursorDate]);

  if (groups.length === 0) {
    return <p className="text-xs text-white/30 text-center py-10">No upcoming events.</p>;
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.date}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">{group.label}</p>
          <ul className="space-y-1.5">
            {group.events.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onSelectEvent(event)}
                  className="w-full flex items-center gap-2.5 text-left bg-noir-700 border border-white/[0.06] rounded-lg px-3 py-2 hover:border-white/[0.15] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: getEventColor(event) }} aria-hidden="true" />
                  <span
                    className={`flex-1 min-w-0 truncate text-xs ${
                      event.status === 'completed' ? 'text-white/30 line-through' : event.overdue ? 'text-red-400 font-semibold' : 'text-white/75'
                    }`}
                  >
                    {event.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
