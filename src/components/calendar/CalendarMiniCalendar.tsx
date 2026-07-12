import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { dateToKey } from '../../utils/calendarEvents';

const MINI_WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarMiniCalendarProps {
  cursorDate: Date;
  eventDates: Set<string>;
  onSelectDate: (date: Date) => void;
}

export function CalendarMiniCalendar({ cursorDate, eventDates, onSelectDate }: CalendarMiniCalendarProps) {
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

  const todayKey = dateToKey(new Date());
  const cursorKey = dateToKey(cursorDate);

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-4">
      <p className="text-xs font-bold text-white/70 mb-3">{format(cursorDate, 'MMMM yyyy')}</p>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {MINI_WEEKDAY_LABELS.map((label, i) => (
          <span key={`${label}-${i}`} className="text-[9px] font-bold text-white/25 text-center">{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map(({ date, inMonth, key }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDate(date)}
            className={`relative aspect-square flex items-center justify-center text-[10px] rounded-md transition-colors ${
              !inMonth
                ? 'text-white/15'
                : key === cursorKey
                  ? 'bg-jade text-noir-800 font-bold'
                  : key === todayKey
                    ? 'text-jade font-bold'
                    : 'text-white/60 hover:bg-white/5'
            }`}
          >
            {date.getDate()}
            {inMonth && key !== cursorKey && eventDates.has(key) && (
              <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-jade/70" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
