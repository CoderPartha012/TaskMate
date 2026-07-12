export type RepoSortKey =
  | 'id' | 'title' | 'taskType' | 'status' | 'priority'
  | 'assignee' | 'createdBy' | 'createdAt' | 'dueDate' | 'lastModified';

export type GroupByKey = 'taskType' | 'status' | 'priority' | 'assignee';

export type DateDisplayMode = 'relative' | 'absolute';

export interface ColumnConfig {
  key: RepoSortKey;
  label: string;
  visible: boolean;
  width: number;
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'id',           label: 'Task ID',       visible: true, width: 110 },
  { key: 'title',        label: 'Task Title',    visible: true, width: 220 },
  { key: 'taskType',     label: 'Task Category', visible: true, width: 130 },
  { key: 'status',       label: 'Status',        visible: true, width: 120 },
  { key: 'priority',     label: 'Priority',      visible: true, width: 110 },
  { key: 'assignee',     label: 'Assignee',      visible: true, width: 160 },
  { key: 'createdBy',    label: 'Created By',    visible: true, width: 130 },
  { key: 'createdAt',    label: 'Created Date',  visible: true, width: 140 },
  { key: 'dueDate',      label: 'Due Date',      visible: true, width: 140 },
  { key: 'lastModified', label: 'Last Updated',  visible: true, width: 140 },
];
