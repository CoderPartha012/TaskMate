import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AnalyticsFilters, EMPTY_ANALYTICS_FILTERS } from './analyticsFilterTypes';
import { TASK_TYPE_SHORT } from '../common/TaskTypeSelector';

interface Segment {
  key: string;
  label: string;
  clearFieldsFromHere: (keyof AnalyticsFilters)[];
}

interface AnalyticsBreadcrumbProps {
  filters: AnalyticsFilters;
  onChange: (next: AnalyticsFilters) => void;
}

function clearFields<K extends keyof AnalyticsFilters>(filters: AnalyticsFilters, fields: K[]): AnalyticsFilters {
  const next = { ...filters };
  fields.forEach((f) => { next[f] = EMPTY_ANALYTICS_FILTERS[f]; });
  return next;
}

export function AnalyticsBreadcrumb({ filters, onChange }: AnalyticsBreadcrumbProps) {
  const segments: Segment[] = [];

  if (filters.dateFrom || filters.dateTo) {
    segments.push({
      key: 'date',
      label: `Date: ${filters.dateFrom || '…'} – ${filters.dateTo || '…'}`,
      clearFieldsFromHere: ['dateFrom', 'dateTo', 'taskCategory', 'status', 'priority', 'assignee', 'createdBy'],
    });
  }
  if (filters.taskCategory) {
    segments.push({
      key: 'category',
      label: `Category: ${TASK_TYPE_SHORT[filters.taskCategory]}`,
      clearFieldsFromHere: ['taskCategory', 'status', 'priority', 'assignee', 'createdBy'],
    });
  }
  if (filters.status) {
    segments.push({
      key: 'status',
      label: `Status: ${filters.status.replace('-', ' ')}`,
      clearFieldsFromHere: ['status', 'priority', 'assignee', 'createdBy'],
    });
  }
  if (filters.priority) {
    segments.push({
      key: 'priority',
      label: `Priority: ${filters.priority}`,
      clearFieldsFromHere: ['priority', 'assignee', 'createdBy'],
    });
  }
  if (filters.assignee) {
    segments.push({
      key: 'assignee',
      label: `Assignee: ${filters.assignee}`,
      clearFieldsFromHere: ['assignee', 'createdBy'],
    });
  }
  if (filters.createdBy) {
    segments.push({
      key: 'createdBy',
      label: `Created By: ${filters.createdBy}`,
      clearFieldsFromHere: ['createdBy'],
    });
  }

  if (segments.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-3">
      <button
        type="button"
        onClick={() => onChange(EMPTY_ANALYTICS_FILTERS)}
        className="font-semibold text-white/50 hover:text-jade transition-colors"
      >
        All Tasks
      </button>
      {segments.map((seg) => (
        <React.Fragment key={seg.key}>
          <ChevronRight className="w-3 h-3 text-white/20" aria-hidden="true" />
          <button
            type="button"
            onClick={() => onChange(clearFields(filters, seg.clearFieldsFromHere))}
            className="font-semibold text-jade hover:text-jade-light transition-colors"
          >
            {seg.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
