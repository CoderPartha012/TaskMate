import { Priority, Status, Task, TaskType } from '../types';
import { SLAAlertStatus, getWorkflowSLAStatus } from '../utils/taskAlerts';

export type FilterLogic = 'AND' | 'OR';

export type QuickFilterKey =
  | 'all' | 'my-tasks' | 'due-today' | 'due-week' | 'overdue' | 'high-priority' | 'completed';

export interface RepositoryFilters {
  taskId: string;
  taskTitle: string;
  taskCategory: TaskType[];
  status: Status[];
  priority: Priority[];
  assignee: string;
  createdBy: string;
  createdFrom: string;
  createdTo: string;
  dueFrom: string;
  dueTo: string;
  filterLogic: FilterLogic;
  workflowApprovalLevel: string;
  workflowSlaStatus: SLAAlertStatus | '';
  contractComplianceStatus: string;
  contractType: string;
}

export const EMPTY_REPOSITORY_FILTERS: RepositoryFilters = {
  taskId: '',
  taskTitle: '',
  taskCategory: [],
  status: [],
  priority: [],
  assignee: '',
  createdBy: '',
  createdFrom: '',
  createdTo: '',
  dueFrom: '',
  dueTo: '',
  filterLogic: 'AND',
  workflowApprovalLevel: '',
  workflowSlaStatus: '',
  contractComplianceStatus: '',
  contractType: '',
};

const COUNTED_KEYS: (keyof RepositoryFilters)[] = [
  'taskId', 'taskTitle', 'taskCategory', 'status', 'priority', 'assignee', 'createdBy',
  'createdFrom', 'createdTo', 'dueFrom', 'dueTo',
  'workflowApprovalLevel', 'workflowSlaStatus', 'contractComplianceStatus', 'contractType',
];

function isFieldActive(f: RepositoryFilters, key: keyof RepositoryFilters): boolean {
  const value = f[key];
  return Array.isArray(value) ? value.length > 0 : !!value;
}

export function isFiltersEmpty(f: RepositoryFilters): boolean {
  return COUNTED_KEYS.every((k) => !isFieldActive(f, k));
}

export function activeFilterCount(f: RepositoryFilters): number {
  return COUNTED_KEYS.filter((k) => isFieldActive(f, k)).length;
}

type FilterRule = [active: boolean, test: (t: Task) => boolean];

function buildFilterRules(f: RepositoryFilters): FilterRule[] {
  return [
    [!!f.taskId, (t) => t.id.toLowerCase().includes(f.taskId.toLowerCase())],
    [!!f.taskTitle, (t) => t.title.toLowerCase().includes(f.taskTitle.toLowerCase())],
    [f.taskCategory.length > 0, (t) => f.taskCategory.includes(t.taskType)],
    [f.status.length > 0, (t) => f.status.includes(t.status)],
    [f.priority.length > 0, (t) => f.priority.includes(t.priority)],
    [!!f.assignee, (t) => t.assignees.join(' ').toLowerCase().includes(f.assignee.toLowerCase())],
    [!!f.createdBy, (t) => t.createdBy.toLowerCase().includes(f.createdBy.toLowerCase())],
    [!!f.createdFrom, (t) => new Date(t.createdAt) >= new Date(f.createdFrom)],
    [!!f.createdTo, (t) => new Date(t.createdAt) <= new Date(`${f.createdTo}T23:59:59`)],
    [!!f.dueFrom, (t) => new Date(t.dueDate) >= new Date(f.dueFrom)],
    [!!f.dueTo, (t) => new Date(t.dueDate) <= new Date(`${f.dueTo}T23:59:59`)],
    [!!f.workflowApprovalLevel, (t) => t.workflowMeta?.approvalLevel === f.workflowApprovalLevel],
    [!!f.workflowSlaStatus, (t) => getWorkflowSLAStatus(t) === f.workflowSlaStatus],
    [!!f.contractComplianceStatus, (t) => t.contractMeta?.complianceStatus === f.contractComplianceStatus],
    [!!f.contractType, (t) => t.contractMeta?.contractType === f.contractType],
  ];
}

export function applyRepositoryFilters(tasks: Task[], f: RepositoryFilters): Task[] {
  const predicates = buildFilterRules(f).filter(([active]) => active).map(([, test]) => test);
  if (predicates.length === 0) return tasks;

  return tasks.filter((t) =>
    f.filterLogic === 'OR' ? predicates.some((p) => p(t)) : predicates.every((p) => p(t))
  );
}

export function applyQuickFilter(tasks: Task[], quickFilter: QuickFilterKey): Task[] {
  if (quickFilter === 'all') return tasks;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

  return tasks.filter((t) => {
    const due = new Date(t.dueDate);
    switch (quickFilter) {
      case 'my-tasks':
        return t.createdBy === 'You';
      case 'due-today':
        return due >= startOfToday && due <= endOfToday;
      case 'due-week':
        return due >= startOfToday && due <= endOfWeek;
      case 'overdue':
        return t.status !== 'completed' && due < startOfToday;
      case 'high-priority':
        return t.priority === 'high';
      case 'completed':
        return t.status === 'completed';
      default:
        return true;
    }
  });
}
