import { format } from 'date-fns';
import { Task } from '../types';
import { TASK_TYPE_SHORT } from '../components/common/TaskTypeSelector';
import {
  ReportColumnKey, ReportConfig, ReportFilters, GroupByKey, ScheduleFrequency,
} from '../types/report.types';

// ─── Filtering ─────────────────────────────────────────────────────────────

export function applyReportFilters(tasks: Task[], f: ReportFilters, overdueOnly: boolean): Task[] {
  const now = new Date();
  return tasks.filter((t) => {
    if (f.dateFrom && new Date(t.createdAt) < new Date(f.dateFrom)) return false;
    if (f.dateTo && new Date(t.createdAt) > new Date(`${f.dateTo}T23:59:59`)) return false;
    if (f.taskCategory && t.taskType !== f.taskCategory) return false;
    if (f.status && t.status !== f.status) return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (f.assignee && !t.assignees.join(' ').toLowerCase().includes(f.assignee.toLowerCase())) return false;
    if (f.createdBy && !t.createdBy.toLowerCase().includes(f.createdBy.toLowerCase())) return false;
    if (f.project) {
      const proj = [t.projectMeta?.epic, t.projectMeta?.sprint, t.projectMeta?.milestone].filter(Boolean).join(' ').toLowerCase();
      if (!proj.includes(f.project.toLowerCase())) return false;
    }
    if (f.workflow) {
      const wf = [t.workflowMeta?.currentStage, t.workflowMeta?.nextStage].filter(Boolean).join(' ').toLowerCase();
      if (!wf.includes(f.workflow.toLowerCase())) return false;
    }
    if (f.contractType && t.contractMeta?.contractType !== f.contractType) return false;
    if (overdueOnly && (t.status === 'completed' || new Date(t.dueDate) >= now)) return false;
    return true;
  });
}

// ─── Column value extraction ───────────────────────────────────────────────

function safeDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'MMM d, yyyy');
}

export function getColumnValue(task: Task, key: ReportColumnKey): string {
  switch (key) {
    case 'id': return task.id.slice(0, 8);
    case 'title': return task.title;
    case 'taskType': return TASK_TYPE_SHORT[task.taskType];
    case 'status': return task.status.replace('-', ' ');
    case 'priority': return task.priority;
    case 'assignee': return task.assignees.length > 0 ? task.assignees.join(', ') : '—';
    case 'createdBy': return task.createdBy;
    case 'createdAt': return safeDate(task.createdAt);
    case 'dueDate': return safeDate(task.dueDate);
    case 'startDate': return safeDate(task.startDate);
    case 'lastModified': return safeDate(task.lastModified);
    case 'workflowStage': return task.workflowMeta?.currentStage || '—';
    case 'contractType': return task.contractMeta?.contractType || '—';
    default: return '—';
  }
}

function getSortValue(task: Task, key: ReportColumnKey): string | number {
  switch (key) {
    case 'createdAt': return new Date(task.createdAt).getTime();
    case 'dueDate': return new Date(task.dueDate).getTime();
    case 'startDate': return task.startDate ? new Date(task.startDate).getTime() : 0;
    case 'lastModified': return new Date(task.lastModified).getTime();
    case 'priority': return { low: 0, medium: 1, high: 2 }[task.priority];
    default: return getColumnValue(task, key).toLowerCase();
  }
}

// ─── Grouping ───────────────────────────────────────────────────────────────

export function groupTasks(tasks: Task[], groupBy: GroupByKey): { label: string; tasks: Task[] }[] {
  if (!groupBy) return [{ label: '', tasks }];
  const map = new Map<string, Task[]>();
  tasks.forEach((t) => {
    let key = '';
    switch (groupBy) {
      case 'status': key = t.status.replace('-', ' '); break;
      case 'priority': key = t.priority; break;
      case 'taskType': key = TASK_TYPE_SHORT[t.taskType]; break;
      case 'assignee': key = t.assignees[0] || 'Unassigned'; break;
      case 'project': key = t.projectMeta?.sprint || t.projectMeta?.epic || 'No Project'; break;
      case 'workflow': key = t.workflowMeta?.currentStage || 'No Workflow'; break;
    }
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  });
  return [...map.entries()].map(([label, list]) => ({ label, tasks: list }));
}

// ─── Report building ────────────────────────────────────────────────────────

export interface ReportGroup {
  label: string;
  rows: Record<string, string>[];
}

export function buildReport(tasks: Task[], config: ReportConfig): ReportGroup[] {
  const filtered = applyReportFilters(tasks, config.filters, config.overdueOnly);
  const sorted = [...filtered].sort((a, b) => {
    const av = getSortValue(a, config.sortBy);
    const bv = getSortValue(b, config.sortBy);
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return config.sortDir === 'asc' ? cmp : -cmp;
  });
  const groups = groupTasks(sorted, config.groupBy);
  return groups.map((g) => ({
    label: g.label,
    rows: g.tasks.map((t) => {
      const row: Record<string, string> = {};
      config.columns.forEach((col) => { row[col] = getColumnValue(t, col); });
      return row;
    }),
  }));
}

export function flattenGroups(groups: ReportGroup[], groupBy: GroupByKey): Record<string, string>[] {
  if (!groupBy) return groups[0]?.rows ?? [];
  const flat: Record<string, string>[] = [];
  groups.forEach((g) => {
    g.rows.forEach((row) => flat.push({ Group: g.label, ...row }));
  });
  return flat;
}

// ─── Presets (report categories & templates) ───────────────────────────────

interface ReportPreset {
  columns: ReportColumnKey[];
  filters: Partial<ReportFilters>;
  overdueOnly: boolean;
  groupBy: GroupByKey;
  sortBy: ReportColumnKey;
  sortDir: 'asc' | 'desc';
}

const BASE_COLUMNS: ReportColumnKey[] = ['id', 'title', 'taskType', 'status', 'priority', 'assignee', 'dueDate'];
const base = (): ReportPreset => ({ columns: BASE_COLUMNS, filters: {}, overdueOnly: false, groupBy: '', sortBy: 'dueDate', sortDir: 'asc' });

const PRESETS: Record<string, ReportPreset> = {
  'Task Summary Report': { ...base(), columns: ['id', 'title', 'taskType', 'status', 'priority', 'dueDate'] },
  'Task Details Report': { ...base(), columns: ['id', 'title', 'taskType', 'status', 'priority', 'assignee', 'createdBy', 'createdAt', 'dueDate', 'startDate', 'lastModified'] },
  'Task Status Report': { ...base(), groupBy: 'status', columns: ['id', 'title', 'status', 'assignee', 'dueDate'] },
  'Task Priority Report': { ...base(), groupBy: 'priority', columns: ['id', 'title', 'priority', 'status', 'assignee', 'dueDate'], sortBy: 'priority', sortDir: 'desc' },
  'Task Category Report': { ...base(), groupBy: 'taskType', columns: ['id', 'title', 'taskType', 'status', 'assignee'] },
  'Task Completion Report': { ...base(), filters: { status: 'completed' }, columns: ['id', 'title', 'taskType', 'assignee', 'createdAt', 'lastModified'] },
  'Overdue Task Report': { ...base(), overdueOnly: true, columns: ['id', 'title', 'taskType', 'priority', 'assignee', 'dueDate'] },

  'Assignee Workload Report': { ...base(), groupBy: 'assignee', columns: ['id', 'title', 'assignee', 'status', 'priority'] },
  'Team Productivity Report': { ...base(), groupBy: 'assignee', columns: ['id', 'title', 'assignee', 'status', 'createdAt', 'lastModified'] },
  'User Activity Report': { ...base(), columns: ['id', 'title', 'assignee', 'createdBy', 'lastModified'], sortBy: 'lastModified', sortDir: 'desc' },
  'Created By Report': { ...base(), groupBy: 'assignee', columns: ['id', 'title', 'createdBy', 'createdAt', 'status'] },

  'Workflow Status Report': { ...base(), filters: { taskCategory: 'workflow' }, groupBy: 'workflow', columns: ['id', 'title', 'workflowStage', 'status', 'assignee', 'dueDate'] },
  'Approval Report': { ...base(), filters: { taskCategory: 'workflow' }, columns: ['id', 'title', 'workflowStage', 'assignee', 'status'] },
  'SLA Report': { ...base(), filters: { taskCategory: 'workflow' }, columns: ['id', 'title', 'workflowStage', 'dueDate', 'status'] },
  'Escalation Report': { ...base(), filters: { taskCategory: 'workflow' }, columns: ['id', 'title', 'workflowStage', 'assignee', 'dueDate'] },

  'Sprint Report': { ...base(), filters: { taskCategory: 'project' }, groupBy: 'project', columns: ['id', 'title', 'status', 'assignee', 'dueDate'] },
  'Epic Report': { ...base(), filters: { taskCategory: 'project' }, columns: ['id', 'title', 'status', 'priority', 'assignee'] },
  'Milestone Report': { ...base(), filters: { taskCategory: 'project' }, columns: ['id', 'title', 'status', 'dueDate'] },
  'Project Progress Report': { ...base(), filters: { taskCategory: 'project' }, groupBy: 'status', columns: ['id', 'title', 'status', 'priority', 'assignee', 'dueDate'] },

  'AI Execution Report': { ...base(), filters: { taskCategory: 'ai' }, columns: ['id', 'title', 'status', 'createdAt', 'lastModified'] },
  'AI Success/Failure Report': { ...base(), filters: { taskCategory: 'ai' }, groupBy: 'status', columns: ['id', 'title', 'status', 'lastModified'] },
  'AI Usage Report': { ...base(), filters: { taskCategory: 'ai' }, columns: ['id', 'title', 'createdBy', 'createdAt'] },

  'Contract Summary Report': { ...base(), filters: { taskCategory: 'contract' }, columns: ['id', 'title', 'contractType', 'status', 'dueDate'] },
  'Expiring Contracts Report': { ...base(), filters: { taskCategory: 'contract' }, columns: ['id', 'title', 'contractType', 'dueDate'] },
  'Renewal Report': { ...base(), filters: { taskCategory: 'contract' }, columns: ['id', 'title', 'contractType', 'dueDate'] },
  'Compliance Report': { ...base(), filters: { taskCategory: 'contract' }, columns: ['id', 'title', 'contractType', 'status'] },
  'Contract Status Report': { ...base(), filters: { taskCategory: 'contract' }, groupBy: 'status', columns: ['id', 'title', 'contractType', 'status'] },

  'Executive Summary': { ...base(), groupBy: 'taskType', columns: ['id', 'title', 'taskType', 'status', 'priority', 'assignee'] },
  'Weekly Team Report': { ...base(), groupBy: 'assignee', columns: ['id', 'title', 'assignee', 'status', 'dueDate'] },
  'Monthly Task Report': { ...base(), columns: ['id', 'title', 'taskType', 'status', 'createdAt'] },
  'AI Task Report': { ...base(), filters: { taskCategory: 'ai' }, columns: ['id', 'title', 'status', 'createdAt', 'lastModified'] },
};

export function getReportPreset(name: string): ReportPreset {
  return PRESETS[name] ?? base();
}

// ─── Schedule math ──────────────────────────────────────────────────────────

export function computeNextRun(frequency: ScheduleFrequency, startDate: string, time: string, from: Date = new Date()): string {
  let next = new Date(`${startDate}T${time || '09:00'}:00`);
  if (Number.isNaN(next.getTime())) next = new Date();

  const advance = (d: Date): Date => {
    const nd = new Date(d);
    if (frequency === 'daily') nd.setDate(nd.getDate() + 1);
    else if (frequency === 'weekly') nd.setDate(nd.getDate() + 7);
    else if (frequency === 'monthly') nd.setMonth(nd.getMonth() + 1);
    else nd.setMonth(nd.getMonth() + 3);
    return nd;
  };

  let guard = 0;
  while (next <= from && guard < 1000) {
    next = advance(next);
    guard++;
  }
  return next.toISOString();
}

// ─── Generic export (arbitrary columns, optional grouping) ────────────────

function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportReportCSV(reportName: string, groups: ReportGroup[], columns: { key: ReportColumnKey; label: string }[], groupBy: GroupByKey): void {
  const headers = groupBy ? ['Group', ...columns.map((c) => c.label)] : columns.map((c) => c.label);
  const lines = [headers.join(',')];
  groups.forEach((g) => {
    g.rows.forEach((row) => {
      const values = groupBy ? [g.label, ...columns.map((c) => row[c.key] ?? '')] : columns.map((c) => row[c.key] ?? '');
      lines.push(values.map(escapeCSVValue).join(','));
    });
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportName.replace(/\s+/g, '-').toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportReportExcel(reportName: string, groups: ReportGroup[], columns: { key: ReportColumnKey; label: string }[], groupBy: GroupByKey): Promise<void> {
  const XLSX = await import('xlsx');
  const headers = groupBy ? ['Group', ...columns.map((c) => c.label)] : columns.map((c) => c.label);
  const rows: string[][] = [];
  groups.forEach((g) => {
    g.rows.forEach((row) => {
      rows.push(groupBy ? [g.label, ...columns.map((c) => row[c.key] ?? '')] : columns.map((c) => row[c.key] ?? ''));
    });
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${reportName.replace(/\s+/g, '-').toLowerCase()}.xlsx`);
}

export async function exportReportPDF(reportName: string, groups: ReportGroup[], columns: { key: ReportColumnKey; label: string }[], groupBy: GroupByKey): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text(reportName, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 14, 21);

  const headers = groupBy ? ['Group', ...columns.map((c) => c.label)] : columns.map((c) => c.label);
  const body: string[][] = [];
  groups.forEach((g) => {
    g.rows.forEach((row) => {
      body.push(groupBy ? [g.label, ...columns.map((c) => row[c.key] ?? '')] : columns.map((c) => row[c.key] ?? ''));
    });
  });

  autoTable(doc, {
    startY: 26,
    head: [headers],
    body,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [0, 200, 150], textColor: [10, 10, 15] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${reportName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
