import { Priority, Status, Task, TaskType } from '../../types';

export interface AnalyticsFilters {
  dateFrom: string;
  dateTo: string;
  taskCategory: TaskType | '';
  status: Status | '';
  priority: Priority | '';
  assignee: string;
  createdBy: string;
}

export const EMPTY_ANALYTICS_FILTERS: AnalyticsFilters = {
  dateFrom: '',
  dateTo: '',
  taskCategory: '',
  status: '',
  priority: '',
  assignee: '',
  createdBy: '',
};

export function applyAnalyticsFilters(tasks: Task[], f: AnalyticsFilters): Task[] {
  return tasks.filter((t) => {
    if (f.dateFrom && new Date(t.createdAt) < new Date(f.dateFrom)) return false;
    if (f.dateTo && new Date(t.createdAt) > new Date(`${f.dateTo}T23:59:59`)) return false;
    if (f.taskCategory && t.taskType !== f.taskCategory) return false;
    if (f.status && t.status !== f.status) return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (f.assignee && !t.assignees.join(' ').toLowerCase().includes(f.assignee.toLowerCase())) return false;
    if (f.createdBy && !t.createdBy.toLowerCase().includes(f.createdBy.toLowerCase())) return false;
    return true;
  });
}
