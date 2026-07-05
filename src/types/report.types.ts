import { Priority, Status, TaskType } from '../types';

export type ReportColumnKey =
  | 'id' | 'title' | 'taskType' | 'status' | 'priority' | 'assignee'
  | 'createdBy' | 'createdAt' | 'dueDate' | 'startDate' | 'lastModified'
  | 'workflowStage' | 'contractType';

export interface ReportColumnDef {
  key: ReportColumnKey;
  label: string;
}

export const REPORT_COLUMNS: ReportColumnDef[] = [
  { key: 'id', label: 'Task ID' },
  { key: 'title', label: 'Task Title' },
  { key: 'taskType', label: 'Task Category' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdAt', label: 'Created Date' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'lastModified', label: 'Last Updated' },
  { key: 'workflowStage', label: 'Workflow Stage' },
  { key: 'contractType', label: 'Contract Type' },
];

export const DEFAULT_REPORT_COLUMNS: ReportColumnKey[] = ['id', 'title', 'taskType', 'status', 'priority', 'assignee', 'dueDate'];

export type GroupByKey = '' | 'status' | 'priority' | 'taskType' | 'assignee' | 'project' | 'workflow';
export type SortDir = 'asc' | 'desc';

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  taskCategory: TaskType | '';
  status: Status | '';
  priority: Priority | '';
  assignee: string;
  createdBy: string;
  project: string;
  workflow: string;
  contractType: string;
}

export const EMPTY_REPORT_FILTERS: ReportFilters = {
  dateFrom: '', dateTo: '', taskCategory: '', status: '', priority: '',
  assignee: '', createdBy: '', project: '', workflow: '', contractType: '',
};

export interface ReportConfig {
  id: string;
  name: string;
  category: string;
  columns: ReportColumnKey[];
  filters: ReportFilters;
  overdueOnly: boolean;
  sortBy: ReportColumnKey;
  sortDir: SortDir;
  groupBy: GroupByKey;
  includeChart: boolean;
  chartType: 'pie' | 'bar' | 'line' | 'doughnut' | '';
  createdBy: string;
  createdAt: string;
  isFavorite: boolean;
}

export function createEmptyReportConfig(name = 'Untitled Report', category = 'Custom Report'): ReportConfig {
  return {
    id: crypto.randomUUID(),
    name,
    category,
    columns: [...DEFAULT_REPORT_COLUMNS],
    filters: { ...EMPTY_REPORT_FILTERS },
    overdueOnly: false,
    sortBy: 'dueDate',
    sortDir: 'asc',
    groupBy: '',
    includeChart: false,
    chartType: '',
    createdBy: 'You',
    createdAt: new Date().toISOString(),
    isFavorite: false,
  };
}

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'view';

export interface ReportHistoryEntry {
  id: string;
  reportName: string;
  reportType: string;
  generatedBy: string;
  generatedAt: string;
  exportFormat: ExportFormat;
  status: 'completed' | 'failed';
  config: ReportConfig;
}

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface ScheduledReport {
  id: string;
  reportName: string;
  config: ReportConfig;
  frequency: ScheduleFrequency;
  startDate: string;
  time: string;
  timezone: string;
  recipients: string[];
  nextRunAt: string;
  lastRunAt?: string;
  active: boolean;
}

export type ReportAuditType = 'generated' | 'downloaded' | 'printed' | 'shared' | 'deleted' | 'scheduled' | 'favorited';

export interface ReportAuditEntry {
  id: string;
  user: string;
  timestamp: string;
  activity: string;
  type: ReportAuditType;
}

export const REPORT_CATEGORIES: Record<string, string[]> = {
  'Task Reports': ['Task Summary Report', 'Task Details Report', 'Task Status Report', 'Task Priority Report', 'Task Category Report', 'Task Completion Report', 'Overdue Task Report'],
  'User Reports': ['Assignee Workload Report', 'Team Productivity Report', 'User Activity Report', 'Created By Report'],
  'Workflow Reports': ['Workflow Status Report', 'Approval Report', 'SLA Report', 'Escalation Report'],
  'Project Reports': ['Sprint Report', 'Epic Report', 'Milestone Report', 'Project Progress Report'],
  'AI Reports': ['AI Execution Report', 'AI Success/Failure Report', 'AI Usage Report'],
  'Contract Reports': ['Contract Summary Report', 'Expiring Contracts Report', 'Renewal Report', 'Compliance Report', 'Contract Status Report'],
};

export const REPORT_TEMPLATES: string[] = [
  'Executive Summary', 'Weekly Team Report', 'Monthly Task Report', 'SLA Report',
  'Project Progress Report', 'AI Task Report', 'Contract Summary Report',
];
