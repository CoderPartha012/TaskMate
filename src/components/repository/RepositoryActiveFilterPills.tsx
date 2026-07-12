import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { TASK_TYPE_SHORT } from '../common/TaskTypeSelector';
import { QuickFilterKey, RepositoryFilters } from './repositoryFilterTypes';

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function safeDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : format(d, 'MMM d');
}

const QUICK_FILTER_LABELS: Record<QuickFilterKey, string> = {
  all: 'All Tasks',
  'my-tasks': 'My Tasks',
  'due-today': 'Due Today',
  'due-week': 'Due This Week',
  overdue: 'Overdue',
  'high-priority': 'High Priority',
  completed: 'Completed',
};

interface Pill {
  id: string;
  text: string;
  onRemove: () => void;
}

interface RepositoryActiveFilterPillsProps {
  filters: RepositoryFilters;
  quickFilter: QuickFilterKey;
  onRemoveField: (patch: Partial<RepositoryFilters>) => void;
  onRemoveQuickFilter: () => void;
  onClearAll: () => void;
}

export function RepositoryActiveFilterPills({
  filters, quickFilter, onRemoveField, onRemoveQuickFilter, onClearAll,
}: RepositoryActiveFilterPillsProps) {
  const pills: Pill[] = [];

  if (quickFilter !== 'all') {
    pills.push({ id: 'quick', text: QUICK_FILTER_LABELS[quickFilter], onRemove: onRemoveQuickFilter });
  }
  if (filters.taskId) pills.push({ id: 'taskId', text: `Task ID: ${filters.taskId}`, onRemove: () => onRemoveField({ taskId: '' }) });
  if (filters.taskTitle) pills.push({ id: 'taskTitle', text: `Title: ${filters.taskTitle}`, onRemove: () => onRemoveField({ taskTitle: '' }) });
  if (filters.taskCategory.length > 0) {
    pills.push({
      id: 'taskCategory',
      text: `Category: ${filters.taskCategory.map((c) => TASK_TYPE_SHORT[c]).join(', ')}`,
      onRemove: () => onRemoveField({ taskCategory: [] }),
    });
  }
  if (filters.status.length > 0) {
    pills.push({
      id: 'status',
      text: `Status: ${filters.status.map((s) => capitalize(s.replace('-', ' '))).join(', ')}`,
      onRemove: () => onRemoveField({ status: [] }),
    });
  }
  if (filters.priority.length > 0) {
    pills.push({
      id: 'priority',
      text: `Priority: ${filters.priority.map(capitalize).join(', ')}`,
      onRemove: () => onRemoveField({ priority: [] }),
    });
  }
  if (filters.assignee) pills.push({ id: 'assignee', text: `Assignee: ${filters.assignee}`, onRemove: () => onRemoveField({ assignee: '' }) });
  if (filters.createdBy) pills.push({ id: 'createdBy', text: `Created By: ${filters.createdBy}`, onRemove: () => onRemoveField({ createdBy: '' }) });
  if (filters.createdFrom || filters.createdTo) {
    pills.push({
      id: 'created',
      text: `Created: ${filters.createdFrom ? safeDate(filters.createdFrom) : '…'} – ${filters.createdTo ? safeDate(filters.createdTo) : '…'}`,
      onRemove: () => onRemoveField({ createdFrom: '', createdTo: '' }),
    });
  }
  if (filters.dueFrom || filters.dueTo) {
    pills.push({
      id: 'due',
      text: `Due Date: ${filters.dueFrom ? safeDate(filters.dueFrom) : '…'} – ${filters.dueTo ? safeDate(filters.dueTo) : '…'}`,
      onRemove: () => onRemoveField({ dueFrom: '', dueTo: '' }),
    });
  }
  if (filters.workflowApprovalLevel) {
    pills.push({ id: 'approvalLevel', text: `Approval Level: ${filters.workflowApprovalLevel}`, onRemove: () => onRemoveField({ workflowApprovalLevel: '' }) });
  }
  if (filters.workflowSlaStatus) {
    pills.push({ id: 'slaStatus', text: `SLA: ${filters.workflowSlaStatus}`, onRemove: () => onRemoveField({ workflowSlaStatus: '' }) });
  }
  if (filters.contractComplianceStatus) {
    pills.push({ id: 'compliance', text: `Compliance: ${filters.contractComplianceStatus}`, onRemove: () => onRemoveField({ contractComplianceStatus: '' }) });
  }
  if (filters.contractType) {
    pills.push({ id: 'contractType', text: `Contract Type: ${filters.contractType}`, onRemove: () => onRemoveField({ contractType: '' }) });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35 shrink-0">Filtering by:</span>
      {pills.map((pill) => (
        <span
          key={pill.id}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70 bg-white/[0.04] border border-white/[0.08] rounded-full px-2.5 py-1"
        >
          {pill.text}
          <button
            type="button"
            onClick={pill.onRemove}
            aria-label={`Remove filter: ${pill.text}`}
            className="text-white/35 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-auto text-[11px] font-semibold text-jade hover:text-jade-light transition-colors shrink-0"
      >
        Clear all
      </button>
    </div>
  );
}
