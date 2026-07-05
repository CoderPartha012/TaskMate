import {
  format, subDays, subWeeks, subMonths,
  startOfDay, startOfWeek, startOfMonth,
  differenceInCalendarDays, differenceInHours,
} from 'date-fns';
import { ActivityEntry, Task, TaskType } from '../types';
import { getWorkflowSLAStatus, getContractAlert } from './taskAlerts';

export type Granularity = 'daily' | 'weekly' | 'monthly';

export interface NamedValue {
  name: string;
  value: number;
}

// ─── KPIs ─────────────────────────────────────────────────────────────────

export interface KPIData {
  totalTasks: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  highPriority: number;
  completionRate: number;
  avgCompletionHours: number | null;
}

export function computeKPIs(tasks: Task[]): KPIData {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const now = new Date();
  const overdue = tasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < now).length;
  const highPriority = tasks.filter((t) => t.priority === 'high').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const completedWithTimes = tasks.filter((t) => t.status === 'completed' && t.completedAt);
  const avgCompletionHours = completedWithTimes.length > 0
    ? Math.round(
        (completedWithTimes.reduce(
          (sum, t) => sum + differenceInHours(new Date(t.completedAt as string), new Date(t.createdAt)),
          0
        ) / completedWithTimes.length) * 10
      ) / 10
    : null;

  return { totalTasks: total, completed, pending, inProgress, overdue, highPriority, completionRate, avgCompletionHours };
}

export function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return Math.round(((curr - prev) / prev) * 100);
}

export function splitByTrailingPeriod(tasks: Task[], days = 30): { current: Task[]; previous: Task[] } {
  const now = new Date();
  const currentStart = subDays(now, days);
  const previousStart = subDays(now, days * 2);
  const current = tasks.filter((t) => new Date(t.createdAt) >= currentStart);
  const previous = tasks.filter((t) => {
    const d = new Date(t.createdAt);
    return d >= previousStart && d < currentStart;
  });
  return { current, previous };
}

// ─── Breakdown charts ─────────────────────────────────────────────────────

export function getStatusBreakdown(tasks: Task[]): NamedValue[] {
  const counts = { pending: 0, 'in-progress': 0, completed: 0 };
  tasks.forEach((t) => { counts[t.status]++; });
  return [
    { name: 'Pending', value: counts.pending },
    { name: 'In Progress', value: counts['in-progress'] },
    { name: 'Completed', value: counts.completed },
    { name: 'On Hold', value: 0 },
    { name: 'Cancelled', value: 0 },
  ];
}

export function getPriorityBreakdown(tasks: Task[]): NamedValue[] {
  const counts = { low: 0, medium: 0, high: 0 };
  tasks.forEach((t) => { counts[t.priority]++; });
  return [
    { name: 'Low', value: counts.low },
    { name: 'Medium', value: counts.medium },
    { name: 'High', value: counts.high },
    { name: 'Critical', value: 0 },
  ];
}

const CATEGORY_LABELS: Record<TaskType, string> = {
  general: 'General Task Type',
  workflow: 'Workflow-Based Tasks',
  project: 'Project Management Tasks',
  ai: 'AI & Smart Tasks',
  contract: 'Contract / Business Workflow Tasks',
};

export function getCategoryBreakdown(tasks: Task[]): NamedValue[] {
  const counts: Record<TaskType, number> = { general: 0, workflow: 0, project: 0, ai: 0, contract: 0 };
  tasks.forEach((t) => { counts[t.taskType]++; });
  return (Object.keys(CATEGORY_LABELS) as TaskType[]).map((key) => ({
    name: CATEGORY_LABELS[key],
    value: counts[key],
  }));
}

export function getAssigneeWorkload(tasks: Task[]): NamedValue[] {
  const counts = new Map<string, number>();
  tasks.forEach((t) => {
    const names = t.assignees.length > 0 ? t.assignees : ['Unassigned'];
    names.forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));
  });
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getDueDateTimeline(tasks: Task[]): NamedValue[] {
  const today = startOfDay(new Date());
  const buckets = { dueToday: 0, tomorrow: 0, thisWeek: 0, nextWeek: 0, later: 0 };
  tasks
    .filter((t) => t.status !== 'completed')
    .forEach((t) => {
      const due = startOfDay(new Date(t.dueDate));
      const diffDays = differenceInCalendarDays(due, today);
      if (diffDays < 0) return;
      if (diffDays === 0) buckets.dueToday++;
      else if (diffDays === 1) buckets.tomorrow++;
      else if (diffDays <= 7) buckets.thisWeek++;
      else if (diffDays <= 14) buckets.nextWeek++;
      else buckets.later++;
    });
  return [
    { name: 'Due Today', value: buckets.dueToday },
    { name: 'Tomorrow', value: buckets.tomorrow },
    { name: 'This Week', value: buckets.thisWeek },
    { name: 'Next Week', value: buckets.nextWeek },
    { name: 'Later', value: buckets.later },
  ];
}

export function getTaskAging(tasks: Task[]): NamedValue[] {
  const now = new Date();
  const buckets = { '0–7 Days': 0, '8–15 Days': 0, '16–30 Days': 0, '31–60 Days': 0, '60+ Days': 0 };
  tasks
    .filter((t) => t.status !== 'completed')
    .forEach((t) => {
      const age = differenceInCalendarDays(now, new Date(t.createdAt));
      if (age <= 7) buckets['0–7 Days']++;
      else if (age <= 15) buckets['8–15 Days']++;
      else if (age <= 30) buckets['16–30 Days']++;
      else if (age <= 60) buckets['31–60 Days']++;
      else buckets['60+ Days']++;
    });
  return Object.entries(buckets).map(([name, value]) => ({ name, value }));
}

export function getCreatorDistribution(tasks: Task[]): NamedValue[] {
  const counts = new Map<string, number>();
  tasks.forEach((t) => counts.set(t.createdBy, (counts.get(t.createdBy) || 0) + 1));
  return [...counts.entries()].map(([name, value]) => ({ name, value }));
}

// ─── Trend charts (daily / weekly / monthly) ──────────────────────────────

function bucketKey(d: Date, granularity: Granularity): string {
  if (granularity === 'monthly') return format(startOfMonth(d), 'yyyy-MM');
  if (granularity === 'weekly') return format(startOfWeek(d), 'yyyy-MM-dd');
  return format(d, 'yyyy-MM-dd');
}

export function generateTrend(
  tasks: Task[],
  dateField: 'createdAt' | 'completedAt' | 'dueDate',
  granularity: Granularity
): { date: string; count: number }[] {
  const now = new Date();
  const numPoints = granularity === 'daily' ? 14 : 12;
  const points: { key: string; label: string }[] = [];

  for (let i = numPoints - 1; i >= 0; i--) {
    const d = granularity === 'daily' ? subDays(now, i) : granularity === 'weekly' ? subWeeks(now, i) : subMonths(now, i);
    points.push({
      key: bucketKey(d, granularity),
      label: granularity === 'monthly' ? format(d, 'MMM yyyy') : format(d, 'MMM d'),
    });
  }

  const counts = new Map<string, number>();
  tasks.forEach((t) => {
    const raw = t[dateField];
    if (!raw) return;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return;
    const key = bucketKey(d, granularity);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return points.map((p) => ({ date: p.label, count: counts.get(p.key) || 0 }));
}

export function getOverdueTrend(tasks: Task[], granularity: Granularity) {
  const now = new Date();
  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < now);
  return generateTrend(overdueTasks, 'dueDate', granularity);
}

// ─── Completion rate by category (grouped bar) ────────────────────────────

export function getCompletionRateByCategory(tasks: Task[]) {
  const types: TaskType[] = ['general', 'workflow', 'project', 'ai', 'contract'];
  return types.map((type) => {
    const inCategory = tasks.filter((t) => t.taskType === type);
    const completed = inCategory.filter((t) => t.status === 'completed').length;
    return { name: CATEGORY_LABELS[type].replace(/ Task(s)?( Type)?$/, ''), Completed: completed, Remaining: inCategory.length - completed };
  });
}

// ─── SLA / Contract / AI specialized charts ───────────────────────────────

export function getSLACompliance(tasks: Task[]): NamedValue[] {
  const workflowTasks = tasks.filter((t) => t.taskType === 'workflow');
  let met = 0;
  let breached = 0;
  workflowTasks.forEach((t) => {
    if (getWorkflowSLAStatus(t) === 'breached') breached++;
    else met++;
  });
  return [
    { name: 'SLA Met', value: met },
    { name: 'SLA Breached', value: breached },
  ];
}

export function getContractAnalytics(tasks: Task[]): NamedValue[] {
  const contractTasks = tasks.filter((t) => t.taskType === 'contract');
  const now = new Date();
  let active = 0, expiringSoon = 0, expired = 0, renewed = 0;

  contractTasks.forEach((t) => {
    const renewalDate = t.contractMeta?.renewalDate ? new Date(t.contractMeta.renewalDate) : null;
    const expiryDate = t.contractMeta?.expiryDate ? new Date(t.contractMeta.expiryDate) : null;
    const alert = getContractAlert(t);

    if (renewalDate && expiryDate && !Number.isNaN(renewalDate.getTime()) && !Number.isNaN(expiryDate.getTime())
      && renewalDate < now && now <= expiryDate) {
      renewed++;
    } else if (alert === 'expired') expired++;
    else if (alert === 'expiring-soon') expiringSoon++;
    else active++;
  });

  return [
    { name: 'Active', value: active },
    { name: 'Expiring Soon', value: expiringSoon },
    { name: 'Expired', value: expired },
    { name: 'Renewed', value: renewed },
  ];
}

export function getAITaskAnalytics(tasks: Task[]) {
  const aiTasks = tasks.filter((t) => t.taskType === 'ai');
  const counts = { success: 0, failed: 0, running: 0, idle: 0 };
  aiTasks.forEach((t) => {
    const status = t.aiMeta?.executionStatus ?? 'idle';
    counts[status]++;
  });
  return [{
    name: 'AI Executions',
    Successful: counts.success,
    Failed: counts.failed,
    Running: counts.running,
    Queued: counts.idle,
  }];
}

// ─── Monthly summary (stacked column) ─────────────────────────────────────

export function getMonthlyTaskSummary(tasks: Task[], months = 6) {
  const now = new Date();
  const points = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = subMonths(now, i);
    const key = format(startOfMonth(d), 'yyyy-MM');
    const label = format(d, 'MMM yyyy');
    const createdInMonth = tasks.filter((t) => format(startOfMonth(new Date(t.createdAt)), 'yyyy-MM') === key);
    const completedInMonth = tasks.filter((t) => t.completedAt && format(startOfMonth(new Date(t.completedAt)), 'yyyy-MM') === key);
    const pendingFromMonth = createdInMonth.filter((t) => t.status !== 'completed');
    points.push({
      name: label,
      Created: createdInMonth.length,
      Completed: completedInMonth.length,
      Pending: pendingFromMonth.length,
    });
  }
  return points;
}

// ─── Team productivity table ──────────────────────────────────────────────

export interface TeamProductivityRow {
  assignee: string;
  assigned: number;
  completed: number;
  pending: number;
  completionPct: number;
  avgCompletionHours: number | null;
}

export function getTeamProductivity(tasks: Task[]): TeamProductivityRow[] {
  const map = new Map<string, Task[]>();
  tasks.forEach((t) => {
    const names = t.assignees.length > 0 ? t.assignees : ['Unassigned'];
    names.forEach((n) => {
      if (!map.has(n)) map.set(n, []);
      map.get(n)!.push(t);
    });
  });

  return [...map.entries()].map(([assignee, list]) => {
    const completed = list.filter((t) => t.status === 'completed');
    const pending = list.filter((t) => t.status !== 'completed').length;
    const completionPct = list.length ? Math.round((completed.length / list.length) * 100) : 0;
    const withTimes = completed.filter((t) => t.completedAt);
    const avgCompletionHours = withTimes.length
      ? Math.round(
          (withTimes.reduce((s, t) => s + differenceInHours(new Date(t.completedAt as string), new Date(t.createdAt)), 0) / withTimes.length) * 10
        ) / 10
      : null;
    return { assignee, assigned: list.length, completed: completed.length, pending, completionPct, avgCompletionHours };
  }).sort((a, b) => b.assigned - a.assigned);
}

// ─── Global activity feed ─────────────────────────────────────────────────

export interface GlobalActivityEntry extends ActivityEntry {
  taskTitle: string;
  taskId: string;
}

export function getGlobalActivity(tasks: Task[], limit = 30): GlobalActivityEntry[] {
  const all: GlobalActivityEntry[] = [];
  tasks.forEach((t) => {
    t.activityLog.forEach((a) => all.push({ ...a, taskTitle: t.title, taskId: t.id }));
  });
  return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
}
