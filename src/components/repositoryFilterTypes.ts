import { Priority, Status, TaskType } from '../types';

export interface RepositoryFilters {
  taskId: string;
  taskTitle: string;
  taskCategory: TaskType | '';
  status: Status | '';
  priority: Priority | '';
  assignee: string;
  createdBy: string;
  createdFrom: string;
  createdTo: string;
  dueFrom: string;
  dueTo: string;
}

export const EMPTY_REPOSITORY_FILTERS: RepositoryFilters = {
  taskId: '',
  taskTitle: '',
  taskCategory: '',
  status: '',
  priority: '',
  assignee: '',
  createdBy: '',
  createdFrom: '',
  createdTo: '',
  dueFrom: '',
  dueTo: '',
};

export function isFiltersEmpty(f: RepositoryFilters): boolean {
  return Object.values(f).every((v) => !v);
}
