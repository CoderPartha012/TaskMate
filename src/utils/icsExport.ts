import { CalendarEvent } from './calendarEvents';

function escapeICS(text: string): string {
  return text.replace(/[\\;,]/g, (match) => `\\${match}`).replace(/\n/g, '\\n');
}

function toICSDate(dateKey: string): string {
  return dateKey.replace(/-/g, '');
}

export function exportEventsToICS(events: CalendarEvent[], filename = 'taskmate-calendar.ics'): void {
  const stamp = `${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TaskMate//Calendar//EN', 'CALSCALE:GREGORIAN'];

  events.forEach((event) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@taskmate.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toICSDate(event.date)}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `STATUS:${event.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
