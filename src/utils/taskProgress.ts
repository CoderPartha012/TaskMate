import { differenceInCalendarDays } from 'date-fns';
import { Task } from '../types';

export function getTaskProgress(task: Task): number {
  if (task.taskType === 'project' && task.projectMeta) {
    return Math.max(0, Math.min(100, task.projectMeta.progressPercent));
  }
  if (task.status === 'completed') return 100;
  if (task.status === 'in-progress') return 50;
  return 0;
}

export function getRemainingDays(task: Task): number | null {
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return differenceInCalendarDays(due, today);
}

export function getEstimatedHours(task: Task): number | null {
  if (task.taskType === 'project' && task.projectMeta?.estimatedHours != null) {
    return task.projectMeta.estimatedHours;
  }
  if (task.taskType === 'general' && task.estimatedTime != null) {
    return Math.round((task.estimatedTime / 60) * 10) / 10;
  }
  return null;
}

export function getActualHours(task: Task): number | null {
  if (task.taskType === 'project' && task.projectMeta?.actualHours != null) {
    return task.projectMeta.actualHours;
  }
  if (task.taskType === 'general' && task.actualTime != null) {
    return Math.round((task.actualTime / 60) * 10) / 10;
  }
  return null;
}
