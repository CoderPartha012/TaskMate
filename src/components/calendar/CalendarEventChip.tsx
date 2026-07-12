import React from 'react';
import { CalendarEvent, getEventColor } from '../../utils/calendarEvents';

interface CalendarEventChipProps {
  event: CalendarEvent;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  compact?: boolean;
}

export function CalendarEventChip({ event, onClick, draggable, onDragStart, compact }: CalendarEventChipProps) {
  const color = getEventColor(event);
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={event.title}
      className={`w-full flex items-center gap-1.5 text-left rounded-md px-1.5 py-0.5 truncate transition-colors hover:bg-white/5 ${compact ? 'text-[10px]' : 'text-[11px]'}`}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} aria-hidden="true" />
      <span
        className={`truncate ${
          event.status === 'completed' ? 'text-white/30 line-through' : event.overdue ? 'text-red-400 font-semibold' : 'text-white/70'
        }`}
      >
        {event.title}
      </span>
    </button>
  );
}
