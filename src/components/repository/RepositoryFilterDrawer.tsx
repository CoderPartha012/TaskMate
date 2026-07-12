import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import { X, Filter, Clock, Bookmark } from 'lucide-react';
import { Priority, Status, TaskType } from '../../types';
import { TASK_TYPE_LABELS } from '../common/TaskTypeSelector';
import { MultiSelectDropdown } from '../common/MultiSelectDropdown';
import { WORKFLOW_FIELDS, CONTRACT_FIELDS } from '../common/metaFieldConfigs';
import { RepositoryFilters } from './repositoryFilterTypes';
import { useRepositoryViewStore } from '../../store/repositoryViewStore';

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/40';
const inputBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';

const APPROVAL_LEVEL_OPTIONS = WORKFLOW_FIELDS.find((f) => f.key === 'approvalLevel')?.options ?? [];
const COMPLIANCE_STATUS_OPTIONS = CONTRACT_FIELDS.find((f) => f.key === 'complianceStatus')?.options ?? [];
const CONTRACT_TYPE_OPTIONS = CONTRACT_FIELDS.find((f) => f.key === 'contractType')?.options ?? [];

const SLA_STATUS_OPTIONS: { value: RepositoryFilters['workflowSlaStatus']; label: string }[] = [
  { value: 'breached', label: 'Breached' },
  { value: 'due-soon', label: 'Due Soon' },
  { value: 'ok', label: 'On Track' },
];

const AI_EXECUTION_STATUS_OPTIONS: { value: RepositoryFilters['aiExecutionStatus']; label: string }[] = [
  { value: 'idle', label: 'Queued' },
  { value: 'running', label: 'Running' },
  { value: 'success', label: 'Successful' },
  { value: 'failed', label: 'Failed' },
];

function ymd(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

const DUE_DATE_QUICK_RANGES: { label: string; range: () => [string, string] }[] = [
  { label: 'Today', range: () => { const t = ymd(new Date()); return [t, t]; } },
  { label: 'This Week', range: () => [ymd(startOfWeek(new Date())), ymd(endOfWeek(new Date()))] },
  { label: 'This Month', range: () => [ymd(startOfMonth(new Date())), ymd(endOfMonth(new Date()))] },
  { label: 'This Quarter', range: () => [ymd(startOfQuarter(new Date())), ymd(endOfQuarter(new Date()))] },
];

interface FacetCounts {
  category: Partial<Record<TaskType, number>>;
  status: Partial<Record<Status, number>>;
  priority: Partial<Record<Priority, number>>;
}

interface RepositoryFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  draft: RepositoryFilters;
  onDraftChange: (patch: Partial<RepositoryFilters>) => void;
  onApply: () => void;
  onReset: () => void;
  onClearAll: () => void;
  counts: FacetCounts;
}

export function RepositoryFilterDrawer({
  open, onClose, draft, onDraftChange, onApply, onReset, onClearAll, counts,
}: RepositoryFilterDrawerProps) {
  const recentFilters = useRepositoryViewStore((s) => s.recentFilters);
  const savedFilterPresets = useRepositoryViewStore((s) => s.savedFilterPresets);
  const saveFilterPreset = useRepositoryViewStore((s) => s.saveFilterPreset);
  const deleteFilterPreset = useRepositoryViewStore((s) => s.deleteFilterPreset);

  const [presetName, setPresetName] = useState('');

  if (!open) return null;

  const showWorkflowFields = draft.taskCategory.length === 1 && draft.taskCategory[0] === 'workflow';
  const showContractFields = draft.taskCategory.length === 1 && draft.taskCategory[0] === 'contract';
  const showAIFields = draft.taskCategory.length === 1 && draft.taskCategory[0] === 'ai';

  const applyDueQuickRange = (range: () => [string, string]) => {
    const [from, to] = range();
    onDraftChange({ dueFrom: from, dueTo: to });
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    saveFilterPreset({ name: presetName.trim(), filters: draft });
    setPresetName('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-noir-700 border-l border-white/[0.08] z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-jade" aria-hidden="true" />
            Filters
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {recentFilters.length > 0 && (
            <div>
              <label className={`${labelClass} flex items-center gap-1`}>
                <Clock className="w-3 h-3" aria-hidden="true" />
                Recent
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {recentFilters.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onDraftChange(f)}
                    className="text-[10px] font-semibold text-white/50 hover:text-jade bg-white/[0.05] hover:bg-jade/10 rounded-full px-2.5 py-1 transition-colors"
                  >
                    Filter {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {savedFilterPresets.length > 0 && (
            <div>
              <label className={`${labelClass} flex items-center gap-1`}>
                <Bookmark className="w-3 h-3" aria-hidden="true" />
                Saved Filters
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {savedFilterPresets.map((p) => (
                  <span key={p.id} className="flex items-center gap-1 text-[10px] font-semibold text-white/50 bg-white/[0.05] rounded-full pl-2.5 pr-1 py-1">
                    <button type="button" onClick={() => onDraftChange(p.filters)} className="hover:text-jade transition-colors">
                      {p.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFilterPreset(p.id)}
                      aria-label={`Delete saved filter ${p.name}`}
                      className="text-white/25 hover:text-red-400 transition-colors p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Match filters</label>
            <div className="flex rounded-lg border border-white/[0.08] overflow-hidden mt-1.5 w-fit">
              {(['AND', 'OR'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onDraftChange({ filterLogic: mode })}
                  className={`text-[11px] font-bold px-3 py-1.5 transition-colors ${
                    draft.filterLogic === mode ? 'bg-jade text-noir-800' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {mode === 'AND' ? 'Match ALL (AND)' : 'Match ANY (OR)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Task ID</label>
            <input
              type="text"
              value={draft.taskId}
              onChange={(e) => onDraftChange({ taskId: e.target.value })}
              placeholder="e.g. a1b2c3d4"
              className={inputBase}
            />
          </div>

          <div>
            <label className={labelClass}>Task Title</label>
            <input
              type="text"
              value={draft.taskTitle}
              onChange={(e) => onDraftChange({ taskTitle: e.target.value })}
              placeholder="Search by title"
              className={inputBase}
            />
          </div>

          <div>
            <label className={labelClass}>Task Category</label>
            <div className="mt-1.5">
              <MultiSelectDropdown
                label="categories"
                options={(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((t) => ({
                  value: t, label: TASK_TYPE_LABELS[t], count: counts.category[t] ?? 0,
                }))}
                selected={draft.taskCategory}
                onChange={(v) => onDraftChange({ taskCategory: v as TaskType[] })}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <div className="mt-1.5">
              <MultiSelectDropdown
                label="statuses"
                options={[
                  { value: 'pending', label: 'Pending', count: counts.status.pending ?? 0 },
                  { value: 'in-progress', label: 'In Progress', count: counts.status['in-progress'] ?? 0 },
                  { value: 'completed', label: 'Completed', count: counts.status.completed ?? 0 },
                ]}
                selected={draft.status}
                onChange={(v) => onDraftChange({ status: v as Status[] })}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Priority</label>
            <div className="mt-1.5">
              <MultiSelectDropdown
                label="priorities"
                options={[
                  { value: 'low', label: 'Low', count: counts.priority.low ?? 0 },
                  { value: 'medium', label: 'Medium', count: counts.priority.medium ?? 0 },
                  { value: 'high', label: 'High', count: counts.priority.high ?? 0 },
                ]}
                selected={draft.priority}
                onChange={(v) => onDraftChange({ priority: v as Priority[] })}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Assignee</label>
            <input
              type="text"
              value={draft.assignee}
              onChange={(e) => onDraftChange({ assignee: e.target.value })}
              placeholder="Name or email"
              className={inputBase}
            />
          </div>

          <div>
            <label className={labelClass}>Created By</label>
            <input
              type="text"
              value={draft.createdBy}
              onChange={(e) => onDraftChange({ createdBy: e.target.value })}
              placeholder="Name"
              className={inputBase}
            />
          </div>

          <div>
            <label className={labelClass}>Created Date (Range)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={draft.createdFrom}
                onChange={(e) => onDraftChange({ createdFrom: e.target.value })}
                aria-label="Created date from"
                className={inputBase}
              />
              <input
                type="date"
                value={draft.createdTo}
                onChange={(e) => onDraftChange({ createdTo: e.target.value })}
                aria-label="Created date to"
                className={inputBase}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Due Date (Range)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={draft.dueFrom}
                onChange={(e) => onDraftChange({ dueFrom: e.target.value })}
                aria-label="Due date from"
                className={inputBase}
              />
              <input
                type="date"
                value={draft.dueTo}
                onChange={(e) => onDraftChange({ dueTo: e.target.value })}
                aria-label="Due date to"
                className={inputBase}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {DUE_DATE_QUICK_RANGES.map(({ label, range }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => applyDueQuickRange(range)}
                  className="text-[10px] font-semibold text-white/50 hover:text-jade bg-white/[0.05] hover:bg-jade/10 rounded-full px-2.5 py-1 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {showWorkflowFields && (
            <div className="pt-3 border-t border-amber-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80 mb-3">
                Workflow-specific filters
              </p>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Approval Level</label>
                  <select
                    value={draft.workflowApprovalLevel}
                    onChange={(e) => onDraftChange({ workflowApprovalLevel: e.target.value })}
                    className={inputBase}
                  >
                    <option value="">Any level</option>
                    {APPROVAL_LEVEL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>SLA Status</label>
                  <select
                    value={draft.workflowSlaStatus}
                    onChange={(e) => onDraftChange({ workflowSlaStatus: e.target.value as RepositoryFilters['workflowSlaStatus'] })}
                    className={inputBase}
                  >
                    <option value="">Any SLA status</option>
                    {SLA_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {showContractFields && (
            <div className="pt-3 border-t border-red-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/80 mb-3">
                Contract-specific filters
              </p>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Contract Type</label>
                  <select
                    value={draft.contractType}
                    onChange={(e) => onDraftChange({ contractType: e.target.value })}
                    className={inputBase}
                  >
                    <option value="">Any type</option>
                    {CONTRACT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Compliance Status</label>
                  <select
                    value={draft.contractComplianceStatus}
                    onChange={(e) => onDraftChange({ contractComplianceStatus: e.target.value })}
                    className={inputBase}
                  >
                    <option value="">Any status</option>
                    {COMPLIANCE_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {showAIFields && (
            <div className="pt-3 border-t border-violet-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/80 mb-3">
                AI-specific filters
              </p>
              <div>
                <label className={labelClass}>Execution Status</label>
                <select
                  value={draft.aiExecutionStatus}
                  onChange={(e) => onDraftChange({ aiExecutionStatus: e.target.value as RepositoryFilters['aiExecutionStatus'] })}
                  className={inputBase}
                >
                  <option value="">Any status</option>
                  {AI_EXECUTION_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-white/[0.07]">
            <label className={labelClass}>Save this filter as…</label>
            <div className="flex gap-2 mt-1.5">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g. High priority workflow"
                className={`${inputBase} mt-0 flex-1`}
              />
              <button
                type="button"
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="text-xs font-bold px-3 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/[0.07] space-y-2">
          <button
            type="button"
            onClick={onApply}
            className="w-full text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors"
          >
            Apply Filter
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 text-xs font-semibold px-4 py-2 rounded-lg border border-white/[0.1] text-white/60 hover:text-white transition-colors"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="flex-1 text-xs font-semibold px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
