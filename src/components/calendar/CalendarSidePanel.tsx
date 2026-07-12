import React from 'react';
import { CalendarEvent, dateToKey, getEventColor } from '../../utils/calendarEvents';

interface CalendarSidePanelProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

interface SectionProps {
  title: string;
  items: CalendarEvent[];
  emptyText: string;
  onSelectEvent: (event: CalendarEvent) => void;
}

function Section({ title, items, emptyText, onSelectEvent }: SectionProps) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
        {title} {items.length > 0 && <span className="text-white/50">({items.length})</span>}
      </p>
      {items.length === 0 ? (
        <p className="text-[11px] text-white/25">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 6).map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onSelectEvent(event)}
                className="w-full flex items-center gap-2 text-left text-[11px] text-white/70 hover:text-white transition-colors truncate"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: getEventColor(event) }} aria-hidden="true" />
                <span className="truncate">{event.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CalendarSidePanel({ events, onSelectEvent }: CalendarSidePanelProps) {
  const todayKey = dateToKey(new Date());
  const in7Key = dateToKey(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const todays = events.filter((event) => event.date === todayKey);
  const overdue = events.filter((event) => event.overdue);
  const upcoming = events
    .filter((event) => event.date > todayKey && event.date <= in7Key)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-4 space-y-5">
      <Section title="Today's Tasks" items={todays} emptyText="Nothing due today." onSelectEvent={onSelectEvent} />
      <Section title="Overdue" items={overdue} emptyText="Nothing overdue." onSelectEvent={onSelectEvent} />
      <Section title="Upcoming (Next 7 Days)" items={upcoming} emptyText="Nothing coming up." onSelectEvent={onSelectEvent} />
    </div>
  );
}
