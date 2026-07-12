import { Status, Task, TaskType } from '../types';

export type CalendarEventKind = 'task' | 'obligation' | 'contract-expiry' | 'contract-renewal';

export interface CalendarEvent {
  id: string;
  date: string; // yyyy-mm-dd
  title: string;
  kind: CalendarEventKind;
  taskType: TaskType;
  status: Status;
  taskId: string;
  obligationId?: string;
  overdue: boolean;
}

export const TASK_TYPE_EVENT_COLOR: Record<TaskType, string> = {
  general: '#3B82F6',
  workflow: '#F59E0B',
  project: '#22C55E',
  ai: '#A855F7',
  contract: '#EF4444',
};

export const OBLIGATION_EVENT_COLOR = '#EAB308';

export function getEventColor(event: CalendarEvent): string {
  if (event.kind === 'obligation') return OBLIGATION_EVENT_COLOR;
  return TASK_TYPE_EVENT_COLOR[event.taskType];
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// Task due dates are plain "YYYY-MM-DD" strings, always parsed by `new Date()` as UTC midnight —
// reading them back with UTC getters (not local getters) avoids an off-by-one-day shift for
// users in timezones behind UTC.
function toDateKey(value: string | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export function buildCalendarEvents(tasks: Task[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();

  tasks.forEach((task) => {
    if (task.archived) return;

    const dueKey = toDateKey(task.dueDate);
    if (dueKey) {
      events.push({
        id: `task-${task.id}`,
        date: dueKey,
        title: task.title,
        kind: 'task',
        taskType: task.taskType,
        status: task.status,
        taskId: task.id,
        overdue: task.status !== 'completed' && new Date(task.dueDate) < now,
      });
    }

    (task.obligations ?? []).forEach((obligation) => {
      const obligationKey = toDateKey(obligation.dueDate);
      if (!obligationKey) return;
      events.push({
        id: `obligation-${obligation.id}`,
        date: obligationKey,
        title: obligation.title,
        kind: 'obligation',
        taskType: task.taskType,
        status: task.status,
        taskId: task.id,
        obligationId: obligation.id,
        overdue: obligation.status !== 'completed' && new Date(obligation.dueDate) < now,
      });
    });

    if (task.taskType === 'contract' && task.contractMeta) {
      const expiryKey = toDateKey(task.contractMeta.expiryDate);
      if (expiryKey) {
        events.push({
          id: `contract-expiry-${task.id}`,
          date: expiryKey,
          title: `Contract Expiry: ${task.title}`,
          kind: 'contract-expiry',
          taskType: task.taskType,
          status: task.status,
          taskId: task.id,
          overdue: new Date(task.contractMeta.expiryDate) < now,
        });
      }

      const renewalKey = toDateKey(task.contractMeta.renewalDate);
      if (renewalKey) {
        events.push({
          id: `contract-renewal-${task.id}`,
          date: renewalKey,
          title: `Contract Renewal: ${task.title}`,
          kind: 'contract-renewal',
          taskType: task.taskType,
          status: task.status,
          taskId: task.id,
          overdue: false,
        });
      }
    }
  });

  return events;
}

// Calendar grid cells are constructed as local-midnight Date objects (`new Date(year, month, day)`) —
// read them back with local getters, matching how `toDateKey` reads UTC-anchored due-date strings.
export function dateToKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// Inverse of dateToKey — builds a local-midnight Date from a "YYYY-MM-DD" key, for date-fns
// formatting, without going through a UTC-anchored `new Date(string)` parse (which can shift
// the displayed day by one for users behind UTC).
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
