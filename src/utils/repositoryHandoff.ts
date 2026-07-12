import { Priority, Status, TaskType, AIExecutionStatus } from '../types';
import { EMPTY_REPOSITORY_FILTERS, QuickFilterKey, RepositoryFilters } from '../components/repository/repositoryFilterTypes';
import { AnalyticsFilters } from '../components/analytics/analyticsFilterTypes';

export interface RepositoryHandoff {
  filters: RepositoryFilters;
  quickFilter: QuickFilterKey;
}

function withFilters(patch: Partial<RepositoryFilters>): RepositoryHandoff {
  return { filters: { ...EMPTY_REPOSITORY_FILTERS, ...patch }, quickFilter: 'all' };
}

export function handoffQuickFilter(quickFilter: QuickFilterKey): RepositoryHandoff {
  return { filters: EMPTY_REPOSITORY_FILTERS, quickFilter };
}

export function handoffStatus(status: Status): RepositoryHandoff {
  return withFilters({ status: [status] });
}

export function handoffPriority(priority: Priority): RepositoryHandoff {
  return withFilters({ priority: [priority] });
}

export function handoffCategory(category: TaskType): RepositoryHandoff {
  return withFilters({ taskCategory: [category] });
}

export function handoffAssignee(assignee: string): RepositoryHandoff {
  return withFilters({ assignee });
}

export function handoffDueRange(dueFrom: string, dueTo: string): RepositoryHandoff {
  return withFilters({ dueFrom, dueTo });
}

export function handoffCreatedRange(createdFrom: string, createdTo: string): RepositoryHandoff {
  return withFilters({ createdFrom, createdTo });
}

export function handoffAIExecutionStatus(status: AIExecutionStatus): RepositoryHandoff {
  return withFilters({ taskCategory: ['ai'], aiExecutionStatus: status });
}

export function handoffContractExpiringSoon(): RepositoryHandoff {
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ymd = (d: Date) => d.toISOString().slice(0, 10);
  return withFilters({ taskCategory: ['contract'], dueFrom: ymd(today), dueTo: ymd(in30Days) });
}

export function handoffFromAnalyticsFilters(f: AnalyticsFilters): RepositoryHandoff {
  return withFilters({
    taskCategory: f.taskCategory ? [f.taskCategory] : [],
    status: f.status ? [f.status] : [],
    priority: f.priority ? [f.priority] : [],
    assignee: f.assignee,
    createdBy: f.createdBy,
    createdFrom: f.dateFrom,
    createdTo: f.dateTo,
  });
}
