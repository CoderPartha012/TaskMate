import React from 'react';
import { format } from 'date-fns';
import { Play, Loader2 } from 'lucide-react';
import { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { MetaFieldGroup } from '../common/MetaFieldGroup';
import { WORKFLOW_FIELDS, PROJECT_FIELDS, AI_FIELDS, CONTRACT_FIELDS, MetaFieldConfig } from '../common/metaFieldConfigs';
import { getWorkflowSLAStatus, getContractAlert } from '../../utils/taskAlerts';
import { buildMetaDraft } from '../../utils/metaDraft';

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/30';
const inputBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';

function safeDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : format(d, 'MMM d, yyyy');
}

function safeDateTime(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : format(d, 'MMM d, yyyy h:mm a');
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/[0.05] last:border-b-0">
      <span className={labelClass}>{label}</span>
      <span className="text-xs text-white/70 text-right break-words">{value}</span>
    </div>
  );
}

function ViewFields({ fields, values }: { fields: MetaFieldConfig[]; values: Record<string, string> }) {
  return (
    <div>
      {fields.map((f) => {
        const raw = values[f.key];
        const display = f.type === 'date' ? safeDate(raw) : (raw || '—');
        return <FieldRow key={f.key} label={f.label} value={display} />;
      })}
    </div>
  );
}

const EXECUTION_BADGE: Record<string, string> = {
  idle: 'bg-white/5 text-white/40',
  running: 'bg-blue-500/15 text-blue-400',
  success: 'bg-jade/15 text-jade',
  failed: 'bg-red-500/15 text-red-400',
};

interface TaskCategoryMetaSectionProps {
  task: Task;
  editing: boolean;
  metaDraft: Record<string, string>;
  onMetaChange: (key: string, value: string) => void;
}

export function TaskCategoryMetaSection({ task, editing, metaDraft, onMetaChange }: TaskCategoryMetaSectionProps) {
  const runAITask = useTaskStore((s) => s.runAITask);
  const slaStatus = getWorkflowSLAStatus(task);
  const contractAlert = getContractAlert(task);
  const viewValues = buildMetaDraft(task);

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <h3 className="font-display font-bold text-sm text-white mb-4">Category Details</h3>

      {task.taskType === 'general' && (
        editing ? (
          <div>
            <label className={labelClass}>Tags (comma-separated)</label>
            <input
              type="text"
              value={metaDraft.tags ?? ''}
              onChange={(e) => onMetaChange('tags', e.target.value)}
              placeholder="e.g. billing, Q3"
              className={inputBase}
            />
          </div>
        ) : (
          <FieldRow label="Tags" value={viewValues.tags || '—'} />
        )
      )}

      {task.taskType === 'workflow' && task.workflowMeta && (
        <>
          {slaStatus && slaStatus !== 'ok' && (
            <div className="mb-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                slaStatus === 'breached' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
              }`}>
                SLA {slaStatus === 'breached' ? 'Breached' : 'Due Soon'}
              </span>
            </div>
          )}
          {editing ? (
            <MetaFieldGroup fields={WORKFLOW_FIELDS} values={metaDraft} onChange={onMetaChange} />
          ) : (
            <ViewFields fields={WORKFLOW_FIELDS} values={viewValues} />
          )}
        </>
      )}

      {task.taskType === 'project' && task.projectMeta && (
        editing ? (
          <MetaFieldGroup fields={PROJECT_FIELDS} values={metaDraft} onChange={onMetaChange} />
        ) : (
          <ViewFields fields={PROJECT_FIELDS} values={viewValues} />
        )
      )}

      {task.taskType === 'ai' && task.aiMeta && (
        <>
          {editing ? (
            <MetaFieldGroup fields={AI_FIELDS} values={metaDraft} onChange={onMetaChange} />
          ) : (
            <ViewFields fields={AI_FIELDS} values={viewValues} />
          )}

          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40">AI Execution</h4>
              <button
                type="button"
                onClick={() => runAITask(task.id)}
                disabled={task.aiMeta.executionStatus === 'running'}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {task.aiMeta.executionStatus === 'running' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {task.aiMeta.executionStatus === 'running' ? 'Executing…' : 'Execute'}
              </button>
            </div>

            <FieldRow
              label="Execution Status"
              value={
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${EXECUTION_BADGE[task.aiMeta.executionStatus]}`}>
                  {task.aiMeta.executionStatus}
                </span>
              }
            />
            <FieldRow label="Started Time" value={safeDateTime(task.aiMeta.startedAt)} />
            <FieldRow label="Completed Time" value={safeDateTime(task.aiMeta.completedAt)} />
            {task.aiMeta.result && <FieldRow label="Execution Output" value={task.aiMeta.result} />}

            {task.aiMeta.logs.length > 0 && (
              <div className="mt-2">
                <p className={`${labelClass} mb-1`}>Execution Logs</p>
                <div className="bg-noir-800 rounded-lg p-2.5 space-y-0.5 max-h-32 overflow-y-auto">
                  {task.aiMeta.logs.map((line, i) => (
                    <p key={i} className="text-[10px] text-white/45 font-mono leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {task.taskType === 'contract' && task.contractMeta && (
        <>
          {contractAlert && contractAlert !== 'ok' && (
            <div className="mb-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                contractAlert === 'expired' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
              }`}>
                {contractAlert === 'expired' ? 'Expired' : 'Expiring Soon'}
              </span>
            </div>
          )}
          {editing ? (
            <MetaFieldGroup fields={CONTRACT_FIELDS} values={metaDraft} onChange={onMetaChange} />
          ) : (
            <ViewFields fields={CONTRACT_FIELDS} values={viewValues} />
          )}
        </>
      )}
    </div>
  );
}
