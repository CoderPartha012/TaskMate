import { AIExecutionRun, Task } from '../types';

export interface FlatRun extends AIExecutionRun {
  taskId: string;
  taskTitle: string;
}

export function getAITasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.taskType === 'ai' && !!t.aiMeta);
}

export function flattenExecutionRuns(tasks: Task[]): FlatRun[] {
  const runs: FlatRun[] = [];
  getAITasks(tasks).forEach((task) => {
    (task.aiMeta?.executionHistory ?? []).forEach((run) => {
      runs.push({ ...run, taskId: task.id, taskTitle: task.title });
    });
  });
  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function formatDuration(ms?: number): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}
